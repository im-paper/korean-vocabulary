import { DAILY_SETS, BOOK_SETS } from "./data/words.js";
import { escapeHtml, parseExample } from "./utils.js";
import { renderQuiz } from "./quiz.js";

const dayNav = document.getElementById("day-nav");
const content = document.getElementById("content");
const tabButtons = document.querySelectorAll(".track-tab");

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

// 일일 어휘: 특정 책과 무관한, 문학 작품에 자주 등장하는 어휘 세트
function buildDailySets() {
  return [...DAILY_SETS]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((set) => ({
      id: `daily-${set.date}`,
      navLabel: formatDate(set.date),
      words: set.words,
      metaHtml: set.note ? `<div class="note">${escapeHtml(set.note)}</div>` : "",
    }));
}

// 책별 어휘: 특정 책을 검색해 그 책에서 자주 나오는 어휘 세트
function buildBookSets() {
  return [...BOOK_SETS]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .map((set, i) => ({
      id: `book-${set.book}-${set.setLabel || i}`,
      navLabel: `${set.book} ${set.setLabel || ""}`.trim(),
      words: set.words,
      metaHtml: `
        <div class="book">${escapeHtml(set.book)}${
        set.author ? ` · ${escapeHtml(set.author)}` : ""
      }</div>
        ${set.note ? `<div class="note">${escapeHtml(set.note)}</div>` : ""}
      `,
    }));
}

let currentTrack = "daily";
let currentSets = buildDailySets();
let currentId = currentSets[0]?.id ?? null;

function switchTrack(track) {
  currentTrack = track;
  currentSets = track === "daily" ? buildDailySets() : buildBookSets();
  currentId = currentSets[0]?.id ?? null;
  tabButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.track === track)
  );
  render();
}

function renderNav() {
  dayNav.innerHTML = "";
  currentSets.forEach((set) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = set.navLabel;
    btn.className = set.id === currentId ? "active" : "";
    btn.addEventListener("click", () => {
      currentId = set.id;
      render();
    });
    dayNav.appendChild(btn);
  });
}

function renderSet(set) {
  content.innerHTML = "";

  if (!set) {
    const emptyMsg =
      currentTrack === "daily"
        ? "아직 등록된 일일 어휘가 없어요."
        : "아직 등록된 책별 어휘가 없어요.";
    content.innerHTML = `<div class="empty-state">${emptyMsg}</div>`;
    return;
  }

  const meta = document.createElement("div");
  meta.className = "day-meta";
  meta.innerHTML = set.metaHtml;

  const quizBtn = document.createElement("button");
  quizBtn.type = "button";
  quizBtn.className = "quiz-start-btn";
  quizBtn.textContent = "이 세트로 퀴즈 풀기";
  quizBtn.addEventListener("click", () => {
    renderQuiz(content, set, () => renderSet(set));
  });
  meta.appendChild(quizBtn);

  content.appendChild(meta);

  const grid = document.createElement("div");
  grid.className = "word-grid";

  set.words.forEach((w) => {
    const { plain } = parseExample(w.example);
    const card = document.createElement("article");
    card.className = "word-card";
    card.innerHTML = `
      <p class="word">${escapeHtml(w.word)}</p>
      <p class="meaning">${escapeHtml(w.meaning)}</p>
      <p class="example">${escapeHtml(plain)}</p>
      <div class="synonyms">
        ${(w.synonyms || [])
          .map((s) => `<span class="tag">${escapeHtml(s)}</span>`)
          .join("")}
      </div>
    `;
    grid.appendChild(card);
  });

  content.appendChild(grid);
}

function render() {
  renderNav();
  const set = currentSets.find((s) => s.id === currentId) || currentSets[0];
  renderSet(set);
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchTrack(btn.dataset.track));
});

render();
