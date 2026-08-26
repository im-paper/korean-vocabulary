// 어휘 콘텐츠 생성기 — scripts/seed.mjs → data/words.js
//
// 뜻을 사람이 적지 않고 국립국어원 표준국어대사전에서 받아옵니다. (PROMPT.md 6.1)
// 기억에 의존해 적으면 원문과 미묘하게 달라지고, 사전을 표방하면서 사전이 아닌 것이
// 됩니다. 이 앱이 파는 것이 신뢰라서 그 지점이 가장 위험합니다.
//
// 실행:  node --env-file=.env.local scripts/fill-words.mjs
//
// 사전 API 특성은 api/dict.js 와 같습니다.
//  - search.do 는 JSON, view.do 는 XML 만 응답합니다.
//  - num 이 10 미만이면 빈 응답이 옵니다.
//  - 표제어에 붙임표가 들어갑니다("아득-하다").

import { writeFileSync } from "node:fs";
import { SEED, DAILY_SEED } from "./seed.mjs";

const KEY = process.env.STDICT_API_KEY;
if (!KEY) {
  console.error("STDICT_API_KEY 가 없습니다. --env-file=.env.local 을 붙여 실행하세요.");
  process.exit(1);
}

const SEARCH_URL = "https://stdict.korean.go.kr/api/search.do";
const VIEW_URL = "https://stdict.korean.go.kr/api/view.do";

const cdata = (tag, xml) => {
  const m = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`));
  return m ? m[1].trim() : null;
};
const blocks = (tag, xml) => {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g");
  return [...xml.matchAll(re)].map((m) => m[1]);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 사전은 같은 한자를 옛 글자꼴로 싣기도 합니다(絶/絕, 眞/真 …).
// 겉모습만 다르고 같은 글자라서, 비교하기 전에 한 쪽으로 맞춰 둡니다.
const HANJA_VARIANTS = {
  "絶": "絕", "真": "眞", "郞": "郎", "沒": "没", "說": "説",
};
const normHanja = (s) =>
  (s || "")
    .replace(/[-\s]/g, "")
    .split("")
    .map((c) => HANJA_VARIANTS[c] ?? c)
    .join("");

// 한 낱말의 뜻을 사전에서 가져옵니다.
//
// 동음이의어를 반드시 걸러야 합니다. '자조'로 검색하면 自助(스스로 애씀)와
// 自嘲(자기를 비웃음)가 함께 나오는데, 앞의 것을 집으면 뜻이 통째로 틀립니다.
// 그래서 seed 에 적어 둔 한자와 일치하는 표제어를 먼저 고릅니다. (PROMPT.md 6.1)
async function lookup(word, hanja = null, senseIndex = 0) {
  const search = new URLSearchParams({
    key: KEY,
    q: word,
    req_type: "json",
    method: "exact",
    // 동음이의어가 많은 낱말은 찾는 것이 뒤쪽에 있습니다. 넉넉히 받아 전부 봅니다.
    // (10 미만으로 낮추면 빈 응답이 옵니다)
    num: "30",
  });
  const sres = await fetch(`${SEARCH_URL}?${search}`);
  const stext = await sres.text();
  if (!stext.trim()) return null;

  const items = JSON.parse(stext)?.channel?.item;
  const entries = !items ? [] : Array.isArray(items) ? items : [items];
  if (!entries.length) return null;

  const senses = [];
  for (const entry of entries) {
    if (!entry.target_code) continue;
    const view = new URLSearchParams({
      key: KEY,
      method: "target_code",
      q: String(entry.target_code),
    });
    const vres = await fetch(`${VIEW_URL}?${view}`);
    if (!vres.ok) continue;
    const xml = await vres.text();

    const headword = (cdata("word", xml) || entry.word || word).replace(/-/g, "");
    const sourceUrl = `https://stdict.korean.go.kr/search/searchView.do?word_no=${entry.target_code}`;
    // 이 표제어의 한자. 동음이의어를 가려내는 열쇠입니다.
    const origin = normHanja(cdata("original_language", xml));

    for (const sense of blocks("sense_info", xml)) {
      const meaning = cdata("definition", sense);
      if (!meaning) continue;
      const examples = blocks("example_info", sense)
        .map((info) => {
          const text = cdata("example", info);
          if (!text) return null;
          const src = cdata("source", info);
          return src ? `${text} ≪${src}≫` : text;
        })
        .filter(Boolean);
      senses.push({ word: headword, meaning, examples, sourceUrl, origin });
    }
  }
  if (!senses.length) return null;

  // 한자가 일치하는 뜻만 남깁니다. 하나도 없으면 못 찾은 것으로 봅니다 —
  // 엉뚱한 뜻을 넣느니 비워 두고 사람이 보게 하는 편이 낫습니다.
  if (hanja) {
    const want = normHanja(hanja);
    const matched = senses.filter((s) => s.origin === want);
    if (!matched.length) return { notFoundHanja: true, senses };
    return matched[Math.min(senseIndex, matched.length - 1)];
  }
  return senses[Math.min(senseIndex, senses.length - 1)];
}

// 유의어는 사전 API 가 주지 않으므로 비워 둡니다.
// 뜻→단어 역방향 탐색은 '느낌으로 찾기'(api/reverse.js)가 맡습니다.
async function build(entry, id) {
  const found = await lookup(entry.word, entry.hanja ?? null, entry.sense || 0);
  await sleep(120); // 사전 서버를 몰아치지 않습니다

  if (!found) {
    console.warn(`  ✗ ${entry.word} — 사전에서 찾지 못해 건너뜁니다`);
    return null;
  }
  // 한자가 안 맞으면 엉뚱한 뜻이 들어가므로 넣지 않고 알립니다.
  if (found.notFoundHanja) {
    const seen = [...new Set(found.senses.map((s) => s.origin || "(한자 없음)"))];
    console.warn(
      `  ✗ ${entry.word}(${entry.hanja}) — 사전에는 ${seen.join(", ")} 뿐입니다. seed 의 한자를 확인하세요.`
    );
    return null;
  }
  console.log(`  ✓ ${entry.word}${entry.hanja ? `(${entry.hanja})` : ""}`);
  return {
    id,
    word: found.word,
    hanja: entry.hanja ?? null,
    meaning: found.meaning,
    example: entry.example ?? "",
    dictExample: found.examples[0] ?? null,
    synonyms: [],
    level: entry.level,
    sourceUrl: found.sourceUrl,
  };
}

// 고정 ID — {책슬러그}-{섹션번호}-{로마자}. 한 번 정하면 바꾸지 않습니다. (PROMPT.md 8.2)
// 로마자 변환기를 두지 않고, 한글 표제어를 그대로 씁니다. 어차피 파일 안에서만 쓰이고
// 사람이 읽기에도 이쪽이 낫습니다. 중요한 것은 '순서를 쓰지 않는다'는 점입니다.
const wordId = (slug, sectionNo, word) => `${slug}-${sectionNo}-${word}`;

const out = [];
for (const book of SEED) {
  console.log(`\n${book.book}`);
  const sections = [];
  for (const [i, section] of book.sections.entries()) {
    console.log(` ${section.name}`);
    const words = [];
    for (const w of section.words) {
      const built = await build(w, wordId(book.slug, i + 1, w.word));
      if (built) words.push(built);
    }
    sections.push({ name: section.name, words });
  }
  out.push({
    slug: book.slug,
    book: book.book,
    author: book.author,
    featured: book.featured ?? false,
    featuredNote: book.featuredNote ?? null,
    sections,
  });
}

console.log(`\n샘플 어휘`);
const daily = [];
for (const [i, w] of DAILY_SEED.entries()) {
  const built = await build(w, `daily-${i + 1}`);
  if (built) daily.push(built);
}

const total = out.reduce(
  (n, b) => n + b.sections.reduce((m, s) => m + s.words.length, 0),
  0
);

const header = `// 단어 콘텐츠 — 앱의 자산이므로 프로젝트 파일에 둡니다. (PROMPT.md 8.1)
//
// ⚠ 이 파일은 손으로 고치지 마세요. scripts/fill-words.mjs 가 만들어 냅니다.
//    단어를 더하거나 빼려면 scripts/seed.mjs 를 고친 뒤 다시 실행하세요.
//      node --env-file=.env.local scripts/fill-words.mjs
//
// 뜻(meaning)과 출처(sourceUrl)는 국립국어원 표준국어대사전에서 그대로 받아온
// 값입니다. 사람이 고쳐 쓰지 않습니다. (PROMPT.md 6.1)
// 학습용 예문(example)은 우리가 새로 씁니다. 비어 있으면 그 자리는 사용자가 쓴
// 문장이 채웁니다. (6.2 · 5.3)
//
// 만든 시각 기준 단어 ${total}개 + 샘플 ${daily.length}개

export const BOOKS = ${JSON.stringify(out, null, 2)};

export const DAILY = ${JSON.stringify(daily, null, 2)};

// 모든 단어를 한 줄로 펼칩니다.
export function allWords() {
  return [...BOOKS.flatMap((b) => b.sections.flatMap((s) => s.words)), ...DAILY];
}

export function findWord(id) {
  return allWords().find((w) => w.id === id) ?? null;
}
`;

writeFileSync(new URL("../data/words.js", import.meta.url), header);
console.log(`\n완료 — 책 어휘 ${total}개, 샘플 ${daily.length}개를 data/words.js 에 썼습니다.`);
