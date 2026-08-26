// 민음사 세계문학전집 목록 생성기 → data/minumsa.js
//
// 왜 손으로 적지 않는가 —
// 어휘의 뜻을 사전에서 받아오는 것과 같은 이유입니다. 기억으로 적으면 번호와 저자가
// 그럴듯하게 틀립니다. 목록은 사실이라서 틀리면 그대로 거짓말이 됩니다.
//
// 출처: 한국어 위키백과 '세계문학전집 목록' (CC BY-SA)
//       출판사별 칸이 있는 표에서 '민음' 칸에 번호가 적힌 책만 골라냅니다.
//
// 실행:  node scripts/build-minumsa.mjs

import { writeFileSync } from "node:fs";

const SOURCE =
  "https://ko.wikipedia.org/w/index.php?title=%EC%84%B8%EA%B3%84%EB%AC%B8%ED%95%99%EC%A0%84%EC%A7%91_%EB%AA%A9%EB%A1%9D&action=raw";
const SOURCE_PAGE = "https://ko.wikipedia.org/wiki/세계문학전집_목록";

// [[문서명|보일 이름]] → 보일 이름 / [[문서명]] → 문서명
function unlink(s) {
  return s
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/''+/g, "")
    .trim();
}

const raw = await fetch(SOURCE).then((r) => r.text());

// 표의 한 줄은 "|저서 || 저자 || 종수 || 일신 || … || 민음 || …" 모양입니다.
// 주석(<!-- 민음( ) -->)은 '그 출판사 판이 없다'는 뜻이므로 먼저 걷어냅니다.
const books = [];
const seen = new Set();

for (const line of raw.split("\n")) {
  if (!line.startsWith("|") || line.startsWith("|-") || line.startsWith("|}")) continue;

  const clean = line.replace(/<!--[\s\S]*?-->/g, "");
  const m = clean.match(/민음\(([\d]+)(?:-[\d]+)?\)/);
  if (!m) continue;

  const cells = clean.slice(1).split("||");
  const title = unlink(cells[0] || "").replace(/\s*·\s*/g, " · ");
  const author = unlink(cells[1] || "");
  if (!title || !author) continue;

  const no = Number(m[1]);
  const key = `${no}-${title}`;
  if (seen.has(key)) continue;
  seen.add(key);

  books.push({ no, title, author });
}

books.sort((a, b) => a.no - b.no || a.title.localeCompare(b.title));

const out = `// 민음사 세계문학전집 목록 (PROMPT.md — 책이 기준입니다)
//
// ⚠ 이 파일은 손으로 고치지 마세요. scripts/build-minumsa.mjs 가 만들어 냅니다.
//      node scripts/build-minumsa.mjs
//
// 여기 담긴 것은 '책 목록'뿐입니다. 어휘는 들어 있지 않습니다.
// 사용자가 이 목록에서 책을 골라 책장에 꽂으면, 그 책은 빈 채로 시작합니다.
// 읽다가 만난 단어를 '찾기'로 담으면서 자기 손으로 채웁니다.
// 그것이 남이 고른 단어 리스트와 이 앱이 갈라지는 지점입니다.
//
// 출처: 한국어 위키백과 '세계문학전집 목록' (CC BY-SA)
//       ${SOURCE_PAGE}
// 전집 ${books.length}권

export const MINUMSA = ${JSON.stringify(books, null, 1)};
`;

writeFileSync(new URL("../data/minumsa.js", import.meta.url), out);
console.log(`민음사 세계문학전집 ${books.length}권을 data/minumsa.js 에 썼습니다.`);
console.log(
  "앞부분:",
  books.slice(0, 5).map((b) => `${b.no} ${b.title}`).join(" / ")
);
