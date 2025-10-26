mdui.setColorScheme('#EF9A9A');

const $ = (query) => mdui.$(query)[0];
const APPTITLE = '打字练习 | Just Enough Typewriting';

const chinese = $('#chinese');
const english = $('#english');
const returnToHome = $('#return-to-home');
const returnToSelection = $('#return-to-selection');
const articleList = $('#articles-list');
const durationInput = $('#duration');
const unlimitedDuration = $('#unlimited-duration');
const startBtn = $('#start-practice');
const header = $('header');

const speed = $('#speed');
const speedUnit = $('#speed-unit');
const time = $('#time');
const timeLabel = $('#time-label');
const accuracy = $('#accuracy');
const charactersTyped = $('#characters-typed');
const typingProgress = $('#typing-progress');
const typingProgressText = $('#typing-progress-text');
const pause = $('#pause');
const menu = $('#menu');

const resume = $('#resume');
const restart = $('#restart');
const exit = $('#exit');

const typingArea = $('.typing-area');

let currentPage = 'home';
let articlesType;
let selectedArticle;
let duration;
let isTimeUnlimited = false;
let isMenuOpened = false;
let menuFreshlyClosed = false;
let isComposing = false;
let isFreshlyComposed = false;

let isTypingStarted = false;
let articleLength;
let timerIntervals = [];
let latestElapsedSeconds = 0;

let currentBlockIndex = 0;
let totalBlocksCount;
let maxBlockIndex;

let totalInputLength = 0;
let inputLengthInline = 0;

let speedValue;

function switchPage(to) {
    const current = $(`.app-page#${currentPage}`);
    const target = $(`.app-page#${to}`);
    
    current.classList.add('fade-out');
    setTimeout(() => {
        current.style.display = 'none';
        current.classList.remove('fade-out');
        target.style.display = 'flex';
        target.classList.add('fade-in');
    }, 250);
    setTimeout(() => {
        target.classList.remove('fade-in');
    }, 500);
    currentPage = to;
};

chinese.onclick = () => {
    articlesType = 'chinese';
    switchPage('select-article');
    fetchArticles();
};

english.onclick = () => {
    articlesType = 'english';
    switchPage('select-article');
    fetchArticles();
};

async function fetchArticles() {
    articleList.innerHTML = '<mdui-list-subheader>预设文章</mdui-list-subheader>';
    const res = await fetch('./articles/index.json');
    const data = await res.json();
    const articles = data[articlesType];
    articles.forEach(article => {
        const listItem = document.createElement('mdui-list-item');
        listItem.innerText = article;
        listItem.icon = 'article--outlined';
        listItem.onclick = () => {
            selectedArticle = article;
            switchPage('settings');
            setTimeout(() => {
                durationInput.focus();
            }, 750);
        };
        articleList.appendChild(listItem);
    });
    const customHeader = document.createElement('mdui-list-subheader');
    customHeader.innerText = '自定义';
    const customItem = document.createElement('mdui-list-item');
    customItem.innerText = '新建文章';
    customItem.icon = 'add';
    customItem.onclick = () => {
        switchPage('custom-article');
    };
    articleList.appendChild(customHeader);
    articleList.appendChild(customItem);
};

returnToHome.onclick = () => { switchPage('home'); };
returnToSelection.onclick = () => { switchPage('select-article'); };

unlimitedDuration.onclick = (e) => {
    isTimeUnlimited = !e.target.checked;
    if (isTimeUnlimited) {
        durationInput.disabled = true;
    } else {
        durationInput.disabled = false;
    };
};

startBtn.onclick = () => {
    if (durationInput.checkValidity()) {
        duration = durationInput.valueAsNumber;
        switchPage('typing');
        startTyping();
    } else {
        durationInput.focus();
    };
};

function startTyping() {
    header.innerText = selectedArticle;
    speedUnit.innerText = articlesType === 'chinese'? '字/分钟' : '词/分钟';
    timeLabel.innerText = isTimeUnlimited ? '已用时' : '剩余时间';
    time.innerText = '0:00';
    typingProgress.value = 0;
    typingProgressText.innerText = '0%';
    speed.innerText = '0';
    accuracy.innerText = '0%';
    charactersTyped.innerText = '0 / 0';
    document.onkeyup = (e) => {
        if (e.key === 'Escape') {
            if (!(isMenuOpened) && !(isComposing)) {
                menu.showModal();
                isMenuOpened = true;
                menuFreshlyClosed = false;
                pauseTyping();
            } else if (menuFreshlyClosed) {
                isMenuOpened = false;
            };
            if (isFreshlyComposed) {
                isComposing = false;
            };
        };
    };

    typingArea.innerHTML = '';
    loadArticle();
};

menu.onclose = () => {
    menuFreshlyClosed = true;
    resumeTyping();
};

pause.onclick = () => {
    menu.showModal();
    menuFreshlyClosed = false;
    isMenuOpened = true;
    pauseTyping();
};


exit.onclick = () => {
    switchPage('home');
    menu.close();
    isMenuOpened = false;
    initApp();
};

restart.onclick = () => {
    startTyping();
    menu.close();
    isMenuOpened = false;
};

function initApp() {
    header.innerText = APPTITLE;
    document.onkeyup = null;
};

async function loadArticle() {
    const res = await fetch(`./articles/${articlesType}/${selectedArticle}.txt`);
    const data = await res.text();

    if (res.status === 404) {
        mdui.snackbar({ message: '文章不存在。'});
        return;
    };

    const lines = data.split('\r\n');
    articleLength = lines.join('').length;
    totalBlocksCount = lines.length;
    
    
    let blockIndex = 0;
    lines.forEach(line => {
        const typingBlock = document.createElement('mdui-card');
        typingBlock.classList.add('typing-block');
        typingBlock.variant = 'filled';
        typingBlock.id = `block-${blockIndex}`;

        const text = document.createElement('div');
        text.className = 'typing-text';
        text.innerText = line;
        text.id = `text-${blockIndex}`;
        
        const inputBox = document.createElement('mdui-text-field');
        inputBox.variant = 'outlined';
        inputBox.className = 'typing-input';
        inputBox.id = `input-${blockIndex}`;
        inputBox.addEventListener('compositionstart', () => { isComposing = true; });
        inputBox.addEventListener('compositionend', (e) => {
            isFreshlyComposed = true;
            if (e.data) {
                isComposing = false;
            };
            updateTypingStatus();
        });
        inputBox.addEventListener('input', updateTypingStatus);
        inputBox.onpaste = (e) => { e.preventDefault(); };

        if (blockIndex > 0) {
            inputBox.disabled = true;
        } else {
            text.classList.add('text-focused');
            typingBlock.classList.add('block-focused');
        };

        typingBlock.appendChild(text);
        typingBlock.appendChild(inputBox);

        typingArea.appendChild(typingBlock);
        blockIndex++;
    });
    maxBlockIndex = blockIndex - 1;

    setTimeout(() => {
        $('#input-0').focus();
    }, 750);

    $('#input-0').oninput = startTimer;
    stopwatch.start();
    timerIntervals.forEach(interval => clearInterval(interval));
    isTypingStarted = false;
    latestElapsedSeconds = 0;

    charactersTyped.innerText = `0 / ${articleLength}`;

    totalInputLength = inputLengthInline = 0;
    currentBlockIndex = 0;
    speedValue = 0;
    speed.innerText = '0';
};

function startTimer() {
    if (isTypingStarted) {
        return;
    };
    if (isTimeUnlimited) {
        stopwatch.reset();
        stopwatch.start();
        timerIntervals.push(setInterval(stopwatchTick, 1000));
        timerIntervals.push(setInterval(updateSpeed, 100));
    } else {};
    isTypingStarted = true;
};

class Stopwatch {
    constructor() {
        this.st = 0;
        this.et = 0;
        this.diff = 0;
    };
    start () {
        this.st = Date.now();
        return this.st;
    };
    stop (timeFormatOffset = 1000) {
        this.et = Date.now();
        this.diff = this.et - this.st;
        return this.diff / timeFormatOffset;
    };
    reset () {
        this.st = 0;
        this.et = 0;
        this.diff = 0;
    };
    getCurrentTime (timeFormatOffset = 1000) {
        this.diff = Date.now() - this.st;
        return this.diff / timeFormatOffset;
    };
};

const stopwatch = new Stopwatch();

function stopwatchTick() {
    let currentTime = stopwatch.getCurrentTime();
    currentTime += latestElapsedSeconds;
    time.innerText = `${Math.floor(currentTime/60)}:${Math.floor(currentTime%60).toString().padStart(2, '0')}`;
};


function pauseTyping() {
    latestElapsedSeconds += stopwatch.getCurrentTime();
    timerIntervals.forEach(interval => clearInterval(interval));
};

function resumeTyping() {
    if (isTypingStarted) {
        timerIntervals.push(setInterval(stopwatchTick, 1000));
        timerIntervals.push(setInterval(updateSpeed, 100));
    } else {
        stopwatch.reset();
        latestElapsedSeconds = 0;
    };
    stopwatch.start();
};

resume.onclick = () => {
    resumeTyping();
    menu.close();
    $(`#input-${currentBlockIndex}`).focus();
    isMenuOpened = false;
};

function updateTypingStatus() {
    if (!isComposing || articlesType !== 'chinese') {
        inputLengthInline = $(`#input-${currentBlockIndex}`).value.length;

        const currentInputLength = inputLengthInline + totalInputLength;

        typingProgress.value = currentInputLength / articleLength;
        typingProgressText.innerText = `${Math.floor(currentInputLength / articleLength * 100)}%`;
        charactersTyped.innerText = `${currentInputLength} / ${articleLength}`;

        if (inputLengthInline >= $(`#text-${currentBlockIndex}`).innerText.length) {
            $(`#text-${currentBlockIndex}`).classList.remove('text-focused');
            $(`#block-${currentBlockIndex}`).classList.remove('block-focused');
            $(`#input-${currentBlockIndex}`).disabled = true;

            currentBlockIndex++;

            $(`#text-${currentBlockIndex}`).classList.add('text-focused');
            $(`#block-${currentBlockIndex}`).classList.add('block-focused');
            $(`#input-${currentBlockIndex}`).disabled = false;
            setTimeout(() => {
                $(`#input-${currentBlockIndex}`).focus();
            }, 100);

            $(`#input-${currentBlockIndex}`).scrollIntoView({
                block: 'center', behavior: 'smooth'
            });

            totalInputLength += inputLengthInline;
            inputLengthInline = 0;
        };
    };
};

function updateSpeed() {
    if (articlesType === 'chinese') {
        speedValue = (totalInputLength + inputLengthInline) / (stopwatch.getCurrentTime() + latestElapsedSeconds) * 60;
        // speedValue /= 2;
        speed.innerText = Math.floor(speedValue);
    };
};
