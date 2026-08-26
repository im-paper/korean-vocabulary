// 저장소 어댑터 (PROMPT.md 9.2)
//
// 앱 화면 코드는 이 파일의 함수만 부릅니다. 데이터가 브라우저에 있는지
// 클라우드에 있는지 화면 코드는 알지 못해야 합니다.
//
// 구현체 두 개가 같은 함수 시그니처를 갖습니다.
//   lib/store.local.js     localStorage      (현재)
//   lib/store.supabase.js  Supabase          (11단계)
//
// 어느 쪽을 쓸지는 config.js 의 STORE 한 줄이 정합니다.
//
// local 구현은 위에서 정적으로 불러옵니다. 크기가 작아 부담이 없고,
// 무엇보다 '나중에 불러오는 파일'(동적 import)은 브라우저가 강력 새로고침을 해도
// 옛 것을 계속 쓰는 일이 있습니다. 그러면 앱 본체만 새것이고 저장소만 옛것이 되어
// "그런 기능 없다"는 오류가 납니다. 실제로 그 일을 겪어서 이렇게 바꿨습니다.
//
// supabase 구현은 supabase-js 를 통째로 받아 오므로 local 모드에서 그 비용을
// 치를 이유가 없습니다. 이쪽만 동적 import 로 남깁니다.

import { STORE } from "../config.js";
import * as localStore from "./store.local.js";

const impl =
  STORE === "supabase" ? await import("./store.supabase.js") : localStore;

// 이 저장소가 로그인을 요구하는가. 부팅 화면 분기에 씁니다.
export const needsAuth = impl.needsAuth;

// ── 학습 기록 ────────────────────────────────────────────
// getProgress()            → { [wordId]: { known, interval, dueAt, attempts, correct, lastSeenAt } }
export const getProgress = impl.getProgress;
// setProgress(wordId, 바꿀값) → 기존 기록에 덮어씌웁니다(병합).
export const setProgress = impl.setProgress;
// recordAttempt(wordId, 맞았는지) → 퀴즈 한 문제 결과를 누적합니다.
export const recordAttempt = impl.recordAttempt;
// setKnown(wordId, 아는지) → "알아요" 표시. 이후 출제에서 빠집니다.
export const setKnown = impl.setKnown;

// ── 내가 쓴 문장 ─────────────────────────────────────────
// getSentences()  → { [wordId]: [{ text, createdAt }, ...] }  최신순
export const getSentences = impl.getSentences;
export const addSentence = impl.addSentence;
// updateSentence(wordId, createdAt, 새 글) → 쓴 날짜는 유지한 채 글만 바꿉니다.
export const updateSentence = impl.updateSentence;
export const deleteSentence = impl.deleteSentence;

// ── 밑줄 ─────────────────────────────────────────────────
// 읽다가 걸린 문장을 옮겨 적은 것. 단어가 아니라 책에 매답니다.
// getMarks() → { [bookSlug]: [{ text, page, wordIds, createdAt }, ...] } 최신순
export const getMarks = impl.getMarks;
// addMark(bookSlug, 문장, { page, wordIds }) → wordIds 는 담을 때 한 번만 계산합니다.
export const addMark = impl.addMark;
export const deleteMark = impl.deleteMark;

// ── 내가 담은 단어 ───────────────────────────────────────
// '찾기'로 담은 단어. 콘텐츠 파일의 단어와 같은 모양입니다.
// getMyWords()      → [{ id, word, meaning, dictExample, sourceUrl, ... }] 최신순
export const getMyWords = impl.getMyWords;
export const addMyWord = impl.addMyWord;
export const deleteMyWord = impl.deleteMyWord;

// ── 내가 꽂은 책 ─────────────────────────────────────────
// 민음사 목록에서 고르거나 직접 넣은 책. 어휘는 비어 있는 채로 시작합니다.
// getMyBooks() → [{ slug, book, author, no, addedAt }]
export const getMyBooks = impl.getMyBooks;
export const addMyBook = impl.addMyBook;
export const removeMyBook = impl.removeMyBook;

// ── 내 책장 ──────────────────────────────────────────────
// getShelf() → ["ningen", ...]  /  null 이면 아직 정한 적이 없습니다.
export const getShelf = impl.getShelf;
export const addToShelf = impl.addToShelf;
export const removeFromShelf = impl.removeFromShelf;

// ── 달력 · 스트릭 ────────────────────────────────────────
// getDays() → { "2026-08-25": { words, sentences, book } }
export const getDays = impl.getDays;
// recordDay({ words, sentences, book }) → 오늘 칸의 숫자를 더합니다.
export const recordDay = impl.recordDay;

// ── 설정 ────────────────────────────────────────────────
// getSettings() → { level, dailyCount }
export const getSettings = impl.getSettings;
export const saveSettings = impl.saveSettings;

// ── 전체 지우기 ──────────────────────────────────────────
export const resetAll = impl.resetAll;
