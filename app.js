import { BOOKS, DAILY } from "./data/words.js";
import { MINUMSA } from "./data/minumsa.js";
import { escapeHtml, parseExample } from "./utils.js";
import { renderQuiz } from "./quiz.js";
import * as store from "./lib/store.js";
import * as review from "./lib/review.js";
import * as marks from "./lib/marks.js";

const $ = (id) => document.getElementById(id);

const authScreen = $("auth-screen");
const homeScreen = $("home-screen");
const appScreen = $("app-screen");
const bookcase = $("bookcase");
const content = $("content");
const levelSelect = $("level-select");

// 첫 화면은 책장입니다. 열면 아무것도 누르지 않아도 내가 쌓은 것이 보입니다. (PROMPT.md 5.1)
// currentView 는 책장에서 어느 문으로 들어왔는지입니다. "set" | "calendar" | "notes"
let currentView = "set";
let currentSetId = null;
let settings = { level: 2 };
let progress = {};
let sentences = {}; // { [wordId]: [{ text, createdAt }, ...] } 최신순
let myWords = []; // '찾기'로 담은 단어
let myBooks = []; // 내가 꽂은 책 (민음사 목록에서 고르거나 직접 넣은 것)
let myMarks = {}; // { [bookSlug]: [{ text, wordIds, createdAt }, ...] } 밑줄
let shelf = null; // 내 책장에 꽂힌 책 slug 목록. null 이면 아직 정한 적 없음
let currentBookSlug = null; // 지금 펼쳐 놓은 책
let featuredSlug = null; // 진열대에서 고른 책

// ── 세트 만들기 ──────────────────────────────────────────
//
// 화면은 '세트' 하나만 다룹니다. 책의 한 섹션도, 샘플 어휘도 같은 모양입니다.
// 콘텐츠는 프로젝트 파일에서 옵니다. (PROMPT.md 8.1)
//
// kind 가 하는 일
//   "set"  단어 카드를 늘어놓는 보통 화면
//   "book" 한 권을 한 장으로 결산하는 화면. 끝이 있는 묶음입니다. (4단계)

function allSets() {
  const out = [];

  BOOKS.forEach((b) => {
    b.sections.forEach((s, i) => {
      out.push({
        id: `${b.slug}-${i + 1}`,
        group: b.slug,
        kind: "set",
        label: s.name,
        book: b.book,
        author: b.author,
        words: s.words,
      });
    });
    // 우리가 어휘를 준비한 책에도 내가 담은 단어를 붙일 수 있습니다.
    // 읽다가 우리가 못 고른 단어에 걸리는 게 당연하고, 그건 그 책의 것입니다.
    const mineHere = myWords.filter((w) => w.bookSlug === b.slug);
    if (mineHere.length) {
      out.push({
        id: `${b.slug}-mine`,
        group: b.slug,
        kind: "set",
        label: "내가 담은 단어",
        book: b.book,
        author: b.author,
        words: mineHere,
        noFilter: true,
      });
    }

    // 섹션들 끝에 한 권 결산을 둡니다. 여기가 이 책의 끝점입니다.
    out.push({
      id: `${b.slug}-all`,
      group: b.slug,
      kind: "book",
      label: `${b.book} 한 권`,
      book: b.book,
      author: b.author,
      words: b.sections.flatMap((s) => s.words),
    });
  });

  // 책을 안 읽는 날을 위한 샘플. 남이 고른 리스트라 책장 한 칸을 차지하지 않습니다.
  out.push({
    id: "daily",
    group: "daily",
    kind: "set",
    label: "샘플 어휘",
    book: null,
    author: null,
    words: DAILY,
  });

  // 내가 꽂은 책. 어휘가 비어 있는 채로 시작해 '찾기'로 채워집니다.
  myBooks.forEach((b) => {
    out.push({
      id: b.slug,
      group: b.slug,
      kind: "set",
      label: b.book,
      book: b.book,
      author: b.author,
      no: b.no,
      own: true, // 내가 꽂은 책
      words: myWords.filter((w) => w.bookSlug === b.slug),
      noFilter: true, // 내가 고른 단어는 난이도로 거르지 않습니다
    });
  });

  // 어느 책에도 붙지 않은 단어들. 하나라도 있어야 나타납니다.
  const loose = myWords.filter((w) => !w.bookSlug);
  if (loose.length) {
    out.push({
      id: "mine",
      group: "mine",
      kind: "set",
      label: "책 없이 담은 단어",
      book: null,
      author: null,
      words: loose,
      noFilter: true,
    });
  }
  return out;
}


// 설정한 단계 이상만 보여 줍니다. "알아요" 표시한 단어는 뺍니다. (PROMPT.md 6.4)
function visibleWords(set) {
  if (set.noFilter) return set.words;
  return set.words.filter(
    (w) => w.level >= settings.level && !progress[w.id]?.known
  );
}

// 이 단어로 쓴 문장 수. 화면에 뜨는 지표는 성패가 아니라 이것입니다.
const sentenceCount = (wordId) => (sentences[wordId] || []).length;

// ── 밑줄 (PROMPT.md 5.7) ────────────────────────────────
//
// 책에서 걸린 문장을 사용자가 직접 옮겨 적습니다. 앱이 명대사를 실어 나르지
// 않는 이유는 lib/marks.js 위쪽에 적어 두었습니다.

const markList = (slug) => myMarks[slug] || [];

const markTotal = () =>
  Object.values(myMarks).reduce((n, list) => n + list.length, 0);

// 책 한 권의 단어. 콘텐츠 책과 내가 꽂은 책 양쪽을 봅니다.
function wordsOfBook(slug) {
  const b = bookOf(slug);
  if (b) return b.sections.flatMap((s) => s.words);
  return myWords.filter((w) => w.bookSlug === slug);
}

// 제목과 지은이. 밑줄 아래에 출처로 적습니다.
function bookMeta(slug) {
  const b = bookOf(slug);
  if (b) return { book: b.book, author: b.author };
  const mine = myBooks.find((x) => x.slug === slug);
  return mine ? { book: mine.book, author: mine.author } : null;
}

// 밑줄 한 줄을 받습니다. 돌려주는 것은 그 문장에서 다시 만난 단어들입니다.
async function saveMark(slug, text) {
  const wordIds = marks.findWords(text, wordsOfBook(slug));
  await store.addMark(slug, text, { wordIds });

  // 옮겨 적다 만난 단어는 '다시 만난' 것으로만 셉니다.
  // 간격을 건너뛰지는 않습니다 — 베끼기는 지어내기만큼 강한 인출이 아닙니다. (PROMPT.md 7)
  for (const id of wordIds) {
    await store.setProgress(id, { lastSeenAt: review.todayKey() });
  }

  myMarks = await store.getMarks();
  progress = await store.getProgress();
  return wordIds;
}

// 입력칸은 '한 줄 쓰기'와 같은 옷을 입힙니다. 공책의 밑줄 한 줄이지 시험지가 아닙니다.
function markFormHtml(slug) {
  return `
    <form class="write-form mark-form" data-book="${escapeHtml(slug)}">
      <input type="text" maxlength="${marks.MAX_MARK}"
             placeholder="읽다가 걸린 문장 한 줄 —"
             aria-label="책에서 읽은 문장 옮겨 적기">
      <button type="submit">밑줄</button>
    </form>`;
}

function markAskHtml(slug) {
  const n = markList(slug).length;
  return `
    <section class="mark-ask">
      <h3>읽다가 걸린 문장이 있었나요</h3>
      ${markFormHtml(slug)}
      <p class="hint">${
        n
          ? `이 책에 밑줄 ${n}개. 되새김에서 다시 만납니다.`
          : "지어내지 않아도 됩니다. 책에 있던 문장을 그대로 옮겨 적으면 돼요."
      }</p>
    </section>`;
}

// 밑줄을 받고, 그 자리에서 결과를 보여 줍니다.
// 보상은 칭찬이 아니라 사실입니다 — 방금 옮겨 적은 문장 안에서 아는 단어가 켜집니다.
function wireMarkForms() {
  content.querySelectorAll(".mark-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const text = input.value.trim();
      if (!text) return; // 비우고 넘겨도 아무 일도 일어나지 않습니다

      input.disabled = true;
      const slug = form.dataset.book;
      const hit = await saveMark(slug, text);

      form.outerHTML = `
        <div class="mark-saved">
          <blockquote class="mark-text">${marks.highlight(
            text,
            wordsOfBook(slug),
            escapeHtml
          )}</blockquote>
          <p class="${hit.length ? "write-reward" : "hint"}">${
            hit.length
              ? `이 문장 안에서 배운 단어 ${hit.length}개를 다시 만났습니다.`
              : "밑줄에 담았습니다. 되새김에서 다시 만나요."
          }</p>
        </div>`;
    });
  });
}

// ── 부팅 ────────────────────────────────────────────────

async function boot() {
  if (store.needsAuth) {
    // 11단계에서 켭니다. 그때 lib/supabase.js 를 여기서 동적으로 불러옵니다.
    const { getUser } = await import("./lib/supabase.js");
    const user = await getUser();
    if (!user) {
      authScreen.hidden = false;
      appScreen.hidden = true;
      await wireAuthForm();
      return;
    }
  }

  authScreen.hidden = true;

  settings = await store.getSettings();
  progress = await store.getProgress();
  sentences = await store.getSentences();
  myWords = await store.getMyWords();
  myBooks = await store.getMyBooks();
  myMarks = await store.getMarks();
  shelf = await store.getShelf();
  levelSelect.value = String(settings.level);

  showHome();
}

async function wireAuthForm() {
  const { sendLoginLink } = await import("./lib/supabase.js");
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
}

// ── 화면 전환 ────────────────────────────────────────────
//
// 책장이 홈입니다. 책등을 누르면 그 묶음의 어휘 화면으로 들어가고,
// '책장' 버튼으로 돌아옵니다. 돌아올 때마다 책장을 다시 그려서
// 방금 쓴 문장이 책등 두께에 곧바로 반영되게 합니다.

function showHome() {
  appScreen.hidden = true;
  homeScreen.hidden = false;
  renderBookcase();
}

function openSet(setId) {
  currentView = "set";
  currentSetId = setId;
  enterApp();
}

// 책을 누르면 곧바로 단어가 쏟아지지 않고, 속표지와 목차가 먼저 나옵니다.
function openBook(slug) {
  currentView = "toc";
  currentBookSlug = slug;
  enterApp();
}

function openTool(name) {
  if (name === "search") return openSearch();
  // 이달의 책은 진열대를 먼저 보여 주고, 거기서 한 권을 고릅니다.
  currentView = name === "featured" ? "store" : name; // "calendar" | "notes" | "store"
  enterApp();
}

// 돌아가기는 들어온 길을 되짚습니다.
function goBack() {
  if (currentView === "set" && currentBookSlug) return openBook(currentBookSlug);
  if (currentView === "book" && currentBookSlug) return openBook(currentBookSlug);
  if (currentView === "featured") {
    currentView = "store";
    return enterApp();
  }
  showHome();
}

// ── 읽는 책 추가 ─────────────────────────────────────────
//
// 책의 기준은 민음사 세계문학전집입니다. 목록은 위키백과에서 받아 온 실제 자료이고,
// 우리가 어휘를 채워 두지 않습니다.
//
// 여기서 꽂은 책은 '빈 책'으로 시작합니다. 그게 맞습니다 —
// 미리 채워 주면 남이 고른 단어 리스트가 되고, 그건 이 앱이 피하려는 것입니다.
// 읽다가 걸린 단어를 '찾기'로 담으면서 자기 손으로 채우는 것이 본류입니다.

let addQuery = "";

function searchMinumsa(q) {
  const s = q.trim();
  if (!s) return [];
  const byNo = Number(s);
  return MINUMSA.filter(
    (b) => b.title.includes(s) || b.author.includes(s) || (byNo && b.no === byNo)
  ).slice(0, 30);
}

function renderAdd() {
  const on = new Set(myBooks.map((b) => b.slug));
  const hits = searchMinumsa(addQuery);

  $("site-title").textContent = "읽는 책 추가";
  $("site-subtitle").textContent = `민음사 세계문학전집 ${MINUMSA.length}권`;

  content.innerHTML = `
    <section class="addbook">
      <form id="add-search" autocomplete="off">
        <input type="text" id="add-q" value="${escapeHtml(addQuery)}"
               placeholder="제목 · 저자 · 전집 번호" aria-label="책 검색">
      </form>

      <div id="add-hits">
        ${
          !addQuery.trim()
            ? `<p class="hint">읽고 있는 책을 찾아 꽂아 보세요. 어휘는 비어 있는 채로 시작합니다.</p>`
            : hits.length
            ? `<ul class="hit-list">
                 ${hits
                   .map(
                     (b) => `<li>
                       <button type="button" data-no="${b.no}"
                               ${on.has(`minumsa-${b.no}`) ? "disabled" : ""}>
                         <span class="hit-no">${String(b.no).padStart(3, "0")}</span>
                         <span class="hit-title">${escapeHtml(b.title)}</span>
                         <span class="hit-author">${escapeHtml(b.author)}</span>
                         <span class="hit-add">${
                           on.has(`minumsa-${b.no}`) ? "꽂음" : "꽂기"
                         }</span>
                       </button>
                     </li>`
                   )
                   .join("")}
               </ul>`
            : `<p class="hint">전집 목록에서 찾지 못했어요. 아래에 직접 적어 넣을 수 있어요.</p>`
        }
      </div>

      <details class="add-own"${addQuery.trim() && !hits.length ? " open" : ""}>
        <summary>목록에 없는 책 직접 넣기</summary>
        <form id="add-own-form" autocomplete="off">
          <input type="text" name="book" placeholder="책 제목" required>
          <input type="text" name="author" placeholder="지은이">
          <button type="submit">꽂기</button>
        </form>
      </details>

      ${
        myBooks.length
          ? `<h3 class="book-section">내가 꽂은 책 ${myBooks.length}권</h3>
             <ul class="book-words">
               ${myBooks
                 .map((b) => {
                   const n = myWords.filter((w) => w.bookSlug === b.slug).length;
                   return `<li>
                     <span class="bw-word">${escapeHtml(b.book)}</span>
                     <span class="bw-meaning">${escapeHtml(b.author || "")}${
                     b.no ? ` · 전집 ${b.no}` : ""
                   }</span>
                     <span class="bw-count">${n ? `단어 ${n}` : "비어 있음"}</span>
                     <button type="button" class="link-btn book-remove"
                             data-slug="${escapeHtml(b.slug)}">빼기</button>
                   </li>`;
                 })
                 .join("")}
             </ul>`
          : ""
      }
    </section>
  `;

  const input = $("add-q");
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  // 입력하는 동안 바로 걸러 보여 줍니다. 검색 버튼을 누르게 하지 않습니다.
  input.addEventListener("input", () => {
    addQuery = input.value;
    renderAdd();
  });
  $("add-search").addEventListener("submit", (e) => e.preventDefault());

  content.querySelectorAll("[data-no]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const b = MINUMSA.find((x) => x.no === Number(btn.dataset.no));
      const added = await store.addMyBook({ book: b.title, author: b.author, no: b.no });
      myBooks = await store.getMyBooks();
      openSet(added.slug);
    });
  });

  $("add-own-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const added = await store.addMyBook({
      book: f.get("book"),
      author: f.get("author"),
    });
    if (!added) return;
    myBooks = await store.getMyBooks();
    openSet(added.slug);
  });

  content.querySelectorAll(".book-remove").forEach((btn) => {
    btn.addEventListener("click", async () => {
      // 책만 뺍니다. 담은 단어는 지우지 않습니다.
      await store.removeMyBook(btn.dataset.slug);
      myBooks = await store.getMyBooks();
      renderAdd();
    });
  });
}

// ── 되새김 피드 (PROMPT.md 5.3) ──────────────────────────
//
// 퀴즈가 아닙니다. 정답을 요구하지 않습니다. 예전 단어가 예문과 함께 흘러갈 뿐입니다.
// 이 앱에서 가장 자주 일어나야 하는 흐름이라 마찰을 최대한 없앴습니다.
//
// 하루 분량은 5~7장으로 끝이 있습니다. 무한 스크롤로 만들지 않습니다 — 끝이 없으면
// 완료감이 없고, 그것은 '짧게 여러 번' 원칙과 정면으로 충돌합니다. (PROMPT.md 11)
//
// 그리고 여기가 산출이 일어나는 자리입니다. 5~7장 중 1~2장에만 쓰기 칸이 열립니다.
// 전부에 열면 숙제가 됩니다.

// 되새김 대상 — 내 책장의 책과 담은 단어. 샘플은 넣지 않습니다.
function reviewPool() {
  const inShelf = shelfBooks().flatMap((b) => b.sections.flatMap((s) => s.words));
  return [...inShelf, ...myWords];
}

function todayFeed() {
  return review.pickFeed(reviewPool(), progress, { size: 6 });
}

// 오늘의 밑줄 한 장. 피드 맨 끝, '오늘 되새김 끝' 바로 앞에 둡니다.
//
// 앞쪽에 두지 않는 이유 — 밑줄은 읽을거리고 되새김은 오늘 몫입니다.
// 읽을거리를 앞에 세우면 오늘 몫이 뒤로 밀립니다. 끝에 두면 완료의 보상이 됩니다.
function feedMarkHtml() {
  const all = Object.entries(myMarks).flatMap(([slug, list]) =>
    list.map((m) => ({ ...m, slug }))
  );
  const pick = marks.pickMark(all, review.todayKey());

  // 아직 한 줄도 없으면 자리를 비우는 대신 무엇을 하는 자리인지 알려 줍니다.
  if (!pick) {
    return `
      <article class="mark-card quiet">
        <p class="mark-text">읽다가 걸린 문장을 한 줄 옮겨 적어 두면, 여기로 돌아옵니다.</p>
        <p class="mark-src">묶음을 끝낸 자리에서 남길 수 있어요</p>
      </article>`;
  }

  const meta = bookMeta(pick.slug);
  const d = new Date(pick.createdAt);
  return `
    <article class="mark-card">
      <p class="mark-date">${d.getMonth() + 1}월 ${d.getDate()}일에 옮겨 적음</p>
      <blockquote class="mark-text">${marks.highlight(
        pick.text,
        wordsOfBook(pick.slug),
        escapeHtml
      )}</blockquote>
      <p class="mark-src">${
        meta
          ? escapeHtml(meta.book) + (meta.author ? " · " + escapeHtml(meta.author) : "")
          : ""
      }</p>
    </article>`;
}

function renderFeed() {
  const feed = todayFeed();
  const slots = review.pickWriteSlots(feed, progress, sentences);

  $("site-title").textContent = "오늘의 되새김";
  $("site-subtitle").textContent = feed.length ? `${feed.length}장` : "";

  if (!feed.length) {
    content.innerHTML = `
      <div class="empty-state">
        <p>오늘 되새길 단어가 없어요.</p>
        <p class="hint">책을 열어 단어를 만나면, 내일부터 여기로 돌아옵니다.</p>
      </div>`;
    return;
  }

  content.innerHTML = `
    <section class="feed">
      ${feed
        .map((w) => {
          const mine = sentences[w.id] || [];
          // 내가 쓴 문장이 있으면 앱 예문 대신 내 문장을 보여 줍니다. (PROMPT.md 5.1 ①)
          const line = mine[0]?.text || parseExample(w.example).plain || w.dictExample || "";
          return `
          <article class="feed-card" data-word="${escapeHtml(w.id)}">
            <p class="feed-line">${
              line
                ? escapeHtml(line)
                : `<span class="hint">이 단어에는 아직 예문이 없어요.</span>`
            }</p>
            ${mine.length ? `<span class="mine-tag">내 문장</span>` : ""}
            <button type="button" class="feed-word">${escapeHtml(w.word)}</button>
            <p class="feed-meaning" hidden>${escapeHtml(w.meaning)}</p>
            ${
              slots.includes(w.id)
                ? `<form class="write-form feed-write">
                     <input type="text" maxlength="200" placeholder="이 단어로 한 줄 —"
                            aria-label="${escapeHtml(w.word)}(으)로 한 줄 쓰기">
                     <button type="submit">남기기</button>
                   </form>`
                : ""
            }
          </article>`;
        })
        .join("")}

      ${feedMarkHtml()}

      <div class="feed-end">
        <button type="button" id="feed-done" class="quiz-start-btn">오늘 되새김 끝</button>
        <p class="hint">여기까지가 오늘 몫이에요.</p>
      </div>
    </section>
  `;

  // 단어를 누르면 뜻이 펼쳐집니다. 정답을 묻지 않습니다.
  content.querySelectorAll(".feed-word").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = btn.parentElement.querySelector(".feed-meaning");
      p.hidden = !p.hidden;
    });
  });

  content.querySelectorAll(".feed-write").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const card = form.closest(".feed-card");
      const input = form.querySelector("input");
      const text = input.value.trim();
      if (!text) return; // 비우고 넘겨도 아무 일도 일어나지 않습니다

      input.disabled = true;
      await store.addSentence(card.dataset.word, text);
      await store.recordDay({ sentences: 1 });
      await store.setProgress(
        card.dataset.word,
        review.advance(progress[card.dataset.word], { wrote: true })
      );
      progress = await store.getProgress();
      sentences = await store.getSentences();

      // 즉시 보상 — 내가 쓴 것이 앱의 콘텐츠가 됩니다. (PROMPT.md 5.3)
      form.outerHTML = `<p class="write-reward">이제 이 단어는 당신 문장으로 돌아옵니다.</p>`;
      card.querySelector(".feed-line").textContent = text;
    });
  });

  $("feed-done").addEventListener("click", async () => {
    // 본 것은 다음 간격으로 넘깁니다. 이미 쓴 단어는 건너뛰기가 반영돼 있으므로 둡니다.
    for (const w of feed) {
      if (review.isDue(progress[w.id])) {
        await store.setProgress(w.id, review.advance(progress[w.id]));
      }
    }
    progress = await store.getProgress();
    showHome();
  });
}

// ── 책 속표지 · 목차 ─────────────────────────────────────
//
// 책을 펼치면 단어가 쏟아지지 않고 속표지와 목차가 먼저 나옵니다.
// 알약 버튼 줄로 섹션을 늘어놓지 않는 이유 — 그건 앱의 탭이지 책의 목차가 아닙니다.
// 목차는 세로로 읽히고, 각 줄이 얼마나 채워졌는지 오른쪽에 조용히 적힙니다.

function bookOf(slug) {
  return BOOKS.find((b) => b.slug === slug) || null;
}

function renderToc() {
  const b = bookOf(currentBookSlug);
  if (!b) return showHome();

  const sets = allSets();
  const sections = sets.filter((s) => s.group === b.slug && s.kind === "set");
  const whole = sets.find((s) => s.id === `${b.slug}-all`);
  const count = whole.words.length;
  const written = whole.words.filter((w) => sentenceCount(w.id) > 0).length;

  $("site-title").textContent = b.book;
  $("site-subtitle").textContent = b.author;

  content.innerHTML = `
    <section class="toc">
      <ol class="toc-list">
        ${sections
          .map((s, i) => {
            const done = s.words.filter((w) => sentenceCount(w.id) > 0).length;
            return `<li>
              <button type="button" data-set="${escapeHtml(s.id)}">
                <span class="toc-no">${String(i + 1).padStart(2, "0")}</span>
                <span class="toc-name">${escapeHtml(s.name ?? s.label)}</span>
                <span class="toc-dots" aria-hidden="true"></span>
                <span class="toc-count">${
                  done ? `${done}/${s.words.length}` : `${s.words.length}`
                }</span>
              </button>
            </li>`;
          })
          .join("")}
      </ol>

      <button type="button" class="toc-summary" data-set="${escapeHtml(b.slug)}-all">
        ${escapeHtml(b.book)}에서 건진 ${count}단어
        <span>${written ? `그중 ${written}개가 내 문장` : "아직 내 문장은 없어요"}</span>
      </button>
    </section>
  `;

  content.querySelectorAll("[data-set]").forEach((el) => {
    el.addEventListener("click", () => openSet(el.dataset.set));
  });
}

// ── 이달의 책 진열대 ─────────────────────────────────────
//
// 서점처럼 표지가 정면으로 보이게 세워 둡니다. 다만 실제 표지 이미지는 쓰지 않습니다
// (저작권 · PROMPT.md 11). 제목과 저자만으로 표지를 직접 그립니다.

function storeBooks() {
  const on = shelfBooks().map((b) => b.slug);
  return BOOKS.filter((b) => b.featured && !on.includes(b.slug));
}

function coverHtml(b) {
  const color = (hashOf(b.slug) % 5) + 1;
  const count = b.sections.reduce((n, s) => n + s.words.length, 0);
  return `
    <button type="button" class="cover" data-book="${escapeHtml(b.slug)}"
            style="--c:var(--spine-${color})">
      <span class="cover-face">
        <span class="cover-rule" aria-hidden="true"></span>
        <span class="cover-title">${escapeHtml(b.book)}</span>
        <span class="cover-author">${escapeHtml(b.author)}</span>
        <span class="cover-foot">단어 ${count}</span>
      </span>
    </button>`;
}

function renderStore() {
  const books = storeBooks();

  $("site-title").textContent = "이달의 책";
  $("site-subtitle").textContent = "읽어 볼 만한 책을 골라 두었어요";

  if (!books.length) {
    content.innerHTML = `
      <div class="empty-state">
        <p>지금 권할 책을 모두 책장에 꽂으셨어요.</p>
      </div>`;
    return;
  }

  content.innerHTML = `
    <section class="store">
      <div class="store-row">${books.map(coverHtml).join("")}</div>
      <div class="store-board"></div>
    </section>
  `;

  content.querySelectorAll("[data-book]").forEach((el) => {
    el.addEventListener("click", () => {
      featuredSlug = el.dataset.book;
      currentView = "featured";
      enterApp();
    });
  });
}

// ── 이달의 책 — 한 권 소개 (PROMPT.md 11 을 지키는 선에서) ─
//
// 남이 고른 '단어 리스트'를 주는 것과 읽을 '책'을 권하는 것은 다릅니다.
// 앞은 이 앱이 피해야 할 것이고, 뒤는 새 코퍼스가 시작되는 자리입니다.
// 그래서 여기서는 단어를 앞세우지 않고 책을 앞세웁니다. 꽂는 것도 직접 합니다.

function renderFeatured() {
  const b = bookOf(featuredSlug) || storeBooks()[0];
  if (!b) return showHome();
  featuredSlug = b.slug;

  const count = b.sections.reduce((n, s) => n + s.words.length, 0);

  $("site-title").textContent = b.book;
  $("site-subtitle").textContent = b.author;

  content.innerHTML = `
    <section class="featured">
      ${coverHtml(b).replace("<button", "<span").replace("</button>", "</span>")}
      ${b.featuredNote ? `<p class="featured-note">${escapeHtml(b.featuredNote)}</p>` : ""}

      <button type="button" id="shelve-book" class="quiz-start-btn">내 책장에 꽂기</button>

      <h3 class="book-section">${b.sections.length}개 묶음 · 단어 ${count}개</h3>
      <ul class="book-words">
        ${b.sections
          .map(
            (s) => `<li>
              <span class="bw-word">${escapeHtml(s.name)}</span>
              <span class="bw-meaning">${s.words
                .slice(0, 4)
                .map((w) => escapeHtml(w.word))
                .join(" · ")}${s.words.length > 4 ? " …" : ""}</span>
            </li>`
          )
          .join("")}
      </ul>
    </section>
  `;

  $("shelve-book").addEventListener("click", async () => {
    // 기본으로 꽂혀 있던 책들도 함께 적어 둡니다. 이때부터 책장은 사용자의 것입니다.
    if (!shelf) {
      for (const x of BOOKS.filter((x) => !x.featured)) await store.addToShelf(x.slug);
    }
    shelf = await store.addToShelf(b.slug);
    // 꽂은 책을 바로 펼쳐 봅니다. 책장으로 돌려보내 다시 찾게 하지 않습니다.
    openBook(b.slug);
  });
}

function enterApp() {
  homeScreen.hidden = true;
  appScreen.hidden = false;
  render();
  window.scrollTo(0, 0);
}

$("back-home").addEventListener("click", goBack);

// ── 책장 (PROMPT.md 5.1 · 12) ────────────────────────────
//
// 칸을 나누는 기준은 '상태'입니다. 장르가 아니라 진도에 따라 책이 아래로
// 내려앉기 때문에, 공부한 만큼 책장의 모습이 바뀝니다.
//   위칸    읽는 중 — 아직 끝내지 않은 섹션
//   가운데  끝낸 책 — 다 채운 섹션. 한 권을 다 끝내면 두꺼운 한 권으로 합칩니다
//   아래칸  도구   — 달력 · 내 문장 · 찾기
//
// 책등의 두께와 색은 진도를 나타냅니다. 진도는 정답률이 아니라
// '이 묶음에서 몇 단어가 내 문장이 되었는가'입니다. 지표가 곧 제품의 정의입니다.

function setRatio(set) {
  if (!set.words.length) return 0;
  const written = set.words.filter((w) => sentenceCount(w.id) > 0).length;
  return written / set.words.length;
}

// 책등 하나 = 책 한 권. 섹션은 책 안에서 고릅니다.
//
// 실제 책등처럼 보이게 하는 것들 — 제목은 세로로, 저자는 아래에 작게,
// 위아래에 가느다란 띠. 높이는 책마다 조금씩 다릅니다. 다 똑같은 높이로 서 있으면
// 책장이 아니라 색 막대 그래프처럼 보입니다.
// 진도는 아래쪽 굽이 차오르는 것으로만 보입니다. 숫자를 붙이지 않습니다.

// 제목에서 뽑은 고정 숫자. 같은 책은 늘 같은 높이로 서 있어야 합니다.
function hashOf(str) {
  let h = 0;
  for (const ch of str) h = (h * 31 + ch.codePointAt(0)) % 997;
  return h;
}

function spineHtml({ id, label, author, color, ratio, isBook, own }) {
  const done = ratio >= 1;
  const width = isBook ? 34 + ratio * 20 : 20;
  const height = isBook ? 104 + (hashOf(label) % 26) : 78;
  // 우리가 어휘를 준비한 책은 목차로, 내가 꽂은 책과 샘플은 곧바로 단어 목록으로.
  // 내가 꽂은 책에는 아직 묶음이 없으므로 목차를 보여 줄 것이 없습니다.
  const target =
    isBook && !own ? `data-book="${escapeHtml(id)}"` : `data-set="${escapeHtml(id)}"`;
  return `
    <button type="button" class="spine${done ? " done" : ""}${
    isBook ? "" : " thin"
  }"
            ${target}
            style="--c:var(--spine-${color}); --w:${Math.round(width)}px;
                   --h:${height}px; --fill:${Math.round(ratio * 100)}%"
            aria-label="${escapeHtml(label)} — ${Math.round(ratio * 100)}% 내 문장">
      <span class="spine-fill" aria-hidden="true"></span>
      <span class="spine-band" aria-hidden="true"></span>
      <span class="spine-text">
        <span class="spine-title">${escapeHtml(label)}</span>
        ${author ? `<span class="spine-author">${escapeHtml(author)}</span>` : ""}
      </span>
    </button>`;
}

// 내 책장에 꽂힌 책만 보여 줍니다. '이달의 책'은 직접 꽂아야 들어옵니다.
function shelfBooks() {
  if (!shelf) return BOOKS.filter((b) => !b.featured); // 처음 열었을 때의 기본
  return BOOKS.filter((b) => shelf.includes(b.slug));
}

function featuredBook() {
  const on = shelfBooks().map((b) => b.slug);
  return BOOKS.find((b) => b.featured && !on.includes(b.slug)) || null;
}

function renderBookcase() {
  const sets = allSets();
  const reading = [];
  const finished = [];

  shelfBooks().forEach((b) => {
    const whole = sets.find((s) => s.id === `${b.slug}-all`);
    const ratio = setRatio(whole);

    // 책등을 누르면 목차가 먼저 열립니다. 어느 묶음부터 할지는 목차에서 고릅니다.
    const spine = {
      id: b.slug,
      label: b.book,
      author: b.author,
      color: (hashOf(b.slug) % 5) + 1,
      ratio,
      isBook: true,
    };
    (ratio >= 1 ? finished : reading).push(spine);
  });

  // 내가 꽂은 책. 어휘가 비어 있어도 책장에 서 있습니다 — 읽으면서 채울 자리입니다.
  myBooks.forEach((b) => {
    const set = sets.find((s) => s.id === b.slug);
    const ratio = set ? setRatio(set) : 0;
    (ratio >= 1 && set.words.length ? finished : reading).push({
      id: b.slug,
      label: b.book,
      author: b.author,
      color: (hashOf(b.slug) % 5) + 1,
      ratio,
      isBook: true,
      own: true,
      count: set?.words.length ?? 0,
    });
  });

  const extras = [
    { id: "daily", label: "샘플", color: 0, ratio: 0, isBook: false },
    ...(sets.some((s) => s.id === "mine")
      ? [{ id: "mine", label: "책 없이", color: 0, ratio: 0, isBook: false }]
      : []),
  ];

  const featured = featuredBook();

  // 오늘의 되새김 — 열면 아무것도 누르지 않아도 보이는 자리입니다. (PROMPT.md 5.1 ①)
  const feed = todayFeed();
  const dueCount = feed.filter((w) => review.isDue(progress[w.id])).length;

  bookcase.innerHTML = `
    ${
      feed.length
        ? `<button type="button" class="today-review${dueCount ? "" : " quiet"}"
                   data-view="feed">
             <span>${
               dueCount
                 ? `오늘 되새길 단어 ${dueCount}개`
                 : `오늘 몫은 끝났어요`
             }</span>
             <em>${dueCount ? "한 줄 남기고 가도 좋아요" : "그냥 훑어봐도 됩니다"}</em>
           </button>`
        : ""
    }

    <section class="shelf">
      <div class="shelf-row">
        ${reading.map(spineHtml).join("")}
        ${extras.map(spineHtml).join("")}
        <button type="button" class="spine placeholder" data-view="add"
                aria-label="읽는 책 추가">+</button>
      </div>
      <div class="shelf-board"></div>
      <p class="shelf-label">읽는 중</p>
    </section>

    <section class="shelf">
      <div class="shelf-row">
        ${
          finished.length
            ? finished.map(spineHtml).join("")
            : `<p class="shelf-empty">한 권을 다 채우면 여기로 옮겨집니다.</p>`
        }
      </div>
      <div class="shelf-board"></div>
      <p class="shelf-label">끝낸 책</p>
    </section>

    <section class="shelf">
      <div class="shelf-row tools">
        ${featured ? objectHtml("featured", "이달의 책") : ""}
        ${objectHtml("calendar", "달력")}
        ${objectHtml("notes", "내 문장")}
        ${objectHtml("search", "찾기")}
      </div>
      <div class="shelf-board"></div>
      <p class="shelf-label">책상 위</p>
    </section>
  `;

  bookcase.querySelectorAll("[data-view]").forEach((el) => {
    el.addEventListener("click", () => {
      currentView = el.dataset.view; // "feed" | "add"
      enterApp();
    });
  });
  bookcase.querySelectorAll("[data-book]").forEach((el) => {
    el.addEventListener("click", () => openBook(el.dataset.book));
  });
  bookcase.querySelectorAll("[data-set]").forEach((el) => {
    el.addEventListener("click", () => openSet(el.dataset.set));
  });
  bookcase.querySelectorAll("[data-tool]").forEach((el) => {
    el.addEventListener("click", () => openTool(el.dataset.tool));
  });

  // 쌓인 것을 한 줄로만 말합니다. 경쟁 지표로 키우지 않습니다. (PROMPT.md 11)
  const learned = new Set(Object.keys(progress)).size;
  const written = Object.values(sentences).reduce((n, a) => n + a.length, 0);
  $("home-stat").textContent = written
    ? `만난 단어 ${learned} · 내가 쓴 문장 ${written}`
    : `책등을 눌러 시작해 보세요.`;
}

// 책상 위 물건들. 아이콘이 아니라 '선반에 놓인 것'으로 그립니다.
// 한 굵기의 얇은 선으로 윤곽을 잡고, 그 안을 색면 한 겹으로 채웁니다.
// 선만 있으면 기호가 되고, 색면이 들어가야 물건이 됩니다.
//
// 크기는 넷이 다 다릅니다. 실제 물건의 비례를 그대로 씁니다.
// (1칸 ≈ 3.4mm — 책 20cm, 달력 9.5cm, 공책 더미 8cm, 돋보기 13cm)
// 크기가 같으면 아이콘 네 개가 되고, 다르면 선반에 놓인 물건 네 개가 됩니다.
// 좌표는 각자의 상자 안에서 바닥에 발을 딛습니다. 줄에서는 아래끝을 맞춥니다.
const OBJECTS = {
  // 세워 둔 책 — 표지가 정면, 왼쪽에 책등. 넷 중 가장 큽니다.
  featured: {
    w: 46,
    h: 66,
    art: `
      <path class="wine" d="M8 6h30v58H8z"/>
      <path class="paper" d="M17 24h13v14H17z"/>
      <path d="M8 6h30v58H8z"/>
      <path d="M14 6v58"/>
      <path d="M17 24h13v14H17z"/>
      <path d="M20 29h7M20 33h5"/>
      <path d="M11 12v5M11 53v5"/>`,
  },

  // 탁상 달력 — 위는 스프링, 뒤는 세우는 다리
  calendar: {
    w: 50,
    h: 46,
    art: `
      <path class="paper" d="M7 11h36v28H7z"/>
      <path class="plum" d="M7 11h36v7H7z"/>
      <rect class="plum" x="29" y="23" width="8" height="8" rx="1"/>
      <path d="M15 39l-4 5.5M35 39l4 5.5"/>
      <path d="M7 11h36v28H7z"/>
      <path d="M7 18h36"/>
      <rect x="29" y="23" width="8" height="8" rx="1"/>
      <path d="M13 25h11M13 31h8"/>
      <circle cx="16" cy="11" r="3"/>
      <circle cx="25" cy="11" r="3"/>
      <circle cx="34" cy="11" r="3"/>`,
  },

  // 눕혀 쌓은 공책 두 권과 그 위의 펜 — 낮고 넓습니다.
  notes: {
    w: 56,
    h: 26,
    art: `
      <path class="teal" d="M3 14h50v10H3z"/>
      <path class="paper" d="M7 6h38v8H7z"/>
      <path class="teal" d="M15.75 2.5H43V6H15.75a1.75 1.75 0 0 1 0-3.5z"/>
      <path class="wine" d="M43 2.5l6 1.75L43 6z"/>
      <path d="M3 14h50v10H3z"/>
      <path d="M6 20.5h44"/>
      <path d="M7 6h38v8H7z"/>
      <path d="M9 10.5h34"/>
      <path d="M15.75 2.5H43l6 1.75L43 6H15.75a1.75 1.75 0 0 1 0-3.5z"/>
      <path d="M43 2.5V6M21 2.5V6"/>`,
  },

  // 돋보기 — 손잡이가 선반에 닿습니다. 넷 중 가장 작습니다.
  search: {
    w: 30,
    h: 44,
    art: `
      <path class="wine" d="M12 25h6v14a3 3 0 0 1-6 0z"/>
      <path d="M12 25h6v14a3 3 0 0 1-6 0z"/>
      <circle class="glass" cx="15" cy="15" r="9.5"/>
      <circle cx="15" cy="15" r="12"/>
      <circle cx="15" cy="15" r="9.5"/>
      <path d="M10 12a6 6 0 0 1 4-3.5"/>`,
  },
};

function objectHtml(name, label) {
  const o = OBJECTS[name];
  return `
    <button type="button" class="tool" data-tool="${name}">
      <svg viewBox="0 0 ${o.w} ${o.h}" style="--tw:${o.w}px; --th:${o.h}px"
           fill="none" stroke="currentColor"
           stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true">
        ${o.art}
      </svg>
      <span>${escapeHtml(label)}</span>
    </button>`;
}

// ── 세트 화면 ────────────────────────────────────────────

function render() {
  const isSet = currentView === "set";
  // 목차·도구 화면에서는 난이도 고르기가 할 일이 없습니다. 조용히 비웁니다.
  levelSelect.closest(".level-picker").hidden = !isSet;
  $("back-home").textContent = isSet || currentView === "featured" ? "돌아가기" : "책장";

  if (currentView === "feed") return renderFeed();
  if (currentView === "add") return renderAdd();
  if (currentView === "toc") return renderToc();
  if (currentView === "calendar") return renderCalendar();
  if (currentView === "notes") return renderNotes();
  if (currentView === "store") return renderStore();
  if (currentView === "featured") return renderFeatured();

  const sets = allSets();
  const set = sets.find((s) => s.id === currentSetId) || sets[0];
  // 어느 책을 펼쳐 둔 상태인지 기억해 두어야 '돌아가기'가 목차로 갑니다.
  if (bookOf(set.group)) currentBookSlug = set.group;
  renderSet(set);
}

function renderSet(set) {
  content.innerHTML = "";
  if (!set) {
    content.innerHTML = `<div class="empty-state">보여 줄 어휘가 없어요.</div>`;
    return;
  }

  // 상단에 지금 어디에 있는지 적습니다. 책 제목이 크고, 섹션이 작습니다.
  $("site-title").textContent = set.book || set.label;
  $("site-subtitle").textContent = set.book
    ? `${set.label}${set.author ? " · " + set.author : ""}`
    : "";

  if (set.kind === "book") return renderBook(set);

  const words = visibleWords(set);

  // 책 이름은 상단 머리글이 이미 말했습니다. 여기서는 반복하지 않습니다.
  const meta = document.createElement("div");
  meta.className = "day-meta";

  const actions = document.createElement("div");
  actions.className = "set-actions";
  if (words.length > 0) {
    const quizBtn = document.createElement("button");
    quizBtn.type = "button";
    quizBtn.className = "quiz-start-btn";
    quizBtn.textContent = "이 세트로 퀴즈 풀기";
    quizBtn.addEventListener("click", () =>
      renderQuiz(content, { ...set, words }, async () => {
        progress = await store.getProgress();
        render();
      })
    );
    actions.appendChild(quizBtn);
  }
  meta.appendChild(actions);
  content.appendChild(meta);

  if (set.words.length === 0) {
    content.insertAdjacentHTML(
      "beforeend",
      `<div class="empty-state">이 섹션의 어휘는 아직 준비 중이에요. (10단계에서 채웁니다)</div>`
    );
    return;
  }

  if (words.length === 0) {
    // 왜 비었는지 구분해서 알려 주고, 한 번에 풀 수 있는 길을 같이 둡니다.
    const knownCount = set.words.filter((w) => progress[w.id]?.known).length;
    const byLevel = set.words.length - knownCount;

    content.insertAdjacentHTML(
      "beforeend",
      `<div class="empty-state">
         <p>${
           byLevel > 0
             ? `이 섹션에는 ${settings.level}단계 이상 단어가 없어요.`
             : `이 섹션 단어를 모두 '알아요'로 표시했어요.`
         }</p>
         ${
           byLevel > 0 && settings.level > 1
             ? `<button type="button" id="lower-level" class="secondary-btn">${
                 settings.level - 1
               }단계까지 보기</button>`
             : ""
         }
         ${
           knownCount > 0
             ? `<button type="button" id="clear-known" class="link-btn">'알아요' ${knownCount}개 되돌리기</button>`
             : ""
         }
       </div>`
    );

    $("lower-level")?.addEventListener("click", async () => {
      settings = await store.saveSettings({ level: settings.level - 1 });
      levelSelect.value = String(settings.level);
      render();
    });

    $("clear-known")?.addEventListener("click", async () => {
      for (const w of set.words) {
        if (progress[w.id]?.known) await store.setKnown(w.id, false);
      }
      progress = await store.getProgress();
      render();
    });
    return;
  }

  const grid = document.createElement("div");
  grid.className = "word-grid";
  words.forEach((w) => grid.appendChild(wordCard(w)));
  content.appendChild(grid);

  renderSetFoot(set);
  markSeen(words);
}

// 화면에 띄운 단어는 '만난' 것으로 보고 복습 일정을 시작합니다. (PROMPT.md 7)
// 이미 배우기 시작한 단어는 건드리지 않습니다 — 다시 봤다고 일정이 당겨지면
// 오래된 단어일수록 계속 뒤로 밀려 영영 안 돌아옵니다.
async function markSeen(words) {
  let changed = false;
  for (const w of words) {
    const patch = review.startLearning(progress[w.id]);
    if (!patch) continue;
    await store.setProgress(w.id, patch);
    changed = true;
  }
  if (changed) progress = await store.getProgress();
}

// 묶음 끝. 책은 다음 장으로 넘어가지, 탭으로 돌아가지 않습니다.
function renderSetFoot(set) {
  const siblings = allSets().filter(
    (s) => s.group === set.group && s.kind === "set"
  );
  const i = siblings.findIndex((s) => s.id === set.id);
  const next = i >= 0 ? siblings[i + 1] : null;

  // 밑줄을 받는 자리는 여기입니다. 단어를 다 넘긴 직후, 책을 읽으러 가기 직전 —
  // 이 앱에서 책과 가장 가까운 지점입니다. 샘플 어휘에는 붙이지 않습니다.
  const meta = bookMeta(set.group);

  content.insertAdjacentHTML(
    "beforeend",
    `${meta ? markAskHtml(set.group) : ""}
     <nav class="set-foot">
       ${
         next
           ? `<button type="button" class="next-set" data-set="${escapeHtml(
               next.id
             )}">다음 · ${escapeHtml(next.label)}</button>`
           : `<p class="hint">이 책의 마지막 묶음이에요.</p>`
       }
       ${
         bookOf(set.group)
           ? `<button type="button" class="link-btn" id="to-toc">목차로</button>`
           : ""
       }
     </nav>`
  );

  wireMarkForms();

  content.querySelector(".next-set")?.addEventListener("click", (e) => {
    openSet(e.target.dataset.set);
  });
  $("to-toc")?.addEventListener("click", () => openBook(set.group));
}

// ── 달력 · 문장 노트가 함께 쓰는 것 ──────────────────────

// 문장은 단어 ID 만 들고 있으므로, ID 로 단어를 되찾을 수 있어야 합니다.
function wordIndex() {
  const map = {};
  BOOKS.forEach((b) =>
    b.sections.forEach((s) =>
      s.words.forEach((w) => (map[w.id] = { ...w, book: b.book }))
    )
  );
  DAILY.forEach((w) => (map[w.id] = { ...w, book: null }));
  myWords.forEach((w) => (map[w.id] = { ...w, book: null }));
  return map;
}

// 저장된 시각은 세계 표준시입니다. 그대로 자르면 밤 9시 이후에 쓴 문장이
// 전날 칸으로 밀립니다. 보는 사람의 시간대로 바꿔서 셉니다.
function localDay(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// { "2026-08-26": [{ text, createdAt, wordId }, ...] } — 그날 쓴 문장
function sentencesByDay() {
  const map = {};
  Object.entries(sentences).forEach(([wordId, list]) =>
    list.forEach((s) => {
      const day = localDay(s.createdAt);
      (map[day] ||= []).push({ ...s, wordId });
    })
  );
  Object.values(map).forEach((list) =>
    list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  );
  return map;
}

// ── 책 완결 화면 (PROMPT.md 4단계) ───────────────────────
//
// 한 권을 한 장으로 결산합니다. 끝이 있는 묶음이라 완료감이 생깁니다.
// 여기서 세는 것은 정답률이 아니라 '몇 단어가 내 문장이 되었는가'입니다.
// 난이도 · '알아요'로 거르지 않습니다. 결산은 책 전체를 보여 줘야 합니다.

function renderBook(set) {
  const words = set.words;
  const written = words.filter((w) => sentenceCount(w.id) > 0);

  // 이 책의 단어로 쓴 문장을 최신순으로 모읍니다.
  const mine = words
    .flatMap((w) => (sentences[w.id] || []).map((s) => ({ ...s, word: w })))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const pct = words.length ? Math.round((written.length / words.length) * 100) : 0;

  // 이 책의 밑줄. 결산은 '몇 단어가 내 문장이 되었는가'를 세는 자리인데,
  // 옮겨 적은 문장도 이 책을 읽은 흔적이라 같은 장에 둡니다.
  const bookMarks = markList(set.group);

  content.innerHTML = `
    <section class="book-summary">
      <p class="book-byline">${escapeHtml(set.book)}${
        set.author ? " · " + escapeHtml(set.author) : ""
      }</p>
      <h2 class="book-title">${escapeHtml(set.book)}에서 건진 ${words.length}단어</h2>
      <p class="book-lede">${
        written.length
          ? `그중 <strong>${written.length}개</strong>가 내 문장이 되었습니다.`
          : `아직 내 문장이 된 단어는 없어요. 카드에서 한 줄만 남겨 보세요.`
      }</p>
      <div class="book-bar" role="img"
           aria-label="${words.length}단어 중 ${written.length}단어에 내 문장이 있음">
        <span style="width:${pct}%"></span>
      </div>

      <h3 class="book-section">내가 쓴 문장 ${mine.length}개</h3>
      ${
        mine.length
          ? `<ul class="book-sentences">
               ${mine
                 .map(
                   (s) => `<li>
                     <span class="bs-word">${escapeHtml(s.word.word)}</span>
                     <span class="bs-text">${escapeHtml(s.text)}</span>
                     <time>${escapeHtml(String(s.createdAt).slice(0, 10))}</time>
                   </li>`
                 )
                 .join("")}
             </ul>`
          : `<p class="hint">여기가 이 책을 읽은 흔적이 남는 자리입니다.</p>`
      }

      <h3 class="book-section">밑줄 ${bookMarks.length}개</h3>
      ${
        bookMarks.length
          ? `<ul class="book-marks">
               ${bookMarks
                 .map(
                   (m) => `<li data-at="${escapeHtml(m.createdAt)}">
                     <blockquote class="mark-text">${marks.highlight(
                       m.text,
                       words,
                       escapeHtml
                     )}</blockquote>
                     <time>${escapeHtml(String(m.createdAt).slice(0, 10))}</time>
                     <button type="button" class="link-btn mark-del"
                             aria-label="이 밑줄 지우기">지우기</button>
                   </li>`
                 )
                 .join("")}
             </ul>`
          : `<p class="hint">읽다가 걸린 문장을 옮겨 적어 두면 여기 모입니다.</p>`
      }
      ${markFormHtml(set.group)}

      <h3 class="book-section">단어 ${words.length}개</h3>
      <ul class="book-words">
        ${words
          .map((w) => {
            const n = sentenceCount(w.id);
            return `<li${n ? ' class="has-mine"' : ""}>
              <span class="bw-word">${escapeHtml(w.word)}</span>
              <span class="bw-meaning">${escapeHtml(w.meaning)}</span>
              ${n ? `<span class="bw-count">문장 ${n}</span>` : ""}
            </li>`;
          })
          .join("")}
      </ul>
    </section>
  `;

  wireMarkForms();

  // 지우는 것은 언제든 됩니다. 확인을 묻지 않습니다 — 내 것이니까요. (PROMPT.md 6.6)
  content.querySelectorAll(".mark-del").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const li = btn.closest("li");
      await store.deleteMark(set.group, li.dataset.at);
      myMarks = await store.getMarks();
      renderBook(set);
    });
  });
}

// ── 달력 (PROMPT.md 5.1 ③) ───────────────────────────────
//
// 여기 찍히는 것은 '공부한 날'이 아니라 '쓴 날'입니다. 지표가 곧 제품의 정의라서,
// 달력이 무엇을 세는지가 앱이 무엇을 하는 곳인지를 말합니다.
// 연속 일수는 한 줄로만 적고, 끊겨도 벌하지 않습니다. 숫자가 조용히 리셋될 뿐입니다.

let calendarMonth = null; // { y, m } — m 은 0부터
let calendarPick = null; // 선택한 날짜 "2026-08-26"

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function streakDays(byDay) {
  const d = new Date();
  // 오늘 아직 안 썼으면 어제까지를 셉니다. 하루 늦었다고 0으로 만들지 않습니다.
  const pad = (n) => String(n).padStart(2, "0");
  const key = (x) => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  if (!byDay[key(d)]) d.setDate(d.getDate() - 1);

  let n = 0;
  while (byDay[key(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function renderCalendar() {
  const byDay = sentencesByDay();
  const words = wordIndex();

  const now = new Date();
  if (!calendarMonth) calendarMonth = { y: now.getFullYear(), m: now.getMonth() };
  const { y, m } = calendarMonth;

  const pad = (n) => String(n).padStart(2, "0");
  const first = new Date(y, m, 1).getDay();
  const last = new Date(y, m + 1, 0).getDate();
  const todayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`;

  const cells = [];
  for (let i = 0; i < first; i++) cells.push(`<span class="cal-cell empty"></span>`);
  for (let day = 1; day <= last; day++) {
    const key = `${y}-${pad(m + 1)}-${pad(day)}`;
    const n = (byDay[key] || []).length;
    cells.push(`
      <button type="button"
              class="cal-cell${n ? " has" : ""}${key === todayKey ? " today" : ""}${
      key === calendarPick ? " picked" : ""
    }"
              data-day="${key}" ${n ? "" : "disabled"}
              aria-label="${m + 1}월 ${day}일, 쓴 문장 ${n}개">
        <span class="cal-num">${day}</span>
        <span class="cal-dots">${"<i></i>".repeat(Math.min(n, 3))}</span>
      </button>`);
  }

  const picked = calendarPick ? byDay[calendarPick] || [] : null;
  const streak = streakDays(byDay);
  const monthCount = Object.entries(byDay)
    .filter(([k]) => k.startsWith(`${y}-${pad(m + 1)}`))
    .reduce((n, [, list]) => n + list.length, 0);

  $("site-title").textContent = "달력";
  $("site-subtitle").textContent = streak
    ? `${streak}일째 이어서 쓰는 중`
    : "쓴 날에 표시가 남습니다";

  content.innerHTML = `
    <section class="calendar">
      <div class="cal-head">
        <button type="button" class="cal-nav" data-move="-1" aria-label="이전 달">‹</button>
        <p class="cal-title">${y}년 ${m + 1}월</p>
        <button type="button" class="cal-nav" data-move="1" aria-label="다음 달">›</button>
      </div>

      <div class="cal-weekdays">
        ${WEEKDAYS.map((d) => `<span>${d}</span>`).join("")}
      </div>
      <div class="cal-grid">${cells.join("")}</div>

      <p class="cal-month-stat">${
        monthCount ? `이 달에 쓴 문장 ${monthCount}개` : "이 달은 아직 비어 있어요"
      }</p>

      ${
        picked
          ? `<div class="cal-detail">
               <h3 class="book-section">${escapeHtml(
                 calendarPick.replace(/^\d+-0?/, "").replace("-", "월 ")
               )}일에 쓴 문장 ${picked.length}개</h3>
               <ul class="book-sentences">
                 ${picked
                   .map((s) => {
                     const w = words[s.wordId];
                     return `<li>
                       <span class="bs-word">${escapeHtml(w?.word || "?")}</span>
                       <span class="bs-text">${escapeHtml(s.text)}</span>
                     </li>`;
                   })
                   .join("")}
               </ul>
             </div>`
          : `<p class="hint cal-guide">표시가 있는 날짜를 누르면 그날 쓴 문장이 보입니다.</p>`
      }
    </section>
  `;

  content.querySelectorAll(".cal-nav").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = new Date(y, m + Number(btn.dataset.move), 1);
      calendarMonth = { y: next.getFullYear(), m: next.getMonth() };
      calendarPick = null;
      renderCalendar();
    });
  });

  content.querySelectorAll("[data-day]").forEach((btn) => {
    btn.addEventListener("click", () => {
      calendarPick = calendarPick === btn.dataset.day ? null : btn.dataset.day;
      renderCalendar();
    });
  });
}

// ── 내 문장 노트 (PROMPT.md 5.6) ─────────────────────────
//
// 내가 쓴 것만 모아 보는 곳입니다. 첨삭도 평가도 하지 않습니다.
// 고치고 지우는 것만 됩니다. 평가가 붙는 순간 쓰기가 시험이 되고, 사람은 안 씁니다.

let notesGroup = "time"; // "time" | "word" | "book"

function renderNotes() {
  const words = wordIndex();
  const all = Object.entries(sentences)
    .flatMap(([wordId, list]) => list.map((s) => ({ ...s, wordId })))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  $("site-title").textContent = "내 문장";
  $("site-subtitle").textContent = all.length ? `${all.length}개` : "";

  if (all.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <p>아직 쓴 문장이 없어요.</p>
        <p class="hint">단어 카드 아래 칸에 한 줄만 남기면 여기에 모입니다.</p>
      </div>`;
    return;
  }

  // 묶는 방식만 다르고, 보여 주는 줄은 같습니다.
  const groups = [];
  if (notesGroup === "time") {
    groups.push({ title: null, items: all });
  } else if (notesGroup === "word") {
    const by = {};
    all.forEach((s) => ((by[s.wordId] ||= []).push(s)));
    Object.entries(by).forEach(([wordId, items]) =>
      groups.push({ title: words[wordId]?.word || "?", items })
    );
  } else {
    const by = {};
    all.forEach((s) => {
      const key = words[s.wordId]?.book || "책 밖에서 담은 단어";
      (by[key] ||= []).push(s);
    });
    Object.entries(by).forEach(([title, items]) => groups.push({ title, items }));
  }

  content.innerHTML = `
    <section class="notes">
      <div class="notes-tabs">
        ${[
          ["time", "시간순"],
          ["word", "단어별"],
          ["book", "책별"],
        ]
          .map(
            ([k, label]) =>
              `<button type="button" class="notes-tab${
                notesGroup === k ? " active" : ""
              }" data-group="${k}">${label}</button>`
          )
          .join("")}
      </div>

      ${groups
        .map(
          (g) => `
        ${g.title ? `<h3 class="book-section">${escapeHtml(g.title)}</h3>` : ""}
        <ul class="note-list">
          ${g.items
            .map((s) => {
              const w = words[s.wordId];
              return `<li data-word="${escapeHtml(s.wordId)}" data-at="${escapeHtml(
                s.createdAt
              )}">
                <div class="note-top">
                  ${
                    notesGroup === "word"
                      ? ""
                      : `<span class="bs-word">${escapeHtml(w?.word || "?")}</span>`
                  }
                  <time>${escapeHtml(localDay(s.createdAt))}</time>
                </div>
                <p class="note-text">${escapeHtml(s.text)}</p>
                <div class="note-actions">
                  <button type="button" class="link-btn note-edit">고치기</button>
                  <button type="button" class="link-btn note-del">지우기</button>
                </div>
              </li>`;
            })
            .join("")}
        </ul>`
        )
        .join("")}
    </section>
  `;

  content.querySelectorAll(".notes-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      notesGroup = btn.dataset.group;
      renderNotes();
    });
  });

  content.querySelectorAll(".note-edit").forEach((btn) => {
    btn.addEventListener("click", () => startEditNote(btn.closest("li")));
  });

  content.querySelectorAll(".note-del").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const li = btn.closest("li");
      await store.deleteSentence(li.dataset.word, li.dataset.at);
      sentences = await store.getSentences();
      renderNotes();
    });
  });
}

// 제자리에서 고칩니다. 새 화면으로 넘기지 않습니다.
function startEditNote(li) {
  const p = li.querySelector(".note-text");
  const before = p.textContent;

  p.outerHTML = `
    <form class="note-edit-form">
      <input type="text" maxlength="200" value="${escapeHtml(before)}">
      <button type="submit">저장</button>
      <button type="button" class="link-btn note-cancel">취소</button>
    </form>`;

  const form = li.querySelector(".note-edit-form");
  form.querySelector("input").focus();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = form.querySelector("input").value.trim();
    if (!text) return;
    await store.updateSentence(li.dataset.word, li.dataset.at, text);
    sentences = await store.getSentences();
    renderNotes();
  });

  form.querySelector(".note-cancel").addEventListener("click", () => renderNotes());
}

// ── 단어 카드 ────────────────────────────────────────────
//
// 카드의 끝점은 '맞혔는가'가 아니라 '썼는가'입니다. (PROMPT.md 3)
// 그래서 카드 아래에는 정답률 대신 내가 쓴 문장이 쌓이고, 한 줄 쓰는 칸이 열려 있습니다.
// 문장을 하나라도 쓰면 예문 자리에 내 문장이 먼저 옵니다 — 쓸수록 앱이 내 것이 됩니다. (5.3)

function wordCard(w, justWrote = false) {
  const { plain } = parseExample(w.example);
  const mine = sentences[w.id] || [];

  const card = document.createElement("article");
  card.className = "word-card";
  card.innerHTML = `
    <div class="card-head">
      <p class="word">${escapeHtml(w.word)}${
        w.hanja ? `<span class="hanja">${escapeHtml(w.hanja)}</span>` : ""
      }</p>
      <!-- 난이도는 '2단계' 같은 배지 대신 점 세 개로. 읽는 것을 방해하지 않습니다. -->
      <span class="level-dots" aria-label="난이도 ${w.level}단계">
        ${[1, 2, 3]
          .map((n) => `<i${n <= w.level ? ' class="on"' : ""}></i>`)
          .join("")}
      </span>
    </div>
    <p class="meaning">${escapeHtml(w.meaning)}</p>
    ${
      mine.length
        ? // 내 문장이 앱 예문을 대체합니다. 앱 예문은 접어 둡니다.
          `<p class="example mine">
             <span class="mine-tag">내 문장</span>${escapeHtml(mine[0].text)}
             <button type="button" class="link-btn del-sentence"
                     data-at="${escapeHtml(mine[0].createdAt)}">지우기</button>
           </p>
           ${
             // '찾기'로 담은 단어에는 학습용 예문이 없습니다. 그 자리는 내 문장이 채웁니다.
             plain
               ? `<details class="dict-example">
                    <summary>학습용 예문</summary>
                    <p>${escapeHtml(plain)}</p>
                  </details>`
               : ""
           }`
        : plain
        ? `<p class="example">${escapeHtml(plain)}</p>`
        : ""
    }
    ${
      w.dictExample
        ? `<details class="dict-example">
             <summary>사전 예문</summary>
             <p>${escapeHtml(w.dictExample)}</p>
           </details>`
        : ""
    }
    <div class="synonyms">
      ${(w.synonyms || [])
        .map((s) => `<span class="tag">${escapeHtml(s)}</span>`)
        .join("")}
    </div>
    ${
      mine.length > 1
        ? `<details class="my-sentences">
             <summary>이전에 쓴 문장 ${mine.length - 1}개</summary>
             <ul>
               ${mine
                 .slice(1)
                 .map(
                   (s) => `<li>
                     <span>${escapeHtml(s.text)}</span>
                     <button type="button" class="link-btn del-sentence"
                             data-at="${escapeHtml(s.createdAt)}">지우기</button>
                   </li>`
                 )
                 .join("")}
             </ul>
           </details>`
        : ""
    }
    <form class="write-form">
      <input type="text" maxlength="200" placeholder="이 단어로 한 줄 —"
             aria-label="${escapeHtml(w.word)}(으)로 한 줄 쓰기">
      <button type="submit">남기기</button>
    </form>
    ${
      justWrote
        ? `<p class="write-reward">이제 이 단어는 당신 문장으로 돌아옵니다.</p>`
        : ""
    }
    <div class="card-foot">
      <span class="card-progress">${
        // 성패가 아니라 활동을 보여 줍니다. 0개일 때는 세지 않고 권합니다.
        sentenceCount(w.id)
          ? `이 단어로 쓴 문장 ${sentenceCount(w.id)}개`
          : "아직 쓴 문장이 없어요"
      }</span>
      <button type="button" class="known-btn link-btn">알아요</button>
    </div>
  `;

  // 카드 하나만 갈아 끼웁니다. 전체를 다시 그리면 스크롤 위치가 튑니다.
  const refresh = (wrote = false) => card.replaceWith(wordCard(w, wrote));

  card.querySelector(".write-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = e.target.querySelector("input");
    const text = input.value.trim();
    if (!text) return; // 비우고 넘겨도 아무 일도 일어나지 않습니다 (6.6)

    input.disabled = true;
    try {
      await store.addSentence(w.id, text);
      await store.recordDay({ sentences: 1 });
      // 쓴 단어는 복습 간격을 한 단계 건너뜁니다. (PROMPT.md 7)
      // 직접 만들어 쓰는 인출이 보기에서 고르는 인출보다 훨씬 강하기 때문입니다.
      await store.setProgress(w.id, review.advance(progress[w.id], { wrote: true }));
      progress = await store.getProgress();
      sentences = await store.getSentences();
      refresh(true);
    } catch (err) {
      input.disabled = false;
      console.warn("문장을 저장하지 못했습니다:", err);
    }
  });

  card.querySelectorAll(".del-sentence").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await store.deleteSentence(w.id, btn.dataset.at);
      sentences = await store.getSentences();
      refresh();
    });
  });

  card.querySelector(".known-btn").addEventListener("click", async () => {
    await store.setKnown(w.id, true);
    progress = await store.getProgress();
    render();
  });

  return card;
}

// ── 찾기 (PROMPT.md 5.5) ─────────────────────────────────
//
// 입구가 둘입니다.
//   word  표제어를 안다 → 표준국어대사전에 바로 묻습니다
//   feel  느낌만 안다   → 모델이 후보를 떠올리고, 그 후보를 다시 사전에 되물어
//                        뜻이 확인된 것만 화면에 올립니다. 사전에 없는 말은 여기서
//                        걸러집니다. 탐색은 모델이, 신뢰는 사전이 담당합니다.
//
// 여기서 고른 단어는 곧바로 어휘장에 들어갑니다. 등록 마찰을 0으로 둡니다.

const searchModal = $("search-modal");
const searchForm = $("search-form");
const searchInput = $("search-input");
const searchHint = $("search-hint");
const searchResult = $("search-result");

let searchMode = "word";

const PLACEHOLDER = {
  word: "찾을 단어 (예: 환멸)",
  feel: "표현하고 싶은 상태 (예: 억지로 참는데 겉으론 태연한 척)",
};

function setSearchMode(mode) {
  searchMode = mode;
  document
    .querySelectorAll(".search-tab")
    .forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
  searchInput.placeholder = PLACEHOLDER[mode];
  searchInput.value = "";
  searchHint.textContent = "";
  searchHint.className = "hint";
  searchResult.innerHTML = "";
  searchInput.focus();
}

function openSearch() {
  searchModal.hidden = false;
  setSearchMode("word");
}

function closeSearch() {
  searchModal.hidden = true;
}

// 찾기 창을 여는 길은 책장의 '찾기' 도구 하나뿐입니다. (PROMPT.md 11)
$("search-close").addEventListener("click", closeSearch);
searchModal.addEventListener("click", (e) => {
  if (e.target === searchModal) closeSearch();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !searchModal.hidden) closeSearch();
});
document.querySelectorAll(".search-tab").forEach((btn) => {
  btn.addEventListener("click", () => setSearchMode(btn.dataset.mode));
});

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q) return;

  searchResult.innerHTML = "";
  searchHint.className = "hint";
  searchHint.textContent = searchMode === "word" ? "찾는 중..." : "떠올리는 중...";

  try {
    const { lookup } = await import("./lib/dict.js");

    if (searchMode === "word") {
      const senses = await lookup(q);
      searchHint.textContent = `${senses.length}개의 뜻을 찾았어요.`;
      renderCandidates(senses);
      return;
    }

    // 1) 모델에게 후보 낱말을 받습니다. (이름만 받습니다)
    const res = await fetch("/api/reverse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "후보를 찾지 못했습니다.");

    // 2) 후보를 사전에 되물어 뜻을 채웁니다. 사전에 없으면 조용히 뺍니다.
    searchHint.textContent = `후보 ${json.words.length}개를 사전에서 확인하는 중...`;
    const checked = await Promise.all(
      json.words.map((w) =>
        lookup(w)
          .then((senses) => senses[0] || null)
          .catch(() => null)
      )
    );
    const senses = checked.filter(Boolean);

    if (senses.length === 0) {
      searchHint.className = "hint error";
      searchHint.textContent = "사전에서 확인된 낱말이 없었어요. 다르게 적어 보세요.";
      return;
    }
    searchHint.textContent = `사전에서 확인된 낱말 ${senses.length}개예요.`;
    renderCandidates(senses);
  } catch (err) {
    searchHint.className = "hint error";
    searchHint.textContent = err.message;
  }
});

// 후보 한 줄. 뜻과 출처는 전부 표준국어대사전에서 온 것만 씁니다. (PROMPT.md 6.1)
function renderCandidates(senses) {
  // 어느 책에서 만난 단어인지 골라 둡니다. 책에 붙어야 '내가 그 책에서 건진 단어'가
  // 되고, 안 붙으면 그냥 단어장이 됩니다. 기본값은 마지막으로 펼쳐 본 책입니다.
  const options = [
    ...myBooks.map((b) => ({ slug: b.slug, label: b.book })),
    ...shelfBooks().map((b) => ({ slug: b.slug, label: b.book })),
  ];

  const picker = options.length
    ? `<label class="save-to">
         <span>담을 곳</span>
         <select id="save-to">
           ${options
             .map(
               (o) =>
                 `<option value="${escapeHtml(o.slug)}"${
                   o.slug === currentBookSlug ? " selected" : ""
                 }>${escapeHtml(o.label)}</option>`
             )
             .join("")}
           <option value="">책 없이</option>
         </select>
       </label>`
    : "";

  searchResult.innerHTML =
    picker +
    senses
      .map(
      (s, i) => `
      <div class="sense-box">
        <p class="sense-meaning">
          ${escapeHtml(s.word)}
          ${s.pos ? `<span class="pos">${escapeHtml(s.pos)}</span>` : ""}
        </p>
        <p class="hint">${escapeHtml(s.meaning)}</p>
        ${
          s.examples?.length
            ? `<p class="sense-example">${escapeHtml(s.examples[0])}</p>`
            : ""
        }
        <div class="sense-actions">
          <button type="button" class="save-btn" data-i="${i}">담기</button>
          ${
            s.sourceUrl
              ? `<a class="link-btn" href="${escapeHtml(
                  s.sourceUrl
                )}" target="_blank" rel="noopener">사전에서 보기</a>`
              : ""
          }
        </div>
      </div>`
    )
    .join("");

  searchResult.querySelectorAll(".save-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const s = senses[Number(btn.dataset.i)];
      btn.disabled = true;
      btn.textContent = "담았어요";

      // 어느 책에서 만났는지를 함께 남깁니다. 이게 개인 코퍼스가 만들어지는 지점입니다.
      const bookSlug = $("save-to")?.value || null;

      await store.addMyWord(
        {
          word: s.word,
          hanja: null,
          meaning: s.meaning, // 표준국어대사전 원문 그대로
          example: "", // 학습용 예문은 없습니다. 이 자리는 내 문장이 채웁니다.
          dictExample: s.examples?.[0] || null,
          synonyms: [],
          level: 2,
          sourceUrl: s.sourceUrl || null,
        },
        bookSlug
      );

      myWords = await store.getMyWords();
      closeSearch();

      // 담자마자 그 단어를 볼 수 있게 데려갑니다. 등록 마찰을 0으로 둡니다.
      // 내가 꽂은 책은 책 자체가 한 묶음이고, 우리가 준비한 책은 그 안의
      // '내가 담은 단어' 묶음으로 들어갑니다.
      if (!bookSlug) openSet("mine");
      else if (myBooks.some((b) => b.slug === bookSlug)) openSet(bookSlug);
      else openSet(`${bookSlug}-mine`);
    });
  });
}

// ── 난이도 (PROMPT.md 6.4) ───────────────────────────────

levelSelect.addEventListener("change", async () => {
  settings = await store.saveSettings({ level: Number(levelSelect.value) });
  render();
});

// 시작하다 실패하면 흰 화면만 남습니다. 그러면 무엇이 잘못됐는지 알 길이 없습니다.
// 조용히 죽는 대신 화면에 적습니다.
function showBootError(err) {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="boot-error">
       <strong>앱을 시작하지 못했습니다.</strong>
       <p>${escapeHtml(String(err?.message || err))}</p>
       <pre>${escapeHtml(String(err?.stack || "").slice(0, 600))}</pre>
     </div>`
  );
}

window.addEventListener("error", (e) => showBootError(e.error || e.message));
window.addEventListener("unhandledrejection", (e) => showBootError(e.reason));

boot().catch(showBootError);
