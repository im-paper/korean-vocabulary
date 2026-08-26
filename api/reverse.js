// 느낌으로 찾기 (Vercel 서버리스 함수) — PROMPT.md 5.5 ②
//
// 표준국어대사전은 `단어 → 뜻` 한 방향만 받습니다. 그런데 사람이 실제로 막히는 건
// `뜻 → 단어` 쪽입니다. "억지로 참는데 겉으론 태연한 척하는 그 단어"는 검색창에
// 넣을 수가 없습니다. 그 질의를 받는 자리가 여기입니다.
//
// 역할 분담이 이 파일의 전부입니다.
//   탐색은 모델이 — 상태 설명을 받아 후보 낱말을 떠올립니다
//   신뢰는 사전이 — 뜻과 출처는 여기서 만들지 않습니다. 후보 '이름'만 돌려주고,
//                   브라우저가 그 이름을 다시 /api/dict 로 조회해 뜻을 채웁니다.
//                   사전에 없는 낱말은 그 단계에서 자연히 걸러집니다.
//
// 사용법: POST /api/reverse  { "q": "억지로 참는데 겉으론 태연한 척" }
// 인증키는 Vercel 환경 변수 ANTHROPIC_API_KEY 에 둡니다. 브라우저로 나가지 않습니다.

import Anthropic from "@anthropic-ai/sdk";

const MAX_Q = 200; // 한 줄 설명이면 충분합니다. 비용과 오남용을 같이 막습니다.
const MAX_WORDS = 8;

const SYSTEM = `너는 한국어 낱말을 떠올려 주는 역할이다.

사용자는 표현하고 싶은 상태나 장면을 설명하지만 그것을 가리키는 낱말을 모른다.
그 상태에 해당하는 한국어 낱말 후보를 떠올려라.

규칙
- 낱말만 한 줄에 하나씩 출력한다. 번호, 기호, 설명, 뜻풀이를 붙이지 않는다.
- 뜻풀이는 절대 쓰지 마라. 뜻은 표준국어대사전에서 따로 가져온다.
- 표준국어대사전에 실려 있을 법한 표제어 형태로 쓴다. 용언은 기본형으로 쓴다.
  (예: "태연하다", "짐짓", "위악")
- 최대 ${MAX_WORDS}개. 확신이 없으면 적게 내도 된다. 억지로 채우지 마라.
- 글을 쓸 때 실제로 꺼내 쓸 만한, 문어체에서 살아 있는 낱말을 우선한다.
- 지나치게 어려운 고사성어나 사어(死語)는 피한다.`;

const client = new Anthropic();

export default async function handler(req, res) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res
      .status(500)
      .json({ error: "ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다." });
  }

  // 본문은 POST 로 받습니다. 설명이 길고 URL 에 남기기에도 적절하지 않습니다.
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 로 요청해 주세요." });
  }

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body;
  const q = String(body?.q || "").trim().slice(0, MAX_Q);
  if (!q) {
    return res.status(400).json({ error: "찾고 싶은 느낌을 적어 주세요." });
  }

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 300,
      // 낱말을 떠올리는 짧은 일이라 깊이 생각할 필요가 없습니다. 응답이 빨라집니다.
      output_config: { effort: "low" },
      system: SYSTEM,
      messages: [{ role: "user", content: q }],
    });

    // 안전 거부는 예외가 아니라 정상 응답으로 옵니다. content 를 읽기 전에 봅니다.
    if (response.stop_reason === "refusal") {
      return res.status(422).json({ error: "이 표현으로는 찾아 드리기 어려워요." });
    }

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const words = text
      .split("\n")
      .map((line) => line.replace(/^[\s\d.·\-*)]+/, "").trim())
      .filter((line) => /^[가-힣]{1,10}$/.test(line)) // 한글 낱말만 통과시킵니다
      .filter((line, i, arr) => arr.indexOf(line) === i)
      .slice(0, MAX_WORDS);

    if (words.length === 0) {
      return res.status(404).json({ error: "떠오르는 낱말이 없었어요. 다르게 적어 보세요." });
    }

    return res.status(200).json({ query: q, words });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "잠시 뒤에 다시 시도해 주세요." });
    }
    return res
      .status(500)
      .json({ error: "후보를 찾는 중 오류가 발생했습니다.", detail: String(err) });
  }
}

function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
