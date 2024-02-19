const startBtn = document.querySelector("#start-btn");
const introSection = document.querySelector("#intro-section");
const quizSection = document.querySelector("#quiz-section");
const quizList = document.querySelector("#quiz-list");
const exitSection = document.querySelector("#exit-section");
const scoresSection = document.querySelector("#scores");
const scoresList = scoresSection.querySelector("#scores-list");
const backBtn = scoresSection.querySelector("#back-btn");
const clearBtn = scoresSection.querySelector("#clear-btn");

const finalScoreElement = document.querySelector("#final-score-elem");
const userForm = exitSection.querySelector("form");

// Start Quiz

let questionIndex = 0;
let quizQuestions = null;
let finalScore = null;

startBtn.addEventListener("click", async () => {
    const response = await fetch("./questions.json");
    quizQuestions = await response.json();
    // giving each question a unique identifier
    quizQuestions = quizQuestions.map((question, index) => {
        return {
            ...question,
            id: crypto.randomUUID(),
            answered: false,
        };
    });
    // console.log(quizQuestions);
    const quizListItemString = renderQuizList(quizQuestions, questionIndex);
    hideSection(introSection);
    quizList.innerHTML = quizListItemString;
    showSection(quizSection);
    quizList.addEventListener("click", handleOptionSelect);
});

function handleOptionSelect(e) {
    if (!e.target.dataset.quizOption) {
        return;
    }
    const questionId = e.target.closest("li[data-question-id]").dataset
        .questionId;
    const option = e.target.dataset.quizOption;
    setAnswered(questionId, option);
}

async function setAnswered(id, option) {
    let answeredCorrectly;
    quizQuestions = quizQuestions.map((question) => {
        if (question.id === id) {
            answeredCorrectly = question.answer === option;
            return {
                ...question,
                answered: true,
                isCorrect: question.answer === option,
            };
        }
        return question;
    });
    let newRender = renderQuizList(quizQuestions, questionIndex);
    quizList.innerHTML = newRender;
    await playSound(answeredCorrectly);
    await delay();
    questionIndex++;
    newRender = renderQuizList(quizQuestions, questionIndex);
    quizList.innerHTML = newRender;
    const allAnswered = quizQuestions.every((q) => q.answered);
    if (allAnswered) {
        hideSection(quizSection);

        initialiseExit(quizQuestions);
    }
}

function initialiseExit(questions) {
    showSection(exitSection);
    const isCorrect = questions.filter((q) => q.isCorrect);
    finalScore = Math.floor((isCorrect.length / 5) * 100);
    finalScoreElement.textContent = finalScore;
    userForm.addEventListener("submit", handleUserInfoSubmit);
}

function handleUserInfoSubmit(e) {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(this));
    console.log(formData);
    const { "user-initials": userInitials } = formData;
    const user = userInitials.trim() ? userInitials : "unknown user";
    this.reset();
    saveUserData(user, finalScore);
}

function saveUserData(initials, score) {
    console.log(initials, score);
    let savedScores = JSON.parse(localStorage.getItem("saved-score"));
    if (!savedScores) {
        const scoresList = [{ initials, score }];
        localStorage.setItem("saved-score", JSON.stringify(scoresList));
    } else {
        savedScores = [{ initials, score }, ...savedScores];
        localStorage.setItem("saved-score", JSON.stringify(savedScores));
    }
    hideSection(exitSection);
    displayScores();
}

function displayScores() {
    showSection(scoresSection);
    const savedScores = JSON.parse(localStorage.getItem("saved-score"));
    const scoreListStr = generateScoreListStr(savedScores);
    scoresList.innerHTML = scoreListStr;
    backBtn.addEventListener("click", resetQuiz);
    clearBtn.addEventListener("click", resetScores);
}

function resetQuiz() {
    questionIndex = 0;
    quizQuestions = null;
    finalScore = null;
    hideSection(scoresSection);
    showSection(introSection);
}

function resetScores() {
    localStorage.removeItem("saved-score");
    scoresList.innerHTML = "";
}

function delay(ms = 1500) {
    return new Promise((res) => {
        setTimeout(res, ms);
    });
}

async function playSound(answeredCorrectly) {
    const audio = new Audio();
    if (answeredCorrectly) {
        audio.src = await getSound("../assets/sounds/correct.wav");
    } else {
        audio.src = await getSound("../assets/sounds/incorrect.wav");
    }
    return audio.play();
}

async function getSound(localSource) {
    const response = await fetch(localSource);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
}

function generateScoreListStr(list = []) {
    return list
        .map((score, index) => {
            return `<li><span>${index + 1}. ${score.initials}</span><span>${
                score.score
            }</span></li>`;
        })
        .join("");
}

function renderQuizList(list, questionIndex = 0) {
    return list
        .map((question, index) => {
            return `
            <li data-question-id="${question.id}" data-question-shown="${
                index === questionIndex
            }">
                <h3>${question.title}</h3>
                <ul class="quiz-options-list unstyled-list">
                    ${(function () {
                        return question.choices
                            .map((choice, index) => {
                                return `<li><button ${
                                    question.answered ? "disabled" : ""
                                } data-quiz-option="${choice}">${
                                    index + 1
                                }.  ${choice}</button></li>`;
                            })
                            .join("");
                    })()}
                </ul>
                ${
                    question.answered
                        ? `<div class="result">
                    <p>${question.isCorrect ? "Correct!!!" : "Wrong!!!"}</p>
                </div>`
                        : ""
                }
            </li>
        `;
        })
        .join("");
}

function hideSection(section) {
    section.dataset.shown = false;
}

function showSection(section) {
    section.dataset.shown = true;
}
