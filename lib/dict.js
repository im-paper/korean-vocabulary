// 표준국어대사전 조회 (서버리스 함수 /api/dict 를 통해 호출)

export async function lookup(word) {
  const res = await fetch(`/api/dict?q=${encodeURIComponent(word)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "사전 조회에 실패했습니다.");
  return json.results;
}

// 예문에서 표제어의 활용형을 찾아 {{...}} 로 감싼다.
// 예: "아득하다" + "아득한 옛날." → "{{아득한}} 옛날."
// 활용형은 어간이 유지되므로("아득-하다" → "아득한"), 어간으로 시작하는 어절을 찾는다.
export function markAnswer(word, example) {
  const stem = getStem(word);
  if (!stem) return example;

  // ≪저자, 작품≫ 부분은 건드리지 않는다.
  const [body, ...rest] = example.split("≪");
  const suffix = rest.length ? "≪" + rest.join("≪") : "";

  const clean = word.replace(/-/g, "").trim();
  const tokens = body.split(/(\s+)/);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (/^\s+$/.test(token)) continue;

    // 명사처럼 표제어가 그대로 나오면 표제어만 빈칸으로 하고 조사는 밖에 남긴다.
    //   "익살을 떨었다" → "{{익살}}을 떨었다"
    if (token.startsWith(clean)) {
      tokens[i] = `{{${clean}}}${token.slice(clean.length)}`;
      return tokens.join("") + suffix;
    }

    // 용언처럼 활용된 경우에는 어절의 한글 부분 전체를 빈칸으로 한다.
    //   "아득한 옛날" → "{{아득한}} 옛날"
    if (token.startsWith(stem)) {
      const m = token.match(/^([가-힣]+)(.*)$/);
      if (!m) continue;
      tokens[i] = `{{${m[1]}}}${m[2]}`;
      return tokens.join("") + suffix;
    }
  }
  return example;
}

// 표제어에서 활용되지 않는 어간을 뽑는다.
function getStem(word) {
  const clean = word.replace(/-/g, "").trim();
  if (!clean) return null;
  // '-하다', '-되다', '-스럽다' 등은 활용되므로 앞부분만 어간으로 쓴다.
  for (const tail of ["스럽다", "롭다", "하다", "되다", "지다", "다"]) {
    if (clean.length > tail.length && clean.endsWith(tail)) {
      return clean.slice(0, clean.length - tail.length);
    }
  }
  return clean;
}
