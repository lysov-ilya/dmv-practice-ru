const STORE_KEY = "dmv_ru_mistakes";
const PROGRESS_KEY = "dmv_ru_progress";

const state = {
  questions: [],
  index: 0,
  correct: 0,
  answered: false,
  selected: null,
  selectedOption: null,
  started: false
};

const els = {
  testSelect: document.querySelector("#testSelect"),
  shuffleToggle: document.querySelector("#shuffleToggle"),
  restartBtn: document.querySelector("#restartBtn"),
  resetMistakesBtn: document.querySelector("#resetMistakesBtn"),
  questionHost: document.querySelector("#questionHost"),
  progressBar: document.querySelector("#progressBar"),
  liveScore: document.querySelector("#liveScore"),
  livePercent: document.querySelector("#livePercent"),
  results: document.querySelector("#results"),
  resultText: document.querySelector("#resultText"),
  reviewBtn: document.querySelector("#reviewBtn")
};

function getMistakes() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
  } catch {
    return [];
  }
}

function setMistakes(ids) {
  localStorage.setItem(STORE_KEY, JSON.stringify([...new Set(ids)]));
}

function getAllQuestions() {
  return [
    ...window.DMV_QUESTIONS,
    ...(window.DMV_EXTRA_QUESTIONS || []),
    ...(window.DMV_PERMIT_GG_QUESTIONS || [])
  ];
}

function shuffle(items) {
  return items
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function getSelectedQuestions() {
  const selected = els.testSelect.value;
  let questions = getAllQuestions();

  if (selected === "mistakes") {
    const mistakes = new Set(getMistakes());
    questions = questions.filter((question) => mistakes.has(question.id));
  } else if (selected === "official") {
    questions = questions.filter((question) => question.source.startsWith("California DMV Russian"));
  } else if (selected !== "all") {
    questions = questions.filter((question) => question.test === selected);
  }

  return els.shuffleToggle.checked ? shuffle(questions) : [...questions];
}

function saveProgress() {
  const data = {
    selected: els.testSelect.value,
    shuffle: els.shuffleToggle.checked,
    questionIds: state.questions.map((question) => question.id),
    index: state.index,
    correct: state.correct,
    answered: state.answered,
    selectedOption: state.selectedOption,
    started: state.started
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

function restoreProgress() {
  let data;
  try {
    data = JSON.parse(localStorage.getItem(PROGRESS_KEY));
  } catch {
    return false;
  }

  if (!data || !Array.isArray(data.questionIds) || !data.questionIds.length) return false;

  const questionById = new Map(getAllQuestions().map((question) => [question.id, question]));
  const questions = data.questionIds.map((id) => questionById.get(id)).filter(Boolean);
  if (questions.length !== data.questionIds.length) return false;

  if ([...els.testSelect.options].some((option) => option.value === data.selected)) {
    els.testSelect.value = data.selected;
  }
  els.shuffleToggle.checked = Boolean(data.shuffle);

  state.questions = questions;
  state.index = Math.min(Math.max(Number(data.index) || 0, 0), questions.length);
  state.correct = Math.min(Math.max(Number(data.correct) || 0, 0), questions.length);
  state.answered = Boolean(data.answered);
  state.selectedOption = Number.isInteger(data.selectedOption) ? data.selectedOption : null;
  state.started = data.started ?? (state.index > 0 || state.answered);
  els.results.hidden = true;
  render();
  return true;
}

function startQuiz({ started = true } = {}) {
  state.questions = getSelectedQuestions();
  state.index = 0;
  state.correct = 0;
  state.answered = false;
  state.selected = null;
  state.selectedOption = null;
  state.started = started;
  els.results.hidden = true;
  saveProgress();
  render();
}

function render() {
  updateLayoutMode();
  updateScore();

  if (!state.questions.length) {
    els.progressBar.style.width = "0%";
    els.questionHost.innerHTML = '<div class="empty">В этом наборе пока нет вопросов. Если выбран режим ошибок, сначала пройдите обычный тест.</div>';
    return;
  }

  if (state.index >= state.questions.length) {
    renderDone();
    return;
  }

  const question = state.questions[state.index];
  const progress = (state.index / state.questions.length) * 100;
  els.progressBar.style.width = `${progress}%`;

  els.questionHost.innerHTML = `
    <article class="question">
      <div class="meta">
        <span>${question.test}</span>
        <span>Вопрос ${state.index + 1} из ${state.questions.length}</span>
      </div>
      <h2>${escapeHtml(question.question)}</h2>
      <div class="options">
        ${question.options.map((option, index) => `
          <button class="option" type="button" data-option="${index}">
            <span class="letter">${String.fromCharCode(65 + index)}</span>
            <span>${escapeHtml(option)}</span>
          </button>
        `).join("")}
      </div>
      <div id="feedback" class="feedback" hidden></div>
      <div class="actions">
        <button id="nextBtn" type="button" disabled>${state.index === state.questions.length - 1 ? "Завершить" : "Следующий вопрос"}</button>
      </div>
    </article>
  `;

  document.querySelectorAll(".option").forEach((button) => {
    button.addEventListener("click", () => answerQuestion(Number(button.dataset.option)));
  });
  document.querySelector("#nextBtn").addEventListener("click", nextQuestion);

  if (state.answered) {
    showAnsweredState(question);
  }
}

function answerQuestion(selected) {
  if (state.answered) return;

  const question = state.questions[state.index];
  const isCorrect = selected === question.answer;
  state.answered = true;
  state.selectedOption = selected;
  state.started = true;

  if (isCorrect) {
    state.correct += 1;
    setMistakes(getMistakes().filter((id) => id !== question.id));
  } else {
    setMistakes([...getMistakes(), question.id]);
  }

  showAnsweredState(question);
  saveProgress();
  updateScore();
}

function showAnsweredState(question) {
  const selected = state.selectedOption;
  const isCorrect = selected === question.answer;

  document.querySelectorAll(".option").forEach((button) => {
    const option = Number(button.dataset.option);
    button.disabled = true;
    if (option === question.answer) button.classList.add("correct");
    if (option === selected && option !== question.answer) button.classList.add("wrong");
  });

  const feedback = document.querySelector("#feedback");
  feedback.hidden = false;
  const prefix = isCorrect
    ? "Верно."
    : `Неверно. Правильный ответ: ${question.options[question.answer]}`;
  const details = question.explanation ? ` ${question.explanation}` : "";
  feedback.textContent = `${prefix}${details}`;

  document.querySelector("#nextBtn").disabled = false;
}

function nextQuestion() {
  state.index += 1;
  state.answered = false;
  state.selectedOption = null;
  saveProgress();
  render();
}

function renderDone() {
  const total = state.questions.length;
  const missed = total - state.correct;
  const percent = Math.round((state.correct / total) * 100);
  els.progressBar.style.width = "100%";
  els.questionHost.innerHTML = "";
  els.results.hidden = false;
  els.resultText.textContent = `Вы ответили правильно на ${state.correct} из ${total} (${percent}%). Ошибок: ${missed}.`;
  saveProgress();
  updateScore();
}

function updateLayoutMode() {
  document.body.classList.toggle("is-started", state.started);
}

function updateScore() {
  const answered = Math.min(state.index + (state.answered ? 1 : 0), state.questions.length);
  els.liveScore.textContent = `${state.correct} / ${answered}`;
  els.livePercent.textContent = answered ? `${Math.round((state.correct / answered) * 100)}% правильных` : "Начните тест";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

els.restartBtn.addEventListener("click", () => startQuiz({ started: true }));
els.testSelect.addEventListener("change", () => startQuiz({ started: state.started }));
els.shuffleToggle.addEventListener("change", () => startQuiz({ started: state.started }));
els.resetMistakesBtn.addEventListener("click", () => {
  setMistakes([]);
  if (els.testSelect.value === "mistakes") startQuiz({ started: state.started });
});
els.reviewBtn.addEventListener("click", () => {
  els.testSelect.value = "mistakes";
  startQuiz({ started: true });
});

if (!restoreProgress()) startQuiz({ started: false });
