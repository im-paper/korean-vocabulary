// 퀴즈/복습 기록은 서버 없이 이 브라우저에만 저장됩니다(로그인 불필요).
// 단어 콘텐츠(data/words.js)와는 분리된, 사용자별 학습 진행 상황 전용 저장소입니다.

const STORAGE_KEY = "vocab-progress-v1";

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 시크릿 모드 등으로 localStorage를 쓸 수 없으면 조용히 무시
  }
}

export function getProgress(word) {
  return (
    loadAll()[word] || {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      lastReviewedAt: null,
    }
  );
}

export function recordAttempt(word, isCorrect) {
  const all = loadAll();
  const current = all[word] || {
    attempts: 0,
    correct: 0,
    incorrect: 0,
    lastReviewedAt: null,
  };
  current.attempts += 1;
  current[isCorrect ? "correct" : "incorrect"] += 1;
  current.lastReviewedAt = new Date().toISOString();
  all[word] = current;
  saveAll(all);
  return current;
}

export function getAllProgress() {
  return loadAll();
}
