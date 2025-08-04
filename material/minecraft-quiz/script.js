const $ = (query) => {
    return mdui.$(query)[0];
};
mdui.setColorScheme('#4CAF50');
const quizTitle = $('.quiz-title');
const optionA = $('#option-a');
const optionB = $('#option-b');
const optionC = $('#option-c');
const optionD = $('#option-d');
const checkBtn = $('.check-btn');
const quizHeader = $('.quiz-header');
const answerText = $('.answer-text');
const explanationText = $('.explanation-text');
const optionsGroup = $('.options-group');
const resultCard = $('.result-card');
const feedbackBtn = $('.feedback-btn');
const loading = $('.loading');
const quizCardContent = $('.quiz-card-content');
const quizCard = $('.quiz-card');
const nextBtn = $('.skip-btn');
const actionbar = $('.action-bar');
const askForUpdateBtn = $('.ask-for-update-btn');
const finishedWrapper = $('.finished-wrapper');
const correctCount = $('.correct-count');
const incorrectCount = $('.incorrect-count');
const retryBtn = $('.retry-btn');
const finishedActions = $('.finished-actions');
const explanationHeader = $('.explanation-header');
const correctIndicator = $('.correct-indicator');
const incorrectIndicator = $('.incorrect-indicator');
const skippedCount = $('.skipped-count');
const timeSpent = $('.time-spent');
const endGameLink = $('.end-game-link');
let quizData; // all quiz data fetched
let answeredQuiz = []; // array[single quiz object]
let quiz; // current quiz object
let quizzsAmount;
let correctAmount = 0;
let incorrectAmount = 0;
let st = Date.now();
let et;
let dblclickTimeStack = [];

function random(array) {
     return array[Math.floor(Math.random() * array.length)];
};

async function fetchQuizsSrc() {
    const response = await fetch('/static/minecraft-quiz.json');
    quizData = await response.json();
    quizzsAmount = quizData.length;
    loading.style.display = 'none';
    quizCardContent.style.display = 'flex';
    quizCard.style.alignItems = 'normal';
    loadQuiz();
};

async function loadQuiz() {
    correctIndicator.style.display = 'none';
    incorrectIndicator.style.display = 'none';
    resultCard.style.display = 'none';
    optionsGroup.disabled = false;
    optionsGroup.value = '';
    checkBtn.textContent = 'Check Answer';
    checkBtn.icon = '';
    quiz = random(quizData);
    if (answeredQuiz.includes(quiz)) {
        loadQuiz();
        return;
    };
    quizHeader.innerHTML = `Minecraft Quiz · Question ${answeredQuiz.length + 1} / ${quizzsAmount}`;
    quizTitle.innerHTML = quiz.title;
    optionA.innerHTML = `A. ${quiz.a}`;
    optionB.innerHTML = `B. ${quiz.b}`;
    optionC.innerHTML = `C. ${quiz.c}`; 
    optionD.innerHTML = `D. ${quiz.d}`;
    answerText.innerHTML = quiz.answer;
    if (quiz.explanation) {
        answerText.title = quiz.explanation;
        explanationText.textContent = quiz.explanation;
        explanationHeader.style.display = 'block';
    } else {
        explanationHeader.style.display = 'none';
        explanationText.textContent = '';
        answerText.title = 'No explanations available.';
    };
    nextBtn.disabled = false;
};

checkBtn.onclick = () => {
    if (optionsGroup.value === quiz.answer) {
        checkBtn.textContent = 'Correct!';
        checkBtn.icon = 'check';
        correctAmount++;
        correctIndicator.style.display = 'flex';
    } else {
        checkBtn.textContent = 'Incorrect';
        checkBtn.icon = 'close';
        incorrectAmount++;
        incorrectIndicator.style.display = 'flex';
    };
    resultCard.style.display = 'flex';
    checkBtn.disabled = true;
    optionsGroup.disabled = true;
    nextBtn.disabled = false;
};

optionsGroup.onchange = () => {
    checkBtn.disabled = false;
    if (optionsGroup.value) {
        nextBtn.disabled =  true;
    };
};

nextBtn.onclick = () => {
    answeredQuiz.push(quiz);
    if (answeredQuiz.length === quizzsAmount) {
        endGame();
        return;
    };
    loadQuiz();
};

fetchQuizsSrc();

retryBtn.onclick = () => {
    location.reload();
};

function endGame() {
    resultCard.style.display = 'none';
    quizCardContent.style.display = 'none';
    actionbar.style.display = 'none';
    askForUpdateBtn.href = feedbackBtn.href;
    askForUpdateBtn.target = '_blank';
    finishedActions.style.display = 'flex';
    finishedWrapper.style.display = 'flex';
    correctCount.textContent = `${correctAmount} / ${quizzsAmount}`;
    incorrectCount.textContent = incorrectAmount;
    skippedCount.textContent = quizzsAmount - correctAmount - incorrectAmount;
    et = Date.now();
    timeSpent.textContent = `${(et - st) / 1000}s`;
    endGameLink.style.display = 'none';
};

endGameLink.ondblclick = endGame;
endGameLink.onclick = () => {
    dblclickTimeStack.push(Date.now());
    if (dblclickTimeStack.length === 2) {
        if (dblclickTimeStack[1] - dblclickTimeStack[0] < 1000) {
            endGame();
        } else {
            dblclickTimeStack = [];
        };
    };
};