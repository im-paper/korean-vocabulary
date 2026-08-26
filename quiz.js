import { parseExample, escapeHtml } from "./utils.js";
import { recordAttempt } from "./lib/store.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 예문 빈칸 채우기 퀴즈. container에 렌더링하고, 종료 시 onExit을 호출한다.
export function renderQuiz(container, set, onExit) {
  const questions = shuffle(
    set.words
      .map((w) => ({ word: w, parsed: parseExample(w.example) }))
      .filter((q) => q.parsed.answer)
  );

  if (questions.length === 0) {
    container.innerHTML = `<div class="empty-state">이 세트는 퀴즈용 예문이 아직 준비되지 않았어요.</div>`;
    return;
  }

  let index = 0;
  let answered = false;
  const results = [];

  function renderQuestion() {
    const q = questions[index];
    container.innerHTML = `
      <div class="quiz">
        <div class="quiz-progress">${index + 1} / ${questions.length}</div>
        <p class="quiz-meaning">뜻: ${escapeHtml(q.word.meaning)}</p>
        <p class="quiz-sentence">${escapeHtml(q.parsed.blank)}</p>
        <form id="quiz-form" autocomplete="off">
          <input type="text" id="quiz-input" placeholder="빈칸에 들어갈 말을 입력하세요" />
          <button type="submit">확인</button>
        </form>
        <div id="quiz-feedback" class="quiz-feedback"></div>
        <button type="button" id="quiz-exit" class="quiz-exit">그만 보기</button>
      </div>
    `;

    container.querySelector("#quiz-exit").addEventListener("click", onExit);

    const form = container.querySelector("#quiz-form");
    const input = container.querySelector("#quiz-input");
    const feedback = container.querySelector("#quiz-feedback");
    input.focus();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (answered) {
        goNext();
        return;
      }
      answered = true;
      const isCorrect = input.value.trim() === q.parsed.answer;
      // 기록 저장 실패가 퀴즈 진행을 막지는 않도록 한다.
      recordAttempt(q.word.id, isCorrect).catch((err) =>
        console.error("기록 저장 실패:", err)
      );
      results.push({ word: q.word.word, correct: isCorrect });

      feedback.innerHTML = isCorrect
        ? `<span class="correct">정답이에요!</span>`
        : `<span class="incorrect">아쉬워요. 정답: <strong>${escapeHtml(
            q.parsed.answer
          )}</strong></span>`;

      form.querySelector("button[type=submit]").textContent =
        index + 1 === questions.length ? "결과 보기" : "다음 문제";
      input.disabled = true;
    });
  }

  function goNext() {
    index += 1;
    answered = false;
    if (index >= questions.length) {
      renderSummary();
    } else {
      renderQuestion();
    }
  }

  function renderSummary() {
    const correctCount = results.filter((r) => r.correct).length;
    const wrong = results.filter((r) => !r.correct).map((r) => r.word);
    container.innerHTML = `
      <div class="quiz quiz-summary">
        <p class="quiz-score">${questions.length}문제 중 <strong>${correctCount}개</strong> 정답</p>
        ${
          wrong.length
            ? `<p class="quiz-wrong-title">다시 볼 단어</p>
               <div class="synonyms">${wrong
                 .map((w) => `<span class="tag">${escapeHtml(w)}</span>`)
                 .join("")}</div>`
            : `<p>모두 맞혔어요!</p>`
        }
        <div class="quiz-summary-actions">
          <button type="button" id="quiz-retry">다시 풀기</button>
          <button type="button" id="quiz-exit-2" class="quiz-exit">단어장으로 돌아가기</button>
        </div>
      </div>
    `;
    container.querySelector("#quiz-retry").addEventListener("click", () => {
      index = 0;
      answered = false;
      results.length = 0;
      renderQuestion();
    });
    container.querySelector("#quiz-exit-2").addEventListener("click", onExit);
  }

  renderQuestion();
}
