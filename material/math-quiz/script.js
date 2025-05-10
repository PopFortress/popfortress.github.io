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
var operator;

function loadQuiz() {
    digit1 = Math.floor(Math.random() * 21);
    digit2 = Math.floor(Math.random() * 21);
    operator = operators[Math.floor(Math.random() * operators.length)];
    quiz = `${digit1} ${operator} ${digit2}`;
    answer = eval(quiz);
    if (Number.isInteger(answer)) {
        quizText.innerHTML = `${quiz} = `;
        questionNum++;
        headerText.innerHTML = `Question ${questionNum}`;
    } else {
        loadQuiz();
    };
};

function checkAnswer() {
    if (parseInt(quizInput.value) === answer) {
        checkBtn.textContent = 'Correct';
        checkBtn.icon = 'check';
        loadQuiz();
        navigator.vibrate(200);
    } else {
        checkBtn.textContent = 'Incorrect';
        checkBtn.icon = 'close';
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