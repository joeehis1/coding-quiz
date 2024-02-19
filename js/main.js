// Header and start of the quiz

const startBtn = document.querySelector("#start-btn");
const introSection = document.querySelector("#intro-section");
const showScoreBtn = document.querySelector("#show-scores");

// timer initial declarations
const timerEl = document.querySelector("#timer");

// initial duration is saved as a data attribute in the timer element. This is just a design choice, you can hardcode the duration value
let duration = Number(timerEl.dataset.duration);
timerEl.innerHTML = duration;

// Quiz
const quizSection = document.querySelector("#quiz-section");
const quizList = document.querySelector("#quiz-list");

// Exit
const exitSection = document.querySelector("#exit-section");
const exitTextElement = exitSection.querySelector("#exit-text");
const scoresSection = document.querySelector("#scores");
const scoresList = scoresSection.querySelector("#scores-list");
const backBtn = scoresSection.querySelector("#back-btn");
const clearBtn = scoresSection.querySelector("#clear-btn");

const finalScoreElement = document.querySelector("#final-score-elem");
const userForm = exitSection.querySelector("form");

// These buttons are shown when you reach the end of the game.

backBtn.addEventListener("click", resetQuiz);
clearBtn.addEventListener("click", resetScores);

// Start Quiz

let questionIndex = 0;
let quizQuestions = null;
let finalScore = null;
let timerId = null;

// This prop prevents a user from being able to view high scores while game is in progress
let gameInProgress = false;

// Event handling

showScoreBtn.addEventListener("click", displayScores);

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
    // hideSection(introSection);
    quizList.innerHTML = quizListItemString;
    gameInProgress = true;
    startTimer(timerEl, duration);
    showSection(quizSection);
    quizList.addEventListener("click", handleOptionSelect);
});

function startTimer(element, timeInSeconds) {
    // This check is in place for when the decrease duration function passes in a time that is less than or equal to 0
    if (timeInSeconds <= 0) {
        element.innerHTML = 0;
        return stopTimer();
    }
    // element is the timer element
    element.innerHTML = timeInSeconds;
    timerId = setInterval(() => {
        timeInSeconds = timeInSeconds - 1;
        element.innerHTML = timeInSeconds;
        duration = timeInSeconds;

        if (timeInSeconds <= 0) {
            stopTimer();
        }
    }, 1000);
}

function stopTimer() {
    initialiseExit(quizQuestions);
    clearInterval(timerId);
}

function showSection(section) {
    let openSection = document.querySelector(`section[data-shown="true"]`);
    if (openSection) {
        openSection.setAttribute("data-shown", "false");
    }
    section.dataset.shown = true;
}

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
    decreaseDuration(answeredCorrectly);
    // This delay is necessary to allow for a user to know whether or not their answer was right or wrong

    await delay();
    questionIndex++;
    newRender = renderQuizList(quizQuestions, questionIndex);
    quizList.innerHTML = newRender;
    const allAnswered = quizQuestions.every((q) => q.answered);

    if (allAnswered) {
        // initialiseExit(quizQuestions);
        stopTimer();
    }
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

function delay(ms = 1500) {
    return new Promise((res) => {
        setTimeout(res, ms);
    });
}

function decreaseDuration(answeredCorrectly) {
    if (answeredCorrectly) return;

    //remove previous interval. without doing this the previous timer and the new timer will be running at the same

    clearInterval(timerId);
    let newDuration = duration - 10;
    duration = newDuration;
    startTimer(timerEl, newDuration);
}

function initialiseExit(questions) {
    showSection(exitSection);
    const isCorrect = questions.filter((q) => q.isCorrect);
    //final score is a global variable that is being used to record the final score that will be saved to local storage

    finalScore = Math.floor((isCorrect.length / 5) * 100);
    const message =
        duration >= 0 && finalScore === 100
            ? "All questions completed correctly ahead of time, Well Done!!!"
            : duration >= 0 && finalScore < 100
            ? "All questions completed on time. Good Job"
            : "All Done. Don't fret, These things happen";
    finalScoreElement.textContent = finalScore;
    exitTextElement.textContent = message;
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
    gameInProgress = false;
    console.log(initials, score);
    let savedScores = JSON.parse(localStorage.getItem("saved-score"));
    if (!savedScores) {
        const scoresList = [{ initials, score }];
        localStorage.setItem("saved-score", JSON.stringify(scoresList));
    } else {
        savedScores = [{ initials, score }, ...savedScores];
        localStorage.setItem("saved-score", JSON.stringify(savedScores));
    }
    // hideSection(exitSection);
    displayScores();
}

function displayScores() {
    if (gameInProgress) return;
    showSection(scoresSection);
    const savedScores = JSON.parse(localStorage.getItem("saved-score"));
    if (!savedScores) {
        scoresList.innerHTML = "";
        return;
    }
    const scoreListStr = generateScoreListStr(savedScores);
    scoresList.innerHTML = scoreListStr;
}

function resetQuiz() {
    questionIndex = 0;
    quizQuestions = null;
    finalScore = null;
    gameInProgress = false;
    duration = Number(timerEl.dataset.duration);
    timerEl.innerHTML = duration;
    showSection(introSection);
}

function resetScores() {
    localStorage.removeItem("saved-score");
    scoresList.innerHTML = "";
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
