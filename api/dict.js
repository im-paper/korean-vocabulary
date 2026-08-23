// 표준국어대사전 API 프록시 (Vercel 서버리스 함수)
//
// 브라우저에서 사전 API를 직접 부르면 인증키가 노출되고 CORS에도 막히기 때문에
// 이 함수를 거쳐 호출합니다. 인증키는 Vercel 환경 변수 STDICT_API_KEY에 있습니다.
//
// 사용법: /api/dict?q=단어
//
// 사전 API 특성 (실제 응답을 확인해 맞춘 부분):
//  - search.do 는 JSON을 지원하지만, view.do 는 XML만 응답합니다.
//  - num 파라미터는 10 미만이면 빈 응답이 옵니다.
//  - 표제어에는 붙임표가 들어갑니다("아득-하다").

const SEARCH_URL = "https://stdict.korean.go.kr/api/search.do";
const VIEW_URL = "https://stdict.korean.go.kr/api/view.do";

const cdata = (tag, xml) => {
  const m = xml.match(
    new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`)
  );
  return m ? m[1].trim() : null;
};

const blocks = (tag, xml) => {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g");
  return [...xml.matchAll(re)].map((m) => m[1]);
};

// view.do 의 XML에서 뜻풀이와 예문을 뽑아낸다.
function parseView(xml) {
  return blocks("sense_info", xml).map((sense) => ({
    meaning: cdata("definition", sense),
    examples: blocks("example_info", sense)
      .map((info) => {
        const text = cdata("example", info);
        if (!text) return null;
        const source = cdata("source", info);
        // 기존 데이터와 같은 표기로 맞춘다: 문장 ≪저자, 작품≫
        return source ? `${text} ≪${source}≫` : text;
      })
      .filter(Boolean),
  }));
}

export default async function handler(req, res) {
  const key = process.env.STDICT_API_KEY;
  if (!key) {
    return res
      .status(500)
      .json({ error: "STDICT_API_KEY 환경 변수가 설정되지 않았습니다." });
  }

  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "검색어(q)가 필요합니다." });

  try {
    // 1) 표제어 검색 → target_code 확보
    const searchParams = new URLSearchParams({
      key,
      q,
      req_type: "json",
      method: "exact",
      num: "10", // 10 미만은 빈 응답이 오므로 낮추지 말 것
    });
    const searchRes = await fetch(`${SEARCH_URL}?${searchParams}`);
    if (!searchRes.ok) {
      return res.status(502).json({ error: "사전 검색에 실패했습니다." });
    }

    const searchText = await searchRes.text();
    if (!searchText.trim()) {
      return res.status(404).json({ error: `'${q}'을(를) 찾지 못했습니다.` });
    }

    const searchJson = JSON.parse(searchText);
    const entries = toArray(searchJson?.channel?.item);
    if (entries.length === 0) {
      return res
        .status(404)
        .json({ error: `'${q}'을(를) 사전에서 찾지 못했습니다.` });
    }

    // 2) 표제어별 상세 조회 → 예문 확보 (동음이의어가 있으면 여러 건)
    const results = [];
    for (const entry of entries.slice(0, 4)) {
      const targetCode = entry.target_code;
      if (!targetCode) continue;

      const viewParams = new URLSearchParams({
        key,
        method: "target_code",
        q: String(targetCode),
        // view.do 는 JSON을 지원하지 않으므로 XML로 받는다
      });
      const viewRes = await fetch(`${VIEW_URL}?${viewParams}`);
      if (!viewRes.ok) continue;

      const xml = await viewRes.text();
      const headword = (cdata("word", xml) || entry.word || q).replace(/-/g, "");
      const sourceUrl = `https://stdict.korean.go.kr/search/searchView.do?word_no=${targetCode}`;

      for (const sense of parseView(xml)) {
        if (!sense.meaning) continue;
        results.push({
          word: headword,
          pos: entry.pos || null,
          meaning: sense.meaning,
          examples: sense.examples,
          sourceUrl,
        });
      }
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: `'${q}'의 뜻풀이를 가져오지 못했습니다.` });
    }

    // 예문이 있는 뜻을 앞에 둬서 고르기 쉽게 한다.
    results.sort((a, b) => b.examples.length - a.examples.length);

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    return res.status(200).json({ query: q, results });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "사전 조회 중 오류가 발생했습니다.", detail: String(err) });
  }
}

function toArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}
