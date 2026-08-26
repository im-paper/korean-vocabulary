// 망각곡선 복습 (PROMPT.md 7)
//
// 사용자가 "뭘 복습할지" 고민하지 않게 하는 것이 목적입니다. 앱이 알아서 꺼내옵니다.
// 화면을 모르는 순수 계산만 둡니다. 규칙이 눈에 보여야 나중에 고칠 수 있습니다.
//
//   1일 후 → 3일 후 → 7일 후 → 30일 후 → 졸업
//
// 한 가지 규칙이 이 앱의 성격을 정합니다.
//   그 단어로 문장을 쓰면 간격을 한 단계 건너뜁니다.
//   직접 만들어 쓰는 인출이 보기에서 고르는 인출보다 훨씬 강하기 때문입니다.
//   즉 이 앱에서 가장 빨리 앞서 나가는 길은 정답을 맞히는 것이 아니라 쓰는 것입니다.

export const STEPS = [1, 3, 7, 30];

const pad = (n) => String(n).padStart(2, "0");

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(days, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return todayKey(d);
}

// 처음 만난 단어. 내일 다시 꺼냅니다.
// 이미 배우기 시작한 단어는 건드리지 않습니다(다시 봤다고 일정이 당겨지면 안 됩니다).
export function startLearning(p) {
  if (p?.interval > 0 || p?.graduated) return null;
  return { interval: STEPS[0], dueAt: addDays(STEPS[0]), lastSeenAt: todayKey() };
}

// 한 단계 나아갑니다. wrote 가 참이면 한 단계를 더 건너뜁니다. (1일 → 7일)
export function advance(p, { wrote = false } = {}) {
  if (p?.graduated) return { lastSeenAt: todayKey() };

  const i = STEPS.indexOf(p?.interval ?? 0);
  const next = i + 1 + (wrote ? 1 : 0);

  // 30일을 통과하면 졸업입니다. 다만 되새김 피드에는 아주 낮은 확률로 계속 섞입니다.
  if (next >= STEPS.length) {
    return { graduated: true, interval: STEPS.at(-1), dueAt: null, lastSeenAt: todayKey() };
  }
  const interval = STEPS[next];
  return { interval, dueAt: addDays(interval), lastSeenAt: todayKey() };
}

// 틀리면 처음 간격으로 되돌립니다. 벌이 아니라 다시 자주 보게 하는 장치입니다.
export function setBack() {
  return { interval: STEPS[0], dueAt: addDays(STEPS[0]), lastSeenAt: todayKey() };
}

export function isDue(p, today = todayKey()) {
  return Boolean(p?.dueAt) && p.dueAt <= today;
}

// 하루 분량을 고릅니다. 무한 스크롤이 아니라 끝이 있습니다. (PROMPT.md 11)
//
// 순서를 난수로 정하지 않는 이유 — 새로고침할 때마다 오늘 분량이 바뀌면
// '오늘 몫을 끝냈다'는 감각이 생기지 않습니다. 날짜와 단어 ID로 정해진 순서를 씁니다.
function stableRank(id, salt) {
  let h = 0;
  for (const ch of id + salt) h = (h * 31 + ch.codePointAt(0)) % 100003;
  return h;
}

export function pickFeed(words, progress, { size = 6, today = todayKey() } = {}) {
  const met = words.filter((w) => {
    const p = progress[w.id];
    return p && (p.interval > 0 || p.graduated) && !p.known;
  });

  // 밀린 것부터. 같은 날짜끼리는 날마다 달라지되 그날 안에서는 고정된 순서로.
  const due = met
    .filter((w) => isDue(progress[w.id], today))
    .sort((a, b) => {
      const d = (progress[a.id].dueAt || "").localeCompare(progress[b.id].dueAt || "");
      return d !== 0 ? d : stableRank(a.id, today) - stableRank(b.id, today);
    });

  if (due.length >= size) return due.slice(0, size);

  // 모자라면 졸업한 단어를 조금 섞습니다. 완전히 사라지지는 않게 합니다.
  const rest = met
    .filter((w) => !due.includes(w))
    .sort((a, b) => stableRank(a.id, today) - stableRank(b.id, today));

  return [...due, ...rest.slice(0, size - due.length)];
}

// 쓰기 칸을 열 단어를 고릅니다.
// 전부에 열면 부담이 되므로 1~2장에만 엽니다. (PROMPT.md 5.3)
// 대상은 '복습 간격이 무르익었고 아직 내 문장이 없는' 단어입니다.
export function pickWriteSlots(feed, progress, sentences, max = 2) {
  return feed
    .filter((w) => !(sentences[w.id] || []).length)
    .filter((w) => isDue(progress[w.id]))
    .slice(0, max)
    .map((w) => w.id);
}
