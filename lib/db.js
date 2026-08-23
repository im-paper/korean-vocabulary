import { supabase } from "./supabase.js";

// 세트(묶음)와 그 안의 단어를 한 번에 읽어온다.
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
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user?.id;
  if (!user_id) throw new Error("로그인이 필요합니다.");

  const { data, error } = await supabase
    .from("sets")
    .insert({ ...fields, user_id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addWords(setId, words) {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user?.id;
  if (!user_id) throw new Error("로그인이 필요합니다.");

  // 기존 단어 뒤에 이어붙이도록 시작 번호를 구한다.
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

// ── 학습 기록 ────────────────────────────────────────────

export async function fetchProgress() {
  const { data, error } = await supabase
    .from("progress")
    .select("word_id, attempts, correct, incorrect, last_reviewed_at");
  if (error) throw error;

  const map = {};
  (data || []).forEach((row) => {
    map[row.word_id] = row;
  });
  return map;
}

export async function recordAttempt(wordId, isCorrect) {
  const { data: userData } = await supabase.auth.getUser();
  const user_id = userData.user?.id;
  if (!user_id) return;

  // 기존 기록을 읽어 누적한 뒤 덮어쓴다.
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
