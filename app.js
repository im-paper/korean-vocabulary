import { WORD_DATA } from "./data/words.js";

const dayNav = document.getElementById("day-nav");
const content = document.getElementById("content");

const days = [...WORD_DATA].sort((a, b) => b.date.localeCompare(a.date));

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function renderNav(selectedDate) {
  dayNav.innerHTML = "";
  days.forEach((day) => {
    const btn = document.createElement("button");
    btn.textContent = formatDate(day.date);
    btn.className = day.date === selectedDate ? "active" : "";
    btn.addEventListener("click", () => render(day.date));
    dayNav.appendChild(btn);
  });
}

function renderDay(day) {
  content.innerHTML = "";

  if (!day) {
    content.innerHTML = `<div class="empty-state">아직 등록된 단어가 없어요.</div>`;
    return;
  }

  const meta = document.createElement("div");
  meta.className = "day-meta";
  meta.innerHTML = `
    ${day.book ? `<div class="book">${escapeHtml(day.book)}</div>` : ""}
    ${day.note ? `<div class="note">${escapeHtml(day.note)}</div>` : ""}
  `;
  content.appendChild(meta);

  const grid = document.createElement("div");
  grid.className = "word-grid";

  day.words.forEach((w) => {
    const card = document.createElement("article");
    card.className = "word-card";
    card.innerHTML = `
      <p class="word">${escapeHtml(w.word)}</p>
      <p class="meaning">${escapeHtml(w.meaning)}</p>
      <p class="example">${escapeHtml(w.example)}</p>
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

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function render(selectedDate) {
  const day = days.find((d) => d.date === selectedDate) || days[0];
  renderNav(day ? day.date : null);
  renderDay(day);
}

render(days[0]?.date);
