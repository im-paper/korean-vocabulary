import { supabase, getUser, sendLoginLink, signOut } from "./lib/supabase.js";
import { fetchSets, createSet, addWords, deleteWord, deleteSet } from "./lib/db.js";
import { lookup, markAnswer } from "./lib/dict.js";
import { escapeHtml, parseExample } from "./utils.js";
import { renderQuiz } from "./quiz.js";
import { DAILY_SETS, BOOK_SETS } from "./data/words.js";

const $ = (id) => document.getElementById(id);

const authScreen = $("auth-screen");
const appScreen = $("app-screen");
const dayNav = $("day-nav");
const content = $("content");
const addModal = $("add-modal");
const lookupResult = $("lookup-result");

let currentTrack = "daily";
let sets = [];
let currentSetId = null;
let targetSetId = null; // 단어를 추가할 대상 세트

// ── 로그인 ──────────────────────────────────────────────

$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("login-email").value.trim();
  const msg = $("auth-message");
  msg.textContent = "보내는 중...";
  try {
    await sendLoginLink(email);
    msg.innerHTML = `<strong>${escapeHtml(email)}</strong> 으로 로그인 링크를 보냈어요.<br>메일함을 확인해 주세요.`;
  } catch (err) {
    msg.textContent = "오류: " + err.message;
  }
});

$("logout-btn").addEventListener("click", async () => {
  await signOut();
  location.reload();
});

// ── 화면 전환 ────────────────────────────────────────────

async function boot() {
  const user = await getUser();
  if (!user) {
    authScreen.hidden = false;
    appScreen.hidden = true;
    return;
  }
  authScreen.hidden = true;
  appScreen.hidden = false;
  $("user-email").textContent = user.email;
  await loadTrack(currentTrack);
}

supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_IN" || event === "SIGNED_OUT") boot();
});

// ── 세트 불러오기 / 렌더링 ────────────────────────────────

async function loadTrack(track) {
  currentTrack = track;
  document.querySelectorAll(".track-tab").forEach((b) =>
    b.classList.toggle("active", b.dataset.track === track)
  );
  content.innerHTML = `<div class="empty-state">불러오는 중...</div>`;
  try {
    sets = await fetchSets(track);
    currentSetId = sets[0]?.id ?? null;
    render();
  } catch (err) {
    content.innerHTML = `<div class="empty-state">불러오지 못했어요: ${escapeHtml(err.message)}</div>`;
  }
}

function setLabel(set) {
  if (set.track === "daily") {
    if (!set.set_date) return "날짜 없음";
    const d = new Date(set.set_date + "T00:00:00");
    return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
  }
  return `${set.book || "제목 없음"} ${set.set_label || ""}`.trim();
}

function renderNav() {
  dayNav.innerHTML = "";
  sets.forEach((set) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = setLabel(set);
    btn.className = set.id === currentSetId ? "active" : "";
    btn.addEventListener("click", () => {
      currentSetId = set.id;
      render();
    });
    dayNav.appendChild(btn);
  });

  const addSetBtn = document.createElement("button");
  addSetBtn.type = "button";
  addSetBtn.className = "add-set-btn";
  addSetBtn.textContent = currentTrack === "daily" ? "+ 오늘 세트" : "+ 새 책";
  addSetBtn.addEventListener("click", onCreateSet);
  dayNav.appendChild(addSetBtn);
}

function render() {
  renderNav();
  const set = sets.find((s) => s.id === currentSetId) || sets[0];
  renderSet(set);
}

function renderSet(set) {
  content.innerHTML = "";

  if (!set) {
    content.innerHTML = `
      <div class="empty-state">
        <p>${currentTrack === "daily" ? "아직 일일 어휘가 없어요." : "아직 책별 어휘가 없어요."}</p>
        <button type="button" id="seed-btn" class="quiz-start-btn">기존 20개 단어 가져오기</button>
      </div>`;
    $("seed-btn")?.addEventListener("click", seedInitialData);
    return;
  }

  const meta = document.createElement("div");
  meta.className = "day-meta";
  meta.innerHTML =
    set.track === "book"
      ? `<div class="book">${escapeHtml(set.book || "")}${set.author ? " · " + escapeHtml(set.author) : ""}</div>`
      : "";

  const actions = document.createElement("div");
  actions.className = "set-actions";

  if (set.words.length > 0) {
    const quizBtn = document.createElement("button");
    quizBtn.type = "button";
    quizBtn.className = "quiz-start-btn";
    quizBtn.textContent = "이 세트로 퀴즈 풀기";
    quizBtn.addEventListener("click", () => renderQuiz(content, set, () => renderSet(set)));
    actions.appendChild(quizBtn);
  }

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "secondary-btn";
  addBtn.textContent = "+ 단어 추가";
  addBtn.addEventListener("click", () => openAddModal(set));
  actions.appendChild(addBtn);

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "link-btn danger";
  delBtn.textContent = "세트 삭제";
  delBtn.addEventListener("click", async () => {
    if (!confirm(`'${setLabel(set)}' 세트를 단어와 함께 삭제할까요?`)) return;
    await deleteSet(set.id);
    await loadTrack(currentTrack);
  });
  actions.appendChild(delBtn);

  meta.appendChild(actions);
  content.appendChild(meta);

  if (set.words.length === 0) {
    content.insertAdjacentHTML("beforeend", `<div class="empty-state">아직 단어가 없어요. '+ 단어 추가'를 눌러 보세요.</div>`);
    return;
  }

  const grid = document.createElement("div");
  grid.className = "word-grid";

  set.words.forEach((w) => {
    const { plain } = parseExample(w.example);
    const card = document.createElement("article");
    card.className = "word-card";
    card.innerHTML = `
      <div class="card-head">
        <p class="word">${escapeHtml(w.word)}</p>
        <button type="button" class="card-del link-btn" title="삭제">×</button>
      </div>
      <p class="meaning">${escapeHtml(w.meaning)}</p>
      <p class="example">${escapeHtml(plain)}</p>
      <div class="synonyms">
        ${(w.synonyms || []).map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("")}
      </div>
    `;
    card.querySelector(".card-del").addEventListener("click", async () => {
      if (!confirm(`'${w.word}'을(를) 삭제할까요?`)) return;
      await deleteWord(w.id);
      await loadTrack(currentTrack);
    });
    grid.appendChild(card);
  });

  content.appendChild(grid);
}

// ── 세트 만들기 ──────────────────────────────────────────

async function onCreateSet() {
  try {
    if (currentTrack === "daily") {
      const today = new Date().toISOString().slice(0, 10);
      const date = prompt("날짜를 입력하세요 (YYYY-MM-DD)", today);
      if (!date) return;
      await createSet({ track: "daily", set_date: date });
    } else {
      const book = prompt("책 제목");
      if (!book) return;
      const author = prompt("지은이 (없으면 비워 두세요)") || null;
      const label = prompt("회차 (예: 1회)", "1회") || null;
      await createSet({
        track: "book",
        book,
        author,
        set_label: label,
        set_date: new Date().toISOString().slice(0, 10),
      });
    }
    await loadTrack(currentTrack);
  } catch (err) {
    alert("만들지 못했어요: " + err.message);
  }
}

// ── 단어 추가 (사전 자동 조회) ─────────────────────────────

function openAddModal(set) {
  targetSetId = set.id;
  $("add-modal-title").textContent = `단어 추가 · ${setLabel(set)}`;
  $("lookup-input").value = "";
  lookupResult.innerHTML = "";
  addModal.hidden = false;
  $("lookup-input").focus();
}

function closeAddModal() {
  if (addModal.hidden) return;
  addModal.hidden = true;
  loadTrack(currentTrack);
}

$("add-close").addEventListener("click", closeAddModal);

// 창 바깥(어두운 배경)을 눌러도 닫히게 한다.
addModal.addEventListener("click", (e) => {
  if (e.target === addModal) closeAddModal();
});

// Esc 로도 닫히게 한다.
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAddModal();
});

$("lookup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const word = $("lookup-input").value.trim();
  if (!word) return;

  lookupResult.innerHTML = `<p class="hint">사전에서 찾는 중...</p>`;
  try {
    const results = await lookup(word);
    renderLookupResults(word, results);
  } catch (err) {
    lookupResult.innerHTML = `<p class="hint error">${escapeHtml(err.message)}</p>`;
  }
});

function renderLookupResults(word, results) {
  lookupResult.innerHTML = `<p class="hint">뜻을 고르고, 쓸 예문을 선택하세요.</p>`;

  results.forEach((r, i) => {
    const box = document.createElement("div");
    box.className = "sense-box";
    box.innerHTML = `
      <p class="sense-meaning">${i + 1}. ${escapeHtml(r.meaning)}${r.pos ? ` <span class="pos">${escapeHtml(r.pos)}</span>` : ""}</p>
      ${
        r.examples.length
          ? r.examples
              .map(
                (ex, j) => `
        <label class="example-option">
          <input type="radio" name="ex-${i}" value="${j}">
          <span>${escapeHtml(ex)}</span>
        </label>`
              )
              .join("")
          : `<p class="hint">이 뜻에는 사전 예문이 없어요.</p>`
      }
      ${
        r.examples.length
          ? `<div class="sense-actions">
               <input type="text" class="syn-input" placeholder="유의어 (쉼표로 구분, 선택)">
               <button type="button" class="save-btn">이 뜻으로 추가</button>
             </div>`
          : ""
      }
    `;

    const saveBtn = box.querySelector(".save-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        const picked = box.querySelector(`input[name="ex-${i}"]:checked`);
        if (!picked) return alert("예문을 하나 선택해 주세요.");

        const example = markAnswer(r.word, r.examples[Number(picked.value)]);
        const synonyms = box
          .querySelector(".syn-input")
          .value.split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        saveBtn.disabled = true;
        saveBtn.textContent = "추가 중...";
        try {
          await addWords(targetSetId, [
            { word: r.word, meaning: r.meaning, example, synonyms, source_url: r.sourceUrl },
          ]);
          lookupResult.innerHTML = `<p class="hint success">'${escapeHtml(r.word)}' 추가했어요. 다음 단어를 찾아보세요.</p>`;
          $("lookup-input").value = "";
          $("lookup-input").focus();
        } catch (err) {
          alert("추가하지 못했어요: " + err.message);
          saveBtn.disabled = false;
          saveBtn.textContent = "이 뜻으로 추가";
        }
      });
    }

    lookupResult.appendChild(box);
  });
}

// ── 기존 파일 데이터를 DB로 옮기기 (최초 1회) ────────────────

async function seedInitialData() {
  const btn = $("seed-btn");
  btn.disabled = true;
  btn.textContent = "가져오는 중...";
  try {
    for (const s of DAILY_SETS) {
      const set = await createSet({ track: "daily", set_date: s.date });
      await addWords(set.id, s.words);
    }
    for (const s of BOOK_SETS) {
      const set = await createSet({
        track: "book",
        book: s.book,
        author: s.author,
        set_label: s.setLabel,
        set_date: s.date,
      });
      await addWords(set.id, s.words);
    }
    await loadTrack(currentTrack);
  } catch (err) {
    alert("가져오지 못했어요: " + err.message);
    btn.disabled = false;
    btn.textContent = "기존 20개 단어 가져오기";
  }
}

document.querySelectorAll(".track-tab").forEach((btn) => {
  btn.addEventListener("click", () => loadTrack(btn.dataset.track));
});

boot();
