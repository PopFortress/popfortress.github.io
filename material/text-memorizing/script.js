const $ = (query) => mdui.$(query)[0];
const textbooksSelect = $('.textbooks-select');
const chaptersSelect = $('.chapters-select');
const sectionsSelect = $('.sections-select');
const textbookStart = $('.textbook-start');
const customStart = $('.custom-start');
const settingsPage = $('.settings-page');
const textbookPage = $('.textbook-page');
const customPage = $('.custom-page');
const backBtn = $('.back-btn');
const customText = $('.custom-text');
const customGenerate = $('.custom-generate');
var textbooks;
var currentPage = settingsPage;
var textbookIndex = 0;
var chapterIndex = 0;
var sectionIndex = 0;
var currentTextbookIndex = 0;
var currentChapterIndex = 0;
var currentSectionIndex = 0;
var correctCount = 0;
var total = 0;
var customMemorizeFrame;

function switchPage(to) {
    currentPage.style.display = 'none';
    to.style.display = 'flex';
    if (to != settingsPage) {
        backBtn.style.display = 'block';
    } else {
        backBtn.style.display = 'none';
    };
    currentPage = to;
};


async function fetchTextbooks() {
    const response = await fetch('/static/textbooks.json');
    textbooks = await response.json();
    textbooks.forEach(textbook => {
        var textbookOption = document.createElement('mdui-menu-item');
        textbookOption.textContent = textbook.title;
        textbookOption.value = textbook.title;
        textbookOption.dataset.index = textbookIndex;
        textbooksSelect.appendChild(textbookOption);
        textbookIndex++;
    });
};

textbooksSelect.onchange = (e) => {
    if (e.target.value) {
        chaptersSelect.innerHTML = '';
        chaptersSelect.value = '';
        chapterIndex = 0;
        currentTextbookIndex = $(`.textbooks-select mdui-menu-item[value=${e.target.value}]`).dataset.index;
        textbooks[currentTextbookIndex].chapters.forEach(chapter => {
            var chapterOption = document.createElement('mdui-menu-item');
            chapterOption.textContent = chapter.title;
            chapterOption.value = chapter.title;
            chapterOption.dataset.index = chapterIndex;
            chaptersSelect.appendChild(chapterOption);
            chapterIndex++;
        });
    } else {
        chaptersSelect.innerHTML = '';
        chaptersSelect.value = '';
        sectionsSelect.innerHTML = '';
        sectionsSelect.value = '';
    };
};

chaptersSelect.onchange = (e) => {
    if (e.target.value) {
        sectionsSelect.innerHTML = '';
        sectionsSelect.value = '';
        sectionIndex = 0;
        currentChapterIndex = $(`.chapters-select mdui-menu-item[value='${e.target.value}']`).dataset.index;
        textbooks[currentTextbookIndex].chapters[currentChapterIndex].sections.forEach(section => {
            var sectionOption = document.createElement('mdui-menu-item');
            sectionOption.textContent = section.title;
            sectionOption.value = section.title;
            sectionOption.dataset.index = sectionIndex;
            sectionsSelect.appendChild(sectionOption);
            sectionIndex++;
        });
    } else {
        sectionsSelect.innerHTML = '';
        sectionsSelect.value = '';
    };
};

sectionsSelect.onchange = (e) => {
    if (e.target.value) {
        currentSectionIndex = $(`.sections-select mdui-menu-item[value='${e.target.value}']`).dataset.index;
    };
};

function memorizeTextbook() {
    textbookPage.innerHTML = '';
    textbooks[currentTextbookIndex].chapters[currentChapterIndex].sections[currentSectionIndex].parts.forEach(part => {
        var partCard = document.createElement('mdui-card');
        var partTitle = document.createElement('div');
        partTitle.className = 'part-title';
        partTitle.textContent = part.title;
        partCard.appendChild(partTitle);
        part.texts.forEach(text => {
            var memorizeFrame = generateMemorizeFrame(text.title, text.contents);
            partCard.appendChild(memorizeFrame);
        });
        textbookPage.appendChild(partCard);
    });
};

function generateMemorizeFrame(title, content) {
    function resetFrame() {
        answeringField.style.display = 'none';
        contentField.style.display = 'block';
        checkBtn.style.display = 'none';
        memorizeBtn.style.display = 'block';
        memorizeBtn.textContent = '记忆此段落';
        cancelBtn.style.display = 'none';
    };
    function calcAccuracy(original, answer) {
        correctCount = 0;
        total = original.length;
        original.trim().split('').forEach(char => {
            if (answer.includes(char)) {
                correctCount++;
            };
        });
        return (correctCount / total * 100).toFixed(2) + '%';
    };
    var frame = document.createElement('div');
    frame.className ='memorize-frame';
    var memorizeTitle = document.createElement('div');
    var contentField = document.createElement('mdui-text-field');
    var memorizeBtn = document.createElement('mdui-button');
    var answeringField = document.createElement('mdui-text-field');
    var cancelBtn = document.createElement('mdui-button');
    var checkBtn = document.createElement('mdui-button');
    memorizeTitle.innerHTML = title;
    cancelBtn.textContent = '取消';
    cancelBtn.variant = 'elevated';
    contentField.value = content;
    contentField.autosize = true;
    contentField.readonly = true;
    answeringField.autosize = true;
    answeringField.style.display = 'none';
    cancelBtn.style.display = 'none';
    memorizeBtn.textContent = '记忆此段落';
    checkBtn.textContent = '检查答案';
    checkBtn.style.display = 'none';
    memorizeBtn.onclick = () => {
        contentField.style.display = 'none';
        answeringField.style.display = 'block';
        cancelBtn.style.display = 'block';
        answeringField.value = '';
        answeringField.focus();
        checkBtn.style.display = 'block';
        memorizeBtn.style.display = 'none';
    };
    cancelBtn.onclick = resetFrame;
    checkBtn.onclick = () => {
        mdui.alert({headline: '记忆结果', description: `你的准确率: ${calcAccuracy(content, answeringField.value)} · 正确字数：${correctCount} · 总字数：${total}`});
        resetFrame();
    };
    frame.appendChild(memorizeTitle);
    frame.appendChild(contentField);
    frame.appendChild(answeringField);
    frame.appendChild(memorizeBtn);
    frame.appendChild(checkBtn);
    frame.appendChild(cancelBtn);
    return frame;
};

textbookStart.onclick = () => {
    if (sectionsSelect.value) {
        switchPage(textbookPage);
        memorizeTextbook();
    };
};

customStart.onclick = () => {
    switchPage(customPage);
    customText.style.display = 'block';
    customGenerate.style.display = 'block';
    customMemorizeFrame.style.display = 'none';
    customText.value = '';
};

customGenerate.onclick = (e) => {
    customText.style.display = 'none';
    e.target.style.display = 'none';
    customMemorizeFrame = generateMemorizeFrame('自定义段落', customText.value);
    customPage.appendChild(customMemorizeFrame);
    customMemorizeFrame.style.display = 'flex';
};

fetchTextbooks();
backBtn.onclick = () => {
    switchPage(settingsPage);
};