const $ = (query) => {
    return mdui.$(query)[0];
};
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
var quizData;

async function loadQuiz() {
    const response = await fetch('/static/minecraft-quiz.json');
    quizData = await response.json();
    quizTitle.innerHTML = quizData.title;
    optionA.innerHTML = `A. ${quizData.option_a}`;
    optionB.innerHTML = `B. ${quizData.option_b}`;
    optionC.innerHTML = `C. ${quizData.option_c}`; 
    optionD.innerHTML = `D. ${quizData.option_d}`;
    quizHeader.innerHTML = `Weekly Minecraft Quiz · #${quizData.number}`;
    answerText.innerHTML = quizData.answer;
    answerText.title = quizData.explanation;
    explanationText.textContent = quizData.explanation;
};

checkBtn.onclick = () => {
    if (optionsGroup.value === quizData.answer) {
        checkBtn.textContent = 'Correct!';
        checkBtn.icon = 'check';
    } else {
        checkBtn.textContent = 'Incorrect';
        checkBtn.icon = 'close';
    }
    resultCard.style.display = 'flex';
    checkBtn.disabled = true;
    optionsGroup.onchange = null;
    feedbackBtn.textContent = 'Send Feedback';
    feedbackBtn.icon = 'outlined_flag';
};

optionsGroup.onchange = () => {
    checkBtn.disabled = false;
};

loadQuiz();