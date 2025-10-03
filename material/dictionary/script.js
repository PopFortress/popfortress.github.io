mdui.setColorScheme('#EF9A9A');
const $ = (query) => mdui.$(query)[0];
const searchInput = $('.search-input');
const searchBtn = $('.search-btn');
const resultWord = $('.result-word');
const result = $('.result');
const loadingModal = $('#loading-modal');
const resultPhonetic = $('.result-phonetic');
const synonymsWrapper = $('.synonyms-wrapper');
const sentencesWrapper = $('.sentences-wrapper');

const audioWrapper = $('.audio-wrapper');
const britishAudioBtn = document.querySelectorAll('.british-pronunciation-btn');
const britishAudio = $('#british-pronunciation-audio');
const americanAudioBtn = document.querySelectorAll('.american-pronunciation-btn');
const americanAudio = $('#american-pronunciation-audio');
const relwordsWrapper = $('.relwords-wrapper');
const phrasesWrapper = $('.phrases-wrapper');

const navRail = $('#nav-rail');
const navBar = $('#nav-bar');
const dictationsCollapse = $('.dictations-collapse');
const startInfiniteBtn = $('.start-infinite-btn');

const definitionsWrapper = $('.definitions-wrapper');
const quizInput = $('#quiz-input');
const submitBtn = $('#quiz-submit-btn');
const showAnswerBtn = $('#show-answer-btn');
const skipBtn = $('#skip-btn');
const britishSpeech = $('#british-speech');
const americanSpeech = $('#american-speech');
const correctIndicator = $('.correct-indicator');
const incorrectIndicator = $('.incorrect-indicator');
const correctAnswer = $('#correct-answer');
const questionNumText = $('.question-num');
const accuracy = $('.accuracy');
const accuracyPercentage = $('.accuracy-percentage');

const backBtn = $('#back-btn');
const startRandomBtn = $('.start-random-btn');
const wordAmountInput = $('#word-amount-input');
const resultCard = $('.result-card');
const quizCard = $('.quiz-card');

const addToBookmarksBtn = $('.add-to-bookmarks-btn');
const bookmarksList = $('.bookmarks-list');
const startBookmarksBtn = $('.start-bookmarks-btn');
const bookmarksHeader = $('.bookmarks-header');

const apis = {
    dict: 'https://v2.xxapi.cn/api/englishwords?word=',
    translation: 'https://api.pearktrue.cn/api/translate/',
    dictation: 'https://v2.xxapi.cn/api/randomenglishwords',
};

let currentPage = 'dictionary';
let isFreshlySearched = false;
let answer;
let checkedAnswer = false;
let quizInputValue;
let isAnswerCorrect;
let showedAnswer = false;
let questionNum = 0;
let totalTrys = 0;
let corrcetAnswers = 0;

// dictionary page
async function search() {
    document.body.style.overflow = 'hidden';
    loadingModal.showModal();
    const query = searchInput.value.trim();
    if (query) {
        if (query.split(' ').length <= 1 && query.match(/[a-zA-Z]/g)) {
            const url = apis.dict + query;
            const response = await fetch(url);
            const data = await response.json();

            if (data.code === -2) {
                mdui.snackbar({ message: data.msg + '，请检查您的拼写是否有误。'});
                loadingModal.close();
                return;
            } else if (data.code === -4) {
                mdui.snackbar({ message: data.msg});
                loadingModal.close();
                return;
            };

            resultWord.innerHTML = searchInput.value;
            let resultDetails = '';
            data.data.translations.forEach(translation => {
                if (translation.pos) {
                    resultDetails += `${translation.pos}. ${translation.tran_cn}<br>`;
                } else {
                    resultDetails += `${translation.tran_cn}<br>`;
                };
            });
            result.innerHTML = resultDetails;
            if (data.data.ukphone && data.data.usphone) {
                resultPhonetic.innerHTML = `BrE: /${data.data.ukphone}/　AmE: /${data.data.usphone}/`;
            } else {
                resultPhonetic.innerHTML = '';
            };

            audioWrapper.style.display = 'flex';
            britishAudio.src = data.data.ukspeech.includes('type=1') ? data.data.ukspeech : `https://dict.youdao.com/dictvoice?audio=${searchInput.value}&type=1`;
            americanAudio.src = data.data.usspeech.includes('type=2') ? data.data.usspeech : `https://dict.youdao.com/dictvoice?audio=${searchInput.value}&type=2`;

            if (data.data.synonyms.length > 0) {
                synonymsWrapper.innerText = '同近义词 (Synonyms):　';
                data.data.synonyms.forEach(synonym => {
                    synonym.Hwds.forEach(item => {
                        const synonymLink = document.createElement('a');
                        synonymLink.innerText = `(${synonym.pos}. ${synonym.tran}) ${item.word}`;
                        synonymLink.href = 'javascript:;';
                        synonymLink.onclick = () => {
                            searchInput.value = synonymLink.innerText.split(') ')[1];
                            search();
                        };
                        synonymsWrapper.appendChild(synonymLink);
                    });
                });
                synonymsWrapper.style.display = 'block';
            } else {
                synonymsWrapper.style.display = 'none';
            };

            if (data.data.sentences.length > 0) {
                sentencesWrapper.innerHTML = '例句 (Sentences):<br>';
                data.data.sentences.forEach(sentence => {
                    sentencesWrapper.innerHTML += `${sentence.s_content}<br>${sentence.s_cn}<br><br>`;
                });
                sentencesWrapper.style.display = 'block';
            } else {
                sentencesWrapper.style.display = 'none';
            };

            if (data.data.relWords.length > 0) {
                relwordsWrapper.innerText = '同根词 (Related Words):　';
                data.data.relWords.forEach(relword => {
                    relword.Hwds.forEach(item => {
                        const relwordLink = document.createElement('a');
                        relwordLink.innerText = `(${relword.Pos}. ${item.tran}) ${item.hwd}`;
                        relwordLink.href = 'javascript:;';
                        relwordLink.onclick = () => {
                            searchInput.value = relwordLink.innerText.split(') ')[1];
                            search();
                        };
                        relwordsWrapper.appendChild(relwordLink);
                    });
                });
                relwordsWrapper.style.display = 'block';
            } else {
                relwordsWrapper.style.display = 'none';
            };

            if (data.data.phrases.length > 0) {
                phrasesWrapper.innerHTML = '短语 (Phrases):<br>';
                data.data.phrases.forEach(phrase => {
                    phrasesWrapper.innerHTML += `${phrase.p_content}<br>${phrase.p_cn}<br><br>`;
                });
                phrasesWrapper.style.display = 'block';
            } else {
                phrasesWrapper.style.display = 'none';
            };
        } else {
            const url = `${apis.translation}?text=${query}&type=auto`;
            const response = await fetch(url);
            const data = await response.json();

            if (query.match(/[a-zA-Z]/g)) {
                audioWrapper.style.display = 'flex';
                britishAudio.src = `https://dict.youdao.com/dictvoice?audio=${searchInput.value}&type=1`;
                americanAudio.src = `https://dict.youdao.com/dictvoice?audio=${searchInput.value}&type=2`;
            } else {
                audioWrapper.style.display = 'none';
            };
            resultPhonetic.innerHTML = '';
            synonymsWrapper.style.display = 'none';
            sentencesWrapper.style.display = 'none';
            relwordsWrapper.style.display = 'none';
            phrasesWrapper.style.display = 'none';

            resultWord.innerText = data.data.text;
            result.innerText = data.data.translate;
        };
        addToBookmarksBtn.style.display = 'block';
        let found = false;
        loadBookmarks().forEach(bookmark => {
            if (bookmark.word === resultWord.innerText.trim()) {
                addToBookmarksBtn.icon = 'bookmark_remove';
                addToBookmarksBtn.innerText = '从单词本中移除';
                found = true;
            };
        });
        if (!found) {
            addToBookmarksBtn.innerText = '添加至单词本';
            addToBookmarksBtn.icon = 'bookmark_add';
        };
    };
    loadingModal.close();
    searchInput.blur();
    navigator.virtualKeyboard.hide();
    location.hash = searchInput.value;
    isFreshlySearched = true;
    setTimeout(() => {
        isFreshlySearched = false;
    }, 500);
    window.scrollTo(0, 0);
};

britishAudioBtn.forEach(btn => {
    btn.onclick = () => {
        britishAudio.play();
    };
});
    
americanAudioBtn.forEach(btn => {
    btn.onclick = () => {
        americanAudio.play();
    };
});

loadingModal.oncancel = (e) => {
    e.preventDefault();
};
loadingModal.onclose = () => {
    document.body.style.overflow = 'auto';
};

searchBtn.onclick = search;
searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        search();
    };
};

searchInput.oninput = () => {
    if (searchInput.value.trim()) {
        setTimeout(() => {
            searchBtn.style.opacity = 1;
        }, 0);
        searchBtn.style.display = 'block';
    } else {
        searchBtn.style.opacity = 0;
        setTimeout(() => {
            searchBtn.style.display = 'none';
        }, 200);
        location.hash = '';
    };
};

searchInput.onclear = () => {
    location.hash = '';
};

window.onhashchange = window.onload = () => {
    if (location.hash.split('#')[1] && !isFreshlySearched) {
        searchInput.value = decodeURI(location.hash).split('#')[1];
        search();
    } else if (!isFreshlySearched) {
        searchInput.value = '';
    };
};


// dictation page
let currentDictationType;

dictationsCollapse.addEventListener('change', (e) => {
    $(`mdui-collapse-item[value=${currentDictationType ? currentDictationType : dictationsCollapse.value}] mdui-list-item`).endIcon = dictationsCollapse.value ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
    dictationsCollapse.querySelectorAll('mdui-collapse-item').forEach(item => {
        if (item.value === e.target.value) {
            item.querySelector('mdui-list-item').endIcon = e.target.value ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
        } else {
            item.querySelector('mdui-list-item').endIcon = 'keyboard_arrow_down';
        };
    });
    currentDictationType = dictationsCollapse.value;
});

startInfiniteBtn.onclick = startRandomBtn.onclick = startBookmarksBtn.onclick = (e) => {
    questionNum = 0;
    totalTrys = 0;
    corrcetAnswers = 0;
    updateStats();
    if (e.target === startRandomBtn) {
        if (!(wordAmountInput.valueAsNumber >= 10) || !(Number.isInteger(wordAmountInput.valueAsNumber))) {
            return;
        };
    };
    switchPage('dictation-testing');
    resultCard.style.display = 'none';
    quizCard.style.display = 'flex';
    loadWord();
};

async function loadRandomInfinite() {
    loadingModal.showModal();
    const response = await fetch(apis.dictation);
    const data = await response.json();
    if (data.data.ukphone && data.data.usphone) {
        britishSpeech.innerText = `英 /${data.data.ukphone}/`;
        americanSpeech.innerText = `美 /${data.data.usphone}/`;
    } else {
        britishSpeech.innerText = '英式';
        americanSpeech.innerText = '美式';
    };
    britishAudio.src = data.data.ukspeech.includes('type=1') ? data.data.ukspeech : `https://dict.youdao.com/dictvoice?audio=${data.data.word}&type=1`;
    americanAudio.src = data.data.usspeech.includes('type=2') ? data.data.usspeech : `https://dict.youdao.com/dictvoice?audio=${data.data.word}&type=2`;
    answer = data.data.word;
    definitionsWrapper.innerHTML = '';
    data.data.translations.forEach(term => {
        if (term.pos) {
            definitionsWrapper.innerHTML += `${term.pos}. ${term.tran_cn}<br>`;
        } else {
            definitionsWrapper.innerHTML += `${term.tran_cn}<br>`;
        };
    });
    loadingModal.close();
    if (data.data.usspeech) {
        americanAudio.play();
    } else if (data.data.ukspeech) {
        britishAudio.play();
    };
};

function loadRandom() {
    if (questionNum < wordAmountInput.valueAsNumber) {
        loadRandomInfinite();
    } else {
        quizCard.style.display = 'none';
        resultCard.style.display = 'flex';
        questionNum--;
        updateStats();
    };
};

function loadBookmarksQuiz() {
    const bookmarks = loadBookmarks();
    if (questionNum < bookmarks.length) {
        const word = bookmarks[questionNum].word;
        const explain = bookmarks[questionNum].explain;
        britishSpeech.innerText = '英式';
        americanSpeech.innerText = '美式';
        britishAudio.src = `https://dict.youdao.com/dictvoice?audio=${word}&type=1`;
        americanAudio.src = `https://dict.youdao.com/dictvoice?audio=${word}&type=2`;
        answer = word;
        definitionsWrapper.innerHTML = explain;
        americanAudio.play();
    } else {
        quizCard.style.display = 'none';
        resultCard.style.display = 'flex';
        questionNum--;
        updateStats();
    };
};

async function loadWord() {
    quizInput.readonly = false;
    submitBtn.disabled = false;
    skipBtn.innerText = '跳过';
    showAnswerBtn.style.visibility = 'visible';
    isAnswerCorrect = void 0;
    checkedAnswer = false;
    showedAnswer = false;
    quizInput.value = '';
    correctAnswer.innerText = '';
    correctIndicator.style.display = incorrectIndicator.style.display = 'none';

    switch (currentDictationType) {
        case 'random-infinite':
            loadRandomInfinite();
            break;
        case 'random':
            loadRandom();
            break;
        case 'bookmarks':
            loadBookmarksQuiz();
            break;
    };
    
    quizInput.focus();
    questionNum++;
    updateStats();
};

function checkAnswer() {
    correctIndicator.style.display = incorrectIndicator.style.display = 'none';
    if (quizInput.value.trim().toLowerCase() === answer.toLowerCase()) {
        correctIndicator.style.display = 'flex';
        skipBtn.innerText = '下一个';
        isAnswerCorrect = true;
        corrcetAnswers++;
        totalTrys++;
    } else {
        incorrectIndicator.style.display = 'flex';
        isAnswerCorrect = false;
    };
    updateStats();
    checkedAnswer = true;
    quizInputValue = quizInput.value.trim().toLowerCase();
};

function showAnswer() {
    correctAnswer.innerText = `答案：${answer}`;
    quizInput.readonly = true;
    submitBtn.disabled = true;
    skipBtn.innerText = '下一个';
    showAnswerBtn.style.visibility = 'hidden';
    showedAnswer = true;
    if (!isAnswerCorrect) {
        totalTrys++;
    };
    updateStats();
};

function attemptSubmit() {
    if (quizInput.value.trim()) {
        if (!checkedAnswer) {
            checkAnswer();
        } else if (quizInput.value.trim().toLowerCase() === quizInputValue) {
            if (isAnswerCorrect || showedAnswer) {
                loadWord();
            } else {
                showAnswer();
            };
        } else {
            checkAnswer();
        };
    };
};

showAnswerBtn.onclick = showAnswer;

submitBtn.onclick = attemptSubmit;
quizInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        attemptSubmit();
    };
};

skipBtn.onclick = () => {
    if (!checkedAnswer && !showedAnswer) {
        totalTrys++;
        updateStats();
    };
    loadWord();
};

function updateStats() {
    if (currentDictationType === 'random-infinite') {
        questionNumText.innerText = `题目 ${questionNum}`;
    } else if (currentDictationType === 'random') {
        questionNumText.innerText = `题目 ${questionNum} / ${wordAmountInput.value}`;
    } else {
        questionNumText.innerText = `单词 ${questionNum} / ${loadBookmarks().length}`;
    }
    accuracy.innerText = `${corrcetAnswers} / ${totalTrys}`;
    accuracyPercentage.innerText = `${(corrcetAnswers / totalTrys * 100).toFixed(2)}%`;
    if (accuracyPercentage.innerText === 'NaN%') {
        accuracyPercentage.innerText = '0.00%';
    };
};


backBtn.onclick = () => {
    switchPage('dictation');
};


// bookmarks page
let bookmarks;
if (!localStorage.dictionary_bookmarks) {
    localStorage.dictionary_bookmarks = '[]';
};

function updateBookmarks() {
    localStorage.dictionary_bookmarks = JSON.stringify(bookmarks);
    return bookmarks;
};
function loadBookmarks() {
    bookmarks = JSON.parse(localStorage.dictionary_bookmarks);
    return bookmarks;
};
addToBookmarksBtn.onclick = () => {
    loadBookmarks();
    if (addToBookmarksBtn.innerText === '添加至单词本') {
        const word = resultWord.innerText.trim();
        const explanation = word.split(' ') <= 1 ? result.innerHTML.trim().slice(0, -4) : result.innerHTML.trim();
        bookmarks.push({ 'word': word, 'explain': explanation });
        addToBookmarksBtn.icon = 'bookmark_remove';
        addToBookmarksBtn.innerText = '从单词本中移除';
    } else {
        const index = bookmarks.findIndex(bookmark => bookmark.word === resultWord.innerText.trim());
        if (index !== -1) {
            bookmarks.splice(index, 1);
        };
        addToBookmarksBtn.icon = 'bookmark_add';
        addToBookmarksBtn.innerText = '添加至单词本';
    };
    updateBookmarks();
};




function switchPage(to) {
    $(`#app-page-${currentPage}`).style.display = 'none';
    $(`#app-page-${to}`).style.display = 'flex';
    currentPage = to;

    if (to === 'bookmarks') {
        bookmarksList.innerHTML = '';
        loadBookmarks().forEach(bookmark => {
            const bookmarkItem = document.createElement('mdui-list-item');
            bookmarkItem.headline = bookmark.word;
            bookmarkItem.description = bookmark.explain.replaceAll('<br>', '　');
            bookmarkItem.onclick = () => {
                switchPage('dictionary');
                searchInput.value = bookmark.word;
                search();
                navRail.value = navBar.value = 'dictionary';
            };
            bookmarksList.appendChild(bookmarkItem);
        });
        bookmarksHeader.innerText = `我的单词本 （${loadBookmarks().length}）`;
    };
};

navRail.onchange = navBar.onchange = (e) => {
    navRail.value = navBar.value = e.target.value;
    switchPage(e.target.value);
};

if ("virtualKeyboard" in navigator) {
    navigator.virtualKeyboard.overlaysContent = true;
} else {
    searchInput.onfocus = quizInput.onfocus = () => {
        navBar.style.display = 'none';
    };
    searchInput.onblur = quizInput.onblur = () => {
        navBar.style.display = 'flex';
    };
};