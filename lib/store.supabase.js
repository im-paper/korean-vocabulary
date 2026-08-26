// 저장소 구현 — Supabase (PROMPT.md 9.2 · 11단계)
//
// 지금은 쓰지 않습니다. config.js 의 STORE 가 "supabase" 일 때만 불러옵니다.
// 지웠다가 다시 짜는 낭비를 막으려고, 예전 lib/db.js 를 여기로 옮겨 두었습니다.
//
// ⚠ 11단계에서 켜기 전에 반드시 해야 할 일
//   1) words 테이블에 slug 열 추가 — 콘텐츠 파일의 고정 ID(예: "ningen-2-iksal")를
//      그대로 담습니다. 지금 progress 는 uuid 인 word_id 로 단어를 가리키는데,
//      로컬 기록은 slug 로 가리키므로 그대로는 맞물리지 않습니다.
//   2) days / settings 저장 위치 결정 (별도 테이블 또는 user_metadata)
//   3) 로컬에 쌓인 paper.* 를 올리는 마이그레이션
//
// sentences 테이블은 준비돼 있습니다(schema.sql 4번). 아래 문장 함수는 그대로 씁니다.
//
// 그 전까지, 아래에서 아직 뒷받침되지 않는 함수는 조용히 실패하는 대신
// 무엇이 없는지 말하는 오류를 던집니다.

import { supabase } from "./supabase.js";

export const needsAuth = true;

const NOT_READY = (무엇) =>
  new Error(
    `${무엇}은(는) 아직 클라우드 저장을 지원하지 않습니다. ` +
      `lib/store.supabase.js 위쪽의 준비 목록을 먼저 처리하세요.`
  );

async function userId() {
  const { data } = await supabase.auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error("로그인이 필요합니다.");
  return id;
}

// ── 학습 기록 ────────────────────────────────────────────

export async function getProgress() {
  const { data, error } = await supabase
    .from("progress")
    .select("word_id, attempts, correct, incorrect, last_reviewed_at");
  if (error) throw error;

  const map = {};
  (data || []).forEach((row) => {
    map[row.word_id] = {
      known: false,
      interval: 0,
      dueAt: null,
      attempts: row.attempts,
      correct: row.correct,
      lastSeenAt: row.last_reviewed_at,
    };
  });
  return map;
}

export async function setProgress(wordId, patch) {
  const user_id = await userId();
  const { error } = await supabase
    .from("progress")
    .upsert({ user_id, word_id: wordId, ...patch }, { onConflict: "user_id,word_id" });
  if (error) throw error;
}

export async function recordAttempt(wordId, isCorrect) {
  const user_id = await userId();

  // 기존 기록을 읽어 누적한 뒤 덮어씁니다.
  const { data: existing } = await supabase
    .from("progress")
    .select("attempts, correct, incorrect")
    .eq("word_id", wordId)
    .maybeSingle();

  const next = {
    user_id,
    word_id: wordId,
    attempts: (existing?.attempts || 0) + 1,
    correct: (existing?.correct || 0) + (isCorrect ? 1 : 0),
    incorrect: (existing?.incorrect || 0) + (isCorrect ? 0 : 1),
    last_reviewed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("progress")
    .upsert(next, { onConflict: "user_id,word_id" });
  if (error) throw error;
}

export async function setKnown() {
  throw NOT_READY("'알아요' 표시");
}

// ── 내가 쓴 문장 (PROMPT.md 6.6) ─────────────────────────
//
// 채점하지 않습니다. 받은 그대로 담아 둡니다.
// 단어는 uuid 가 아니라 콘텐츠 파일의 고정 ID(word_slug)로 가리킵니다.
// 브라우저에 쌓인 기록을 변환 없이 그대로 올리려는 것입니다.

const MAX_SENTENCE = 200;

export async function getSentences() {
  const { data, error } = await supabase
    .from("sentences")
    .select("word_slug, text, created_at")
    .order("created_at", { ascending: false }); // 나중에 쓴 것이 먼저 보인다
  if (error) throw error;

  // 로컬 구현과 같은 모양으로 맞춥니다. { [wordId]: [{ text, createdAt }] }
  const map = {};
  (data || []).forEach((row) => {
    (map[row.word_slug] ||= []).push({ text: row.text, createdAt: row.created_at });
  });
  return map;
}

export async function addSentence(wordId, text) {
  const clean = String(text || "").trim().slice(0, MAX_SENTENCE);
  if (!clean) return null;

  const user_id = await userId();
  const { data, error } = await supabase
    .from("sentences")
    .insert({ user_id, word_slug: wordId, text: clean })
    .select("text, created_at")
    .single();
  if (error) throw error;
  return { text: data.text, createdAt: data.created_at };
}

// 고쳐 쓰기. created_at 은 건드리지 않습니다. (PROMPT.md 5.6)
export async function updateSentence(wordId, createdAt, text) {
  const clean = String(text || "").trim().slice(0, MAX_SENTENCE);
  if (!clean) return null;

  const { data, error } = await supabase
    .from("sentences")
    .update({ text: clean })
    .eq("word_slug", wordId)
    .eq("created_at", createdAt)
    .select("text, created_at")
    .maybeSingle();
  if (error) throw error;
  return data ? { text: data.text, createdAt: data.created_at } : null;
}

// 삭제는 언제든 가능합니다. 지우는 열쇠는 로컬 구현과 같은 createdAt 입니다.
export async function deleteSentence(wordId, createdAt) {
  const { error } = await supabase
    .from("sentences")
    .delete()
    .eq("word_slug", wordId)
    .eq("created_at", createdAt);
  if (error) throw error;
}

// ── 밑줄 (PROMPT.md 5.7) ─────────────────────────────────
//
// 11단계에서 켤 때 marks 테이블을 만듭니다. sentences 와 같은 모양이면 됩니다 —
// user_id / book_slug / text / word_slugs(배열) / created_at.
// 문장과 마찬가지로 남에게 보이지 않으므로 RLS 는 본인만 읽고 쓰게 둡니다. (6.6)

export async function getMarks() {
  throw NOT_READY("밑줄");
}
export async function addMark() {
  throw NOT_READY("밑줄");
}
export async function deleteMark() {
  throw NOT_READY("밑줄");
}

// ── 내가 담은 단어 ───────────────────────────────────────
//
// 기존 words 테이블은 set_id 를 요구하는데, '찾기'로 담은 단어는 아직 속할
// 세트가 없습니다. 11단계에서 담는 곳(전용 세트 또는 새 테이블)을 정한 뒤 켭니다.

export async function getMyWords() {
  throw NOT_READY("내가 담은 단어");
}
export async function addMyWord() {
  throw NOT_READY("내가 담은 단어");
}
export async function deleteMyWord() {
  throw NOT_READY("내가 담은 단어");
}

// ── 내가 꽂은 책 ─────────────────────────────────────────

export async function getMyBooks() {
  throw NOT_READY("내가 꽂은 책");
}
export async function addMyBook() {
  throw NOT_READY("내가 꽂은 책");
}
export async function removeMyBook() {
  throw NOT_READY("내가 꽂은 책");
}

// ── 내 책장 ──────────────────────────────────────────────

export async function getShelf() {
  throw NOT_READY("내 책장");
}
export async function addToShelf() {
  throw NOT_READY("내 책장");
}
export async function removeFromShelf() {
  throw NOT_READY("내 책장");
}

// ── 달력 · 설정 ──────────────────────────────────────────

export async function getDays() {
  throw NOT_READY("달력 기록");
}
export async function recordDay() {
  throw NOT_READY("달력 기록");
}
export async function getSettings() {
  throw NOT_READY("설정");
}
export async function saveSettings() {
  throw NOT_READY("설정");
}
export async function resetAll() {
  throw NOT_READY("전체 지우기");
}

// ── 세트 · 단어 CRUD ─────────────────────────────────────
//
// 단어 콘텐츠는 이제 프로젝트 파일(data/words.js)에 있으므로 앱 화면은
// 이 함수들을 쓰지 않습니다. 11단계에서 '찾기'로 담은 사용자 단어를
// 클라우드에 올릴 때 다시 쓰려고 남겨 둡니다.

export async function fetchSets(track) {
  const { data, error } = await supabase
    .from("sets")
    .select(
      `id, track, set_date, book, author, set_label, note,
       words ( id, word, meaning, example, synonyms, source_url, sort_order )`
    )
    .eq("track", track)
    .order("set_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((set) => ({
    ...set,
    words: [...(set.words || [])].sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function createSet(fields) {
  const user_id = await userId();
  const { data, error } = await supabase
    .from("sets")
    .insert({ ...fields, user_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addWords(setId, words) {
  const user_id = await userId();

  // 기존 단어 뒤에 이어붙이도록 시작 번호를 구합니다.
  const { count } = await supabase
    .from("words")
    .select("id", { count: "exact", head: true })
    .eq("set_id", setId);

  const rows = words.map((w, i) => ({
    set_id: setId,
    user_id,
    word: w.word,
    meaning: w.meaning,
    example: w.example,
    synonyms: w.synonyms || [],
    source_url: w.source_url || null,
    sort_order: (count || 0) + i,
  }));

  const { data, error } = await supabase.from("words").insert(rows).select();
  if (error) throw error;
  return data;
}

export async function deleteWord(wordId) {
  const { error } = await supabase.from("words").delete().eq("id", wordId);
  if (error) throw error;
}

export async function deleteSet(setId) {
  const { error } = await supabase.from("sets").delete().eq("id", setId);
  if (error) throw error;
}
