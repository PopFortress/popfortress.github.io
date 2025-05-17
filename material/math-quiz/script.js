const headerText = document.querySelector('.header-text');
const quizText = document.querySelector('.quiz-text');
const quizInput = document.querySelector('.quiz-input');
const checkBtn = document.querySelector('.check-btn');
const operators = ['+', '-', '*', '/'];
var questionNum = 0;
var quiz;
var answer;
var digit1;
var digit2;
var digit3;
var operator;
var randomQuizToken;
var randomEquationToken;
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
    operator = operators[Math.floor(Math.random() * operators.length)];
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

function loadQuiz() {
    randomQuizToken = Math.random();
    if (randomQuizToken < 0.46) {
        quizSimple();
        quizType = 'simple';
    } else if (randomQuizToken >= 0.46 && randomQuizToken < 0.61) {
        quizSquareRoot();
        quizType ='square_root';
    } else {
        quizEquation();
        quizType = 'equation';
    };
};

function checkAnswer() {
    switch (quizType) {
        case 'simple':
            if (parseInt(quizInput.value) === answer) {
                correctAnswer();
            } else {
                incorrectAnswer();
            };
            break;
        case 'square_root':
            if (parseInt(quizInput.value) === answer) {
                correctAnswer();
            } else {
                incorrectAnswer();
            };
            break;
        case 'equation':
            answeredEquation = quiz.replaceAll('x', quizInput.value).replace('=', '==');
            if (eval(answeredEquation)) {
                correctAnswer();
            } else {
                incorrectAnswer();
            };
            break;
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