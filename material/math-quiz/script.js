const headerText = get('.header-text');
const quizText = get('.quiz-text');
const quizInput = get('.quiz-input');
const checkBtn = get('.check-btn');
const operators = ['+', '-', '*', '/'];
const percentages = [.1, .2, .3, .4, .5, .6, .7, .8, .9];
const random = (array) => array[Math.floor(Math.random() * array.length)];
const settingsBtn = get('.settings-btn');
const settingsPanel = get('.settings-panel');
const discardBtn = get('.cancel-btn');
const saveBtn = get('.save-btn');

const all = get('#all');
const basicArithmetic = get('#basic-arithmetic');
const fixedMaxDigits = get('#fixed-max-digits');
const equations = get('#equations');
const squareRoots = get('#square-roots');
const geometry = get('#geometry');
const statistics = get('#statistics');
const averages = get('#averages');
const allCheckboxes = getAll('.question-types-list mdui-checkbox');
const maxDigitsInput = get('.max-digits-input');
const maxDigitsInputWrapper = get('.max-digits-input-wrapper');
const timeElapsed = get('.time-elapsed');
const stopTimingBtn = get('.stop-timing-btn');
const accuracy = get('.accuracy');
const accuracyPercentage = get('.accuracy-percentage');
const milestonesList = get('.milestones-list');
const resetDataBtn = get('.reset-data-btn');
var questionNum = 0;
var corrcetAnswers = 0;
var totalTrys = 0;
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
var subjects;
var subjectDigits = [];
var settings;
const defaultCheckboxesStates = {};
var quizStats = {};
const milestones = [5, 10, 20, 30, 40, 50, 80, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000, 10000];
let milestonesIndex = -1;

allCheckboxes.forEach(checkbox => {
    if (checkbox.id !== 'fixed-max-digits') {
        defaultCheckboxesStates[checkbox.id] = true;
    } else {
        defaultCheckboxesStates[checkbox.id] = false;
    };
});

if (localStorage.mathquiz_maxDigits) {
    maxDigitsInput.value = localStorage.mathquiz_maxDigits;
} else {
    localStorage.mathquiz_maxDigits = 20;
};

if (!localStorage.mathquiz_data) {
    localStorage.mathquiz_data = JSON.stringify(defaultCheckboxesStates);
};
if (!localStorage.mathquiz_stats) {
    quizStats.achievements = [];
    updateStats();
} else {
    quizStats = JSON.parse(localStorage.mathquiz_stats);
    questionNum = quizStats.answeredQuestions;
    corrcetAnswers = quizStats.corrcetAnswers;
    totalTrys = quizStats.totalTrys;
};
function updateStats() {
    localStorage.mathquiz_stats = JSON.stringify(quizStats);
};

settingsPanel.addEventListener('open', () => {
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = JSON.parse(localStorage.mathquiz_data)[checkbox.id];
    });
    checkBasicArithmetic();
    checkFixedMaxDigitsState();
    checkQuestionTypesState();
});

saveBtn.onclick = () => {
    let checkedBoxes = 0;
    allCheckboxes.forEach(checkbox => {
        if (checkbox.id !== 'fixed-max-digits' && checkbox.id !== 'all' && checkbox.checked) {
            checkedBoxes++;
        };
    });
    if (checkedBoxes >= 1) {
        const checkboxesStates = {};
        allCheckboxes.forEach(checkbox => {
            checkboxesStates[checkbox.id] = checkbox.checked;
        });
        localStorage.mathquiz_data = JSON.stringify(checkboxesStates);
        settingsPanel.open = false;
        mdui.snackbar({ message: 'All settings have been applied successfully.'});
    } else {
        mdui.snackbar({ message: 'Error: Please select at least an item.'});
    };
    localStorage.mathquiz_maxDigits = maxDigitsInput.value;
};

settingsBtn.onclick = discardBtn.onclick = () => {
    settingsPanel.open ? settingsPanel.open = false : settingsPanel.open = true;
};

basicArithmetic.addEventListener('change', checkBasicArithmetic);

function checkBasicArithmetic() {
    if (basicArithmetic.checked) {
        fixedMaxDigits.disabled = false;
        maxDigitsInput.disabled = false;
    } else {
        fixedMaxDigits.disabled = true;
        maxDigitsInput.disabled = true;
    };
};

fixedMaxDigits.onchange = checkFixedMaxDigitsState;

function checkFixedMaxDigitsState() {
    if (fixedMaxDigits.checked) {
        show(maxDigitsInputWrapper, 'flex');
    } else {
        hide(maxDigitsInputWrapper);
    };
};

maxDigitsInput.onchange = () => {
    if (+maxDigitsInput.value < 10 || !Number.isInteger(+maxDigitsInput.value)) {
        maxDigitsInput.value = 20;
    };
};

function checkQuestionTypesState() {
    let checkedItems = 0;
    Object.values(JSON.parse(localStorage.mathquiz_data)).forEach(item => {
        if (item) {
            checkedItems++;
        };
    });
    if (checkedItems >= 7) {
        all.checked = true;
    } else if (checkedItems <= 0) {
        all.checked = false;
    } else {
        all.indeterminate = true;
    };
};

allCheckboxes.forEach(checkbox => {
    if (checkbox.id !== 'fixed-max-digits' && checkbox.id !== 'all') {
        checkbox.addEventListener('change', () => {
            let checkedCheckboxes = 0;
            allCheckboxes.forEach(checkbox => {
                if (checkbox.id !== 'fixed-max-digits' && checkbox.id !== 'all') {
                    if (checkbox.checked) {
                        checkedCheckboxes++;
                    };
                };
            });
            if (checkedCheckboxes >= 6) {
                all.checked = true;
            } else if (checkedCheckboxes <= 0) {
                all.checked = false;
            } else {
                all.indeterminate = true;
            };
            checkedCheckboxes = 0;
        });
    };
});

all.onclick = () => {
    allCheckboxes.forEach(checkbox => {
        if (checkbox.id !== 'fixed-max-digits' && checkbox.id !== 'all') {
            if (all.checked) {
                checkbox.checked = false;
            } else {
                checkbox.checked = true;
            };
        };
    });
    checkBasicArithmetic();
};

function updateQuizNum() {
    questionNum++;
    // totalTrys++;
    updateAccuracy();
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
    if (settings['fixed-max-digits']) {
        digit1 = Math.floor(Math.random() * +maxDigitsInput.value + 1);
        digit2 = Math.floor(Math.random() * +maxDigitsInput.value + 1);
    } else {
        digit1 = Math.floor(Math.random() * (21 + questionNum));
        digit2 = Math.floor(Math.random() * (21 + questionNum));
    };
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

function quizMean() {
    subjectDigits = [];
    subjects = getRandomInt(2, 5);
    for (let i = 0; i < subjects; i++) {
        subjectDigits[i] = getRandomInt(1, 101);
    };
    answer = subjectDigits.reduce((a, b) => a + b) / subjects;
    if (Number.isInteger(answer)) {
        quiz = `mean(${subjectDigits.join(', ')})`;
        quizText.innerHTML = `${quiz} = `;
        updateQuizNum();
    } else {
        quizMean();
    };
};

function loadQuiz() {
    quizInput.removeAttribute('suffix');
    randomQuizToken = Math.random();
    settings = JSON.parse(localStorage.mathquiz_data);
    if (randomQuizToken < 0.25) {
        settings['basic-arithmetic'] ? quizSimple() : loadQuiz();
        quizType = 'simple';
    } else if (randomQuizToken >= 0.25 && randomQuizToken < 0.34) {
        settings['square-roots'] ? quizSquareRoot() : loadQuiz();
        quizType ='square_root';
    } else if (randomQuizToken >= 0.34 && randomQuizToken < 0.47) {
        settings.geometry ? quizCircle() : loadQuiz();
        quizType = 'circle';
    } else if (randomQuizToken >= 0.47 && randomQuizToken < 0.62) {
        settings['statistics'] ? quizStatistics() : loadQuiz();
        quizType ='statistics';
    } else if (randomQuizToken >= 0.62 && randomQuizToken < 0.81) {
        settings.averages ? quizMean() : loadQuiz();
        quizType = 'mean';
    } else {
        settings.equations ? quizEquation() : loadQuiz();
        quizType = 'equation';
    };
    updateQuizStats();
    updateStats();
};

function updateQuizStats() {
    quizStats.answeredQuestions = corrcetAnswers;
    quizStats.corrcetAnswers = corrcetAnswers;
    quizStats.totalTrys = totalTrys;
};

function checkAnswer() {
    if (quizInput.valueAsNumber === answer) {
        correctAnswer();
        corrcetAnswers++;
        milestonesIndex = -1;
        milestones.forEach(milestone => {
            if (corrcetAnswers >= milestone) {
                milestonesIndex = milestones.indexOf(milestone);
            };
        });
        const achievementText = `Answered ${milestones[milestonesIndex]} questions correctly.`
        if (milestonesIndex >= 0 && !(quizStats.achievements.includes(achievementText))) {
            quizStats.achievements.push(achievementText);
            mdui.snackbar({ message: `You have achieved the milestone of correctly answering ${milestones[milestonesIndex]} questions. Nice job!`});
        };
    } else {
        incorrectAnswer();
    };
    totalTrys++;
    updateAccuracy();
    checkBtn.disabled = true;
    quizInput.value = '';
    quizInput.focus();

    updateQuizStats();
    updateStats();
    updateMilestones();
};

function updateMilestones() {
    getAll('.milestones-list mdui-list-item').forEach(item => item.remove());
    JSON.parse(localStorage.mathquiz_stats).achievements.forEach(achievement => {
        const milestone = document.createElement('mdui-list-item');
        milestone.textContent = achievement;
        milestone.icon = 'verified';
        milestone.nonclickable = true;
        milestonesList.appendChild(milestone);
    });
};
updateMilestones();

function updateAccuracy() {
    accuracy.textContent = `${corrcetAnswers} / ${totalTrys}`;
    accuracyPercentage.textContent = `${(corrcetAnswers / totalTrys * 100).toFixed(2)}%`;
    if (accuracyPercentage.textContent === 'NaN%') {
        accuracyPercentage.textContent = '0.00%';
    };
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

const stopwatch = new Stopwatch();
stopwatch.start();

var timeInterval = setInterval(() => {
    const time = stopwatch.getCurrentTime();
    timeElapsed.textContent = `${Math.floor(time/60).toString().padStart(2, '0')}:${Math.floor(time%60).toString().padStart(2, '0')}.${(time - Math.floor(time)).toFixed(3).toString().split('.')[1]}`;
}, 100);

stopTimingBtn.onclick = () => {
    clearInterval(timeInterval);
    hide(stopTimingBtn);
};

resetDataBtn.onclick = () => {
    mdui.confirm({
        headline: 'Reset All Data',
        description: 'All your progress, milestones, and achievements will be lost. Are you sure you\'d like to proceed?',
        confirmText: 'Proceed',
        onConfirm: () => {
            localStorage.removeItem('mathquiz_data');
            localStorage.removeItem('mathquiz_stats');
            localStorage.removeItem('mathquiz_maxDigits');
            location.reload();
        },
    });
};