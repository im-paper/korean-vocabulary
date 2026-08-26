// 저장소 구현 — 브라우저 localStorage (PROMPT.md 8.4)
//
// 로그인 없이 바로 쓸 수 있게 하는 것이 목적입니다.
// 데이터 모양은 클라우드로 옮길 때 그대로 들고 갈 수 있게 맞춰 두었습니다.

const KEYS = {
  progress: "paper.progress",
  sentences: "paper.sentences",
  days: "paper.days",
  settings: "paper.settings",
  myWords: "paper.myWords",
  shelf: "paper.shelf",
  myBooks: "paper.myBooks",
  marks: "paper.marks",
};

const MAX_SENTENCE = 200; // 6.6 — 한 줄이 기본이지만 더 쓰고 싶으면 막지 않는다
const MAX_MARK = 300; // 5.7 — 옮겨 적는 것이라 내 문장보다 조금 넉넉하게

export const needsAuth = false;

// ── 저수준 읽기/쓰기 ─────────────────────────────────────
//
// 시크릿 창이나 저장 공간이 꽉 찬 경우 localStorage 가 예외를 던집니다.
// 그때도 앱이 멈추지 않고 그냥 기록이 안 남는 쪽으로 흘러가게 합니다.

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn("기록을 저장하지 못했습니다:", err);
    return false;
  }
}

function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ── 학습 기록 ────────────────────────────────────────────

const emptyProgress = () => ({
  known: false,
  interval: 0, // 현재 복습 간격(일). 0이면 아직 안 배움
  dueAt: null, // 다음 등장일
  attempts: 0,
  correct: 0,
  lastSeenAt: null,
});

export async function getProgress() {
  return read(KEYS.progress, {});
}

export async function setProgress(wordId, patch) {
  const all = read(KEYS.progress, {});
  all[wordId] = { ...emptyProgress(), ...(all[wordId] || {}), ...patch };
  write(KEYS.progress, all);
  return all[wordId];
}

// 퀴즈 한 문제의 결과를 누적합니다.
// 복습 간격(interval, dueAt)은 여기서 건드리지 않습니다.
// 망각곡선 계산은 6단계에서 붙입니다. (PROMPT.md 7)
export async function recordAttempt(wordId, isCorrect) {
  const all = read(KEYS.progress, {});
  const prev = { ...emptyProgress(), ...(all[wordId] || {}) };
  all[wordId] = {
    ...prev,
    attempts: prev.attempts + 1,
    correct: prev.correct + (isCorrect ? 1 : 0),
    lastSeenAt: today(),
  };
  write(KEYS.progress, all);
  return all[wordId];
}

export async function setKnown(wordId, known) {
  return setProgress(wordId, { known: Boolean(known) });
}

// ── 내가 쓴 문장 (PROMPT.md 6.6) ─────────────────────────
//
// 채점하지 않습니다. 맞춤법도 어법도 보지 않고 그대로 담아 둡니다.

export async function getSentences() {
  return read(KEYS.sentences, {});
}

export async function addSentence(wordId, text) {
  const clean = String(text || "").trim().slice(0, MAX_SENTENCE);
  if (!clean) return null;

  const all = read(KEYS.sentences, {});
  const entry = { text: clean, createdAt: new Date().toISOString() };
  // 최신 것이 앞에 오게 둡니다.
  all[wordId] = [entry, ...(all[wordId] || [])];
  write(KEYS.sentences, all);
  return entry;
}

// 고쳐 쓰기. 첨삭이 아니라 본인이 직접 고치는 것입니다. (PROMPT.md 5.6)
// createdAt 은 그대로 둡니다. 고쳤다고 순서가 바뀌면 기록이 아니라 목록이 됩니다.
export async function updateSentence(wordId, createdAt, text) {
  const clean = String(text || "").trim().slice(0, MAX_SENTENCE);
  if (!clean) return null;

  const all = read(KEYS.sentences, {});
  const list = all[wordId];
  if (!list) return null;

  const target = list.find((s) => s.createdAt === createdAt);
  if (!target) return null;

  target.text = clean;
  write(KEYS.sentences, all);
  return target;
}

export async function deleteSentence(wordId, createdAt) {
  const all = read(KEYS.sentences, {});
  if (!all[wordId]) return;
  all[wordId] = all[wordId].filter((s) => s.createdAt !== createdAt);
  if (all[wordId].length === 0) delete all[wordId];
  write(KEYS.sentences, all);
}

// ── 밑줄 (PROMPT.md 5.7) ─────────────────────────────────
//
// 읽다가 걸린 문장을 옮겨 적은 것입니다. 단어가 아니라 '책'에 매답니다 —
// 한 문장은 단어 하나에 속하지 않기 때문입니다.
//
// 그 안에 어떤 단어가 들어 있는지(wordIds)는 담을 때 한 번 계산해 함께 적어 둡니다.
// 볼 때마다 본문을 훑지 않으려는 것이고, 나중에 단어를 더 배워도 예전 밑줄의
// 계산이 흔들리지 않게 하려는 것이기도 합니다.

export async function getMarks() {
  return read(KEYS.marks, {});
}

export async function addMark(bookSlug, text, { page = null, wordIds = [] } = {}) {
  const clean = String(text || "").trim().slice(0, MAX_MARK);
  if (!clean || !bookSlug) return null;

  const all = read(KEYS.marks, {});
  const entry = {
    text: clean,
    page,
    wordIds,
    createdAt: new Date().toISOString(),
  };
  // 나중에 담은 것이 먼저 보입니다.
  all[bookSlug] = [entry, ...(all[bookSlug] || [])];
  write(KEYS.marks, all);
  return entry;
}

export async function deleteMark(bookSlug, createdAt) {
  const all = read(KEYS.marks, {});
  if (!all[bookSlug]) return;
  all[bookSlug] = all[bookSlug].filter((m) => m.createdAt !== createdAt);
  if (all[bookSlug].length === 0) delete all[bookSlug];
  write(KEYS.marks, all);
}

// ── 내가 담은 단어 (PROMPT.md 5.5) ───────────────────────
//
// '찾기'에서 담은 단어입니다. 콘텐츠 파일의 단어와 같은 모양을 씁니다.
// 뜻과 출처는 반드시 표준국어대사전에서 온 것만 담습니다. (6.1)

const readMyWords = () => {
  const v = read(KEYS.myWords, []);
  return Array.isArray(v) ? v : [];
};

export async function getMyWords() {
  return readMyWords();
}

// bookSlug — 이 단어를 어느 책에서 만났는지. 이것이 개인 코퍼스의 핵심입니다.
// 담은 단어가 한곳에 뭉쳐 있으면 그냥 단어장이지만, 책에 붙어 있으면
// '내가 그 책에서 건진 단어'가 됩니다.
export async function addMyWord(word, bookSlug = null) {
  const list = readMyWords();

  // 고정 ID. 한 번 정하면 바꾸지 않습니다. 배열 순서를 ID로 쓰지 않습니다. (8.2)
  // 같은 단어의 다른 뜻을 또 담을 수 있으므로 뒤에 번호를 붙여 구분합니다.
  const base = `my-${word.word}`;
  let id = base;
  for (let n = 2; list.some((w) => w.id === id); n++) id = `${base}-${n}`;

  const entry = { ...word, id, bookSlug, addedAt: new Date().toISOString() };
  // 나중에 담은 것이 먼저 보입니다.
  write(KEYS.myWords, [entry, ...list]);
  return entry;
}

export async function deleteMyWord(id) {
  write(
    KEYS.myWords,
    readMyWords().filter((w) => w.id !== id)
  );
}

// ── 내가 꽂은 책 ─────────────────────────────────────────
//
// 민음사 세계문학전집 목록에서 고르거나 직접 적어 넣은 책입니다.
// 어휘는 비어 있는 채로 시작합니다. 읽다가 만난 단어를 '찾기'로 담으면서 채웁니다.
// 빈 책은 결함이 아니라 이 앱의 본류입니다 — 남이 고른 리스트가 아니라 내 맥락.

const readMyBooks = () => {
  const v = read(KEYS.myBooks, []);
  return Array.isArray(v) ? v : [];
};

export async function getMyBooks() {
  return readMyBooks();
}

// slug 는 고정 ID 입니다. 민음사 책은 전집 번호로, 직접 넣은 책은 제목으로 만듭니다.
export async function addMyBook({ book, author, no = null }) {
  const title = String(book || "").trim();
  if (!title) return null;

  const list = readMyBooks();
  const slug = no ? `minumsa-${no}` : `own-${title}`;
  if (list.some((b) => b.slug === slug)) return list.find((b) => b.slug === slug);

  const entry = {
    slug,
    book: title,
    author: String(author || "").trim() || null,
    no,
    addedAt: new Date().toISOString(),
  };
  write(KEYS.myBooks, [...list, entry]);
  return entry;
}

// 책을 빼도 담은 단어는 지우지 않습니다. 사용자가 만든 것을 조용히 버리지 않습니다.
export async function removeMyBook(slug) {
  write(
    KEYS.myBooks,
    readMyBooks().filter((b) => b.slug !== slug)
  );
}

// ── 내 책장 ──────────────────────────────────────────────
//
// 어떤 책이 내 책장에 꽂혀 있는지입니다. '이달의 책'은 여기에 없다가,
// 사용자가 직접 꽂아야 들어옵니다. 남이 고른 것을 기본으로 얹지 않습니다.

export async function getShelf() {
  const v = read(KEYS.shelf, null);
  return Array.isArray(v) ? v : null; // null = 아직 한 번도 정한 적 없음
}

export async function addToShelf(slug) {
  const list = (await getShelf()) || [];
  if (!list.includes(slug)) write(KEYS.shelf, [...list, slug]);
  return read(KEYS.shelf, []);
}

export async function removeFromShelf(slug) {
  const list = (await getShelf()) || [];
  write(KEYS.shelf, list.filter((s) => s !== slug));
  return read(KEYS.shelf, []);
}

// ── 달력 · 스트릭 ────────────────────────────────────────

export async function getDays() {
  return read(KEYS.days, {});
}

// 오늘 칸의 숫자를 더합니다. book 은 마지막으로 본 책 이름으로 덮어씁니다.
export async function recordDay({ words = 0, sentences = 0, book = null } = {}) {
  const all = read(KEYS.days, {});
  const key = today();
  const prev = all[key] || { words: 0, sentences: 0, book: null };
  all[key] = {
    words: prev.words + words,
    sentences: prev.sentences + sentences,
    book: book ?? prev.book,
  };
  write(KEYS.days, all);
  return all[key];
}

// ── 설정 ────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  level: 2, // 2단계부터 시작한다 (PROMPT.md 6.4)
  dailyCount: null, // null = 읽을 섹션에 맞춰 유동 (PROMPT.md 12)
};

export async function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) };
}

export async function saveSettings(patch) {
  const next = { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}), ...patch };
  write(KEYS.settings, next);
  return next;
}

// ── 전체 지우기 ──────────────────────────────────────────

export async function resetAll() {
  Object.values(KEYS).forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* 지우지 못해도 앱은 계속 돕니다 */
    }
  });
}
