// 밑줄 — 읽다가 걸린 문장을 옮겨 적는 자리 (PROMPT.md 5.7)
//
// 명대사를 앱이 주지 않고 사용자에게서 받습니다. 이유가 셋입니다.
//
//   1) 번역본 문장을 우리가 실어 나르지 않습니다. 본인이 본인 기기에 옮겨 적는
//      것이고 남에게 보이지 않으므로, 11절의 인용 금지에 걸리지 않습니다.
//   2) 옮겨 적기는 소비가 아니라 산출입니다. 지어내기보다 마찰이 훨씬 낮아서
//      '한 줄 쓰기'로 가는 계단이 됩니다. (3절 — 쓰기로 끝난다)
//   3) 밑줄 안에 이미 배운 단어가 들어 있으면 그 단어를 다시 만난 것으로 셉니다.
//      예문 교차 노출(6.3)을 사용자가 직접 만드는 셈입니다.
//
// 3번이 이 기능의 값입니다. 예쁜 카드는 어디에나 있지만, 내가 옮겨 적은 문장에서
// 내가 배운 단어가 켜지는 순간은 이 앱에서만 일어납니다.

export const MAX_MARK = 300; // 한 문장이 기본이지만 긴 문장도 막지 않습니다

// 밑줄 안에 들어 있는, 이미 아는 단어를 찾습니다.
//
// 활용형까지는 보지 않습니다. "익살로"는 "익살"을 품고 있어 잡히지만,
// "아득한"은 "아득하다"를 품고 있지 않아 놓칩니다. 놓친 쪽은 조용히 넘어갑니다 —
// 여기서 억지로 맞히려다 엉뚱한 단어를 켜면 신뢰가 먼저 깨집니다.
export function findWords(text, words) {
  const s = String(text || "");
  const hit = [];
  for (const w of words) {
    if (w.word && s.includes(w.word) && !hit.includes(w.id)) hit.push(w.id);
  }
  return hit;
}

// 밑줄 문장에서 아는 단어에 표시를 입힌 HTML 을 돌려줍니다.
// 화면 쪽 함수라 escape 를 여기서 함께 합니다. 밖에서 다시 escape 하지 마세요.
export function highlight(text, words, escape) {
  let html = escape(text);
  // 긴 단어부터 바꿔야 짧은 단어가 긴 단어 안쪽을 먼저 먹지 않습니다.
  const found = [...words]
    .filter((w) => w.word && String(text).includes(w.word))
    .sort((a, b) => b.word.length - a.word.length);

  const done = new Set();
  for (const w of found) {
    if (done.has(w.word)) continue;
    done.add(w.word);
    const safe = escape(w.word);
    // 이미 <mark> 안에 들어간 자리를 또 건드리지 않도록 태그 밖만 바꿉니다.
    html = html
      .split(/(<mark>.*?<\/mark>)/g)
      .map((chunk) =>
        chunk.startsWith("<mark>") ? chunk : chunk.split(safe).join(`<mark>${safe}</mark>`)
      )
      .join("");
  }
  return html;
}

// 오늘 보여 줄 밑줄 하나를 고릅니다.
//
// 난수를 쓰지 않는 이유는 되새김 피드와 같습니다 — 새로고침할 때마다 바뀌면
// '오늘의 한 문장'이 되지 못하고 그냥 목록이 됩니다. (review.js 의 stableRank 와 같은 뜻)
function stableRank(seed, salt) {
  let h = 0;
  for (const ch of seed + salt) h = (h * 31 + ch.codePointAt(0)) % 100003;
  return h;
}

export function pickMark(list, salt = "") {
  if (!list?.length) return null;
  return [...list].sort(
    (a, b) => stableRank(a.createdAt, salt) - stableRank(b.createdAt, salt)
  )[0];
}
