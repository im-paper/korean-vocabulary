// 표준국어대사전 API 프록시 (Vercel 서버리스 함수)
//
// 브라우저에서 사전 API를 직접 부르면 인증키가 노출되고 CORS에도 막히기 때문에,
// 이 함수를 거쳐서 호출합니다. 인증키는 Vercel 환경 변수 STDICT_API_KEY에 저장됩니다.
//
// 사용법: /api/dict?q=단어

const SEARCH_URL = "https://stdict.korean.go.kr/api/search.do";
const VIEW_URL = "https://stdict.korean.go.kr/api/view.do";

// 뜻풀이/예문에 섞여 있는 사전 표기용 마크업을 정리한다.
function clean(text) {
  if (!text) return "";
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function handler(req, res) {
  const key = process.env.STDICT_API_KEY;
  if (!key) {
    return res
      .status(500)
      .json({ error: "STDICT_API_KEY 환경 변수가 설정되지 않았습니다." });
  }

  const q = (req.query.q || "").trim();
  if (!q) {
    return res.status(400).json({ error: "검색어(q)가 필요합니다." });
  }

  try {
    // 1) 표제어 검색 → target_code 확보
    const searchParams = new URLSearchParams({
      key,
      q,
      req_type: "json",
      method: "exact",
      num: "10",
    });
    const searchRes = await fetch(`${SEARCH_URL}?${searchParams}`);
    if (!searchRes.ok) {
      return res.status(502).json({ error: "사전 검색에 실패했습니다." });
    }
    const searchJson = await searchRes.json();
    const items = searchJson?.channel?.item;
    const list = Array.isArray(items) ? items : items ? [items] : [];

    if (list.length === 0) {
      return res.status(404).json({ error: `'${q}'을(를) 사전에서 찾지 못했습니다.` });
    }

    // 2) 후보별 상세 조회 → 예문(용례) 확보
    const results = [];
    for (const item of list.slice(0, 5)) {
      const targetCode = item.target_code;
      if (!targetCode) continue;

      const viewParams = new URLSearchParams({
        key,
        method: "target_code",
        q: String(targetCode),
        req_type: "json",
      });
      const viewRes = await fetch(`${VIEW_URL}?${viewParams}`);
      if (!viewRes.ok) continue;

      const viewJson = await viewRes.json();
      const entry = viewJson?.channel?.item;
      if (!entry) continue;

      const posInfo = toArray(entry.pos_info)[0];
      const commPattern = toArray(posInfo?.comm_pattern_info)[0];
      const senses = toArray(commPattern?.sense_info);

      for (const sense of senses) {
        const examples = toArray(sense.example_info)
          .map((e) => clean(e.example))
          .filter(Boolean);

        results.push({
          word: clean(entry.word),
          pos: clean(posInfo?.pos) || null,
          meaning: clean(sense.definition),
          examples,
          sourceUrl: `https://stdict.korean.go.kr/search/searchView.do?word_no=${entry.word_no || targetCode}`,
        });
      }
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: `'${q}'의 뜻풀이를 가져오지 못했습니다.` });
    }

    // 예문이 있는 뜻을 앞쪽에 배치해 고르기 쉽게 한다.
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
