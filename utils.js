export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// 예문 속 {{정답}} 표시를 파싱한다.
// plain: 카드에 보여줄 일반 문장 / blank: 퀴즈용 빈칸 문장 / answer: 정답
export function parseExample(example) {
  // '찾기'로 담은 단어에는 학습용 예문이 없을 수 있습니다.
  example = String(example ?? "");
  const match = example.match(/\{\{(.+?)\}\}/);
  const answer = match ? match[1] : null;
  const plain = example.replace(/\{\{(.+?)\}\}/g, "$1");
  const blank = example.replace(/\{\{(.+?)\}\}/g, "____");
  return { plain, blank, answer };
}
