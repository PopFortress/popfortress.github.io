const headerText = document.querySelector('.header-text');
const quizText = document.querySelector('.quiz-text');
const quizInput = document.querySelector('.quiz-input');
const checkBtn = document.querySelector('.check-btn');
const operators = ['+', '-', '*', '/'];
const percentages = [.1, .2, .3, .4, .5, .6, .7, .8, .9];
const random = (array) => array[Math.floor(Math.random() * array.length)];
var questionNum = 0;
var quiz;
var answer;
var digit1;
var digit2;
var digit3;
var percentage;
var operator;
var randomQuizToken;
var randomEquationToken;
var randomCircleToken;
var randomStatisticsToken;
var quizType;
var answeredEquation;

function updateQuizNum() {
    questionNum++;
    headerText.innerHTML = `Question ${questionNum}`;
};

function correctAnswer() {
    checkBtn.textContent = 'Correct';
    checkBtn.icon = 'check';
    loadQuiz();
    navigator.vibrate(200);
};

function incorrectAnswer() {
    checkBtn.textContent = 'Incorrect';
    checkBtn.icon = 'close';
};

function quizSimple() {
    digit1 = Math.floor(Math.random() * (21 + questionNum));
    digit2 = Math.floor(Math.random() * (21 + questionNum));
    operator = random(operators);
    quiz = `${digit1} ${operator} ${digit2}`;
    answer = eval(quiz);
    if (Number.isInteger(answer)) {
        quizText.innerHTML = `${quiz} = `;
        updateQuizNum();
    } else {
        quizSimple();
    };
};

function quizSquareRoot() {
    digit1 = Math.floor(Math.random() * 4097);
    if (Number.isInteger(Math.sqrt(digit1))) {
        quiz = `√${digit1}`;
        answer = Math.sqrt(digit1);
        quizText.innerHTML = `${quiz} = `;
        updateQuizNum();
    } else {
        quizSquareRoot();
    };
};

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

function quizEquation() {
    digit1 = getRandomInt(1, 21);
    digit2 = getRandomInt(1, 21);
    digit3 = getRandomInt(1, 21);
    randomEquationToken = Math.random();
    if (randomEquationToken < 0.25) {
        quiz = `${digit1}*x + ${digit2} = ${digit3}`;
        answer = (digit3 - digit2) / digit1;
    } else if (randomEquationToken >= 0.25 && randomEquationToken < 0.5) {
        quiz = `${digit1}*x - ${digit2} = ${digit3}`;
        answer = (digit3 + digit2) / digit1;
    } else if (randomEquationToken >= 0.5 && randomEquationToken < 0.75) {
        quiz = `x + ${digit1}*x = ${digit2} + ${digit3}*x`;
        answer = digit2 / (1 + digit1 - digit3);
    } else {
        quiz = `x - ${digit1}*x = ${digit2} - ${digit3}*x`;
        answer = digit2 / (1 - digit1 + digit3);
    };
    if (Number.isInteger(answer)) {
        quizText.innerHTML = `${quiz.replaceAll('*', '')}<br>x = `;
        updateQuizNum();
    } else {
        quizEquation();
    };
};

function quizCircle() {
    digit1 = getRandomInt(1, 33);
    randomCircleToken = Math.random();
    if (randomCircleToken < 0.25) {
        if (digit1 % 2 != 0) {
            digit1 += 1;
        };
        quiz = `Circle diameter = ${digit1}<br>Area = `;
        quizInput.suffix = 'π';
        answer = Math.pow(digit1 / 2, 2);
    } else if (randomCircleToken >= 0.25 && randomCircleToken < 0.5) {
        if (digit1 % 2 != 0) {
            digit1 += 1;
        };
        quiz = `Circle area = ${digit1}π<br>Diameter = `
        answer = Math.sqrt(digit1) * 2;
    } else if (randomCircleToken >= 0.5 && randomCircleToken < 0.75) {
        quiz = `Circle radius = ${digit1}<br>Circumference = `
        answer = 2 * digit1;
        quizInput.suffix = 'π';
    } else {
        if (digit1 % 2 != 0) {
            digit1 += 1;
        };
        quiz = `Circle circumference = ${digit1}π<br>Radius = `
        answer = digit1 / 2;
    };
    if (Number.isInteger(answer)) {
        quizText.innerHTML = quiz;
        updateQuizNum();
    } else {
        quizCircle();
    };
};

function quizStatistics() {
    randomStatisticsToken = Math.random();
    digit1 = getRandomInt(1, 1001);
    percentage = random(percentages);
    operator = random(operators);
    if (operator === '+' || operator === '-') {
        answer = eval(`${digit1} * (1 ${operator} ${percentage})`);
    } else {
        answer = eval(`${digit1} ${operator} ${percentage}`);
    };
    quiz = `${digit1} ${operator} ${percentage * 100}%`;
    if (Number.isInteger(answer)) {
        quizText.innerHTML = `${quiz} = `;
        updateQuizNum();
    } else {
        quizStatistics();
    };
};

function loadQuiz() {
    quizInput.removeAttribute('suffix');
    randomQuizToken = Math.random();
    if (randomQuizToken < 0.3) {
        quizSimple();
        quizType = 'simple';
    } else if (randomQuizToken >= 0.3 && randomQuizToken < 0.39) {
        quizSquareRoot();
        quizType ='square_root';
    } else if (randomQuizToken >= 0.39 && randomQuizToken < 0.53) {
        quizCircle();
        quizType = 'circle';
    } else if (randomQuizToken >= 0.53 && randomQuizToken < 0.75) {
        quizStatistics();
        quizType ='statistics';
    } else {
        quizEquation();
        quizType = 'equation';
    };
};

function checkAnswer() {
    if (quizInput.valueAsNumber === answer) {
        correctAnswer();
    } else {
        incorrectAnswer();
    };
    checkBtn.disabled = true;
    quizInput.value = '';
    quizInput.focus();
};

quizInput.oninput = () => {
    checkBtn.textContent = 'Check';
    checkBtn.removeAttribute('icon');
    checkBtn.disabled = false;
};

quizInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    };
};

checkBtn.onclick = checkAnswer;
loadQuiz();