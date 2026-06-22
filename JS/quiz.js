(function () {
  const STORAGE_KEY = "intQuizCompletedQuestions";
  const REVEAL_DELAY_MS = 2000;

  const quizData = Array.isArray(window.QUIZ_DATA) ? window.QUIZ_DATA : [];

  function readCompleted() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  function writeCompleted(ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)].sort((a, b) => a - b)));
    } catch (error) {
      // The quiz still works without persistence if storage is unavailable.
    }
  }

  function markCompleted(id) {
    const completed = readCompleted();
    if (!completed.includes(id)) {
      completed.push(id);
      writeCompleted(completed);
    }
  }

  function resetCompleted() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      writeCompleted([]);
    }
  }

  function initIndexPage() {
    const startButton = document.querySelector('[data-action="start"]');

    if (startButton) {
      startButton.addEventListener("click", () => {
        window.location.href = "pages/all_questions.html";
      });
    }
  }

  function initQuestionsPage() {
    const grid = document.getElementById("questionsGrid");
    const finishButton = document.querySelector('[data-action="finish"]');
    const completed = readCompleted();

    if (grid) {
      grid.innerHTML = "";

      quizData.forEach((question) => {
        const tile = document.createElement("button");
        const isDone = completed.includes(question.id);

        tile.type = "button";
        tile.className = `number-tile${isDone ? " number-tile--done" : ""}`;
        tile.textContent = question.id;
        tile.dataset.id = String(question.id);
        tile.dataset.state = isDone ? "done" : "default";
        tile.disabled = isDone;
        tile.setAttribute("aria-label", isDone ? `Вопрос ${question.id} пройден` : `Вопрос ${question.id}`);

        tile.addEventListener("click", () => {
          window.location.href = `slide_id.html?id=${question.id}`;
        });

        grid.appendChild(tile);
      });
    }

    if (finishButton) {
      finishButton.addEventListener("click", () => {
        resetCompleted();
        window.location.href = "../index.html";
      });
    }
  }

  function initSlidePage() {
    const params = new URLSearchParams(window.location.search);
    const questionId = Number(params.get("id"));
    const question = quizData.find((item) => item.id === questionId);
    const numberElement = document.getElementById("questionNumber");
    const textElement = document.getElementById("questionText");
    const answerButtons = [...document.querySelectorAll(".answer-card")];
    const backButton = document.querySelector('[data-action="back"]');

    if (!question) {
      window.location.replace("all_questions.html");
      return;
    }

    document.title = `Вопрос ${question.id} | ИНТ Квиз`;

    if (numberElement) {
      numberElement.textContent = question.id;
    }

    if (textElement) {
      textElement.textContent = question.question;
    }

    answerButtons.forEach((button) => {
      const option = button.dataset.option;
      const text = button.querySelector(".answer-card__text");

      if (text && option) {
        text.textContent = question.options[option] || "";
      }
    });

    let isAnswered = false;

    answerButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (isAnswered) {
          return;
        }

        isAnswered = true;
        button.dataset.state = "selected";

        answerButtons.forEach((item) => {
          item.disabled = true;
          item.setAttribute("aria-disabled", "true");
        });

        window.setTimeout(() => {
          const correctButton = answerButtons.find((item) => item.dataset.option === question.answer);

          if (correctButton) {
            correctButton.dataset.state = "true";
          }
        }, REVEAL_DELAY_MS);
      });
    });

    if (backButton) {
      backButton.addEventListener("click", () => {
        markCompleted(question.id);
        window.location.href = "all_questions.html";
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;

    if (page === "index") {
      initIndexPage();
    }

    if (page === "all-questions") {
      initQuestionsPage();
    }

    if (page === "slide") {
      initSlidePage();
    }
  });
})();
