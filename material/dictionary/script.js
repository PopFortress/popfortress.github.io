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
const britishAudioBtn = $('.british-pronunciation-btn');
const britishAudio = $('#british-pronunciation-audio');
const americanAudioBtn = $('.american-pronunciation-btn');
const americanAudio = $('#american-pronunciation-audio');
const relwordsWrapper = $('.relwords-wrapper');
const phrasesWrapper = $('.phrases-wrapper');

const apis = {
    dict: 'https://v2.xxapi.cn/api/englishwords?word=',
    translation: 'https://api.pearktrue.cn/api/translate/',
}

async function search() {
    document.body.style.overflow = 'hidden';
    loadingModal.showModal();
    const query = searchInput.value.trim();
    if (query) {
        if (query.split(' ').length <= 1) {
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
                resultDetails += `${translation.pos}. ${translation.tran_cn}<br>`;
            });
            result.innerHTML = resultDetails;
            if (data.data.ukphone && data.data.usphone) {
                resultPhonetic.innerHTML = `BrE: /${data.data.ukphone}/　AmE: /${data.data.usphone}/`;
            } else {
                resultPhonetic.innerHTML = '';
            };

            audioWrapper.style.display = 'flex';
            britishAudio.src = data.data.ukspeech;
            americanAudio.src = data.data.usspeech;

            if (data.data.synonyms.length > 0) {
                synonymsWrapper.innerText = '同近义词 (Synonyms):　';
                data.data.synonyms.forEach(synonym => {
                    synonym.Hwds.forEach(item => {
                        const synonym = document.createElement('a');
                        synonym.innerText = item.word;
                        synonym.href = 'javascript:;';
                        synonym.onclick = () => {
                            searchInput.value = synonym.innerText;
                            search();
                        };
                        synonymsWrapper.appendChild(synonym);
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
                        relwordLink.innerText = `(${relword.Pos}.) ${item.hwd}`;
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
            }
        } else {
            const url = `${apis.translation}?text=${query}&type=auto`;
            const response = await fetch(url);
            const data = await response.json();

            audioWrapper.style.display = 'flex';
            resultPhonetic.innerHTML = '';
            synonymsWrapper.style.display = 'none';
            sentencesWrapper.style.display = 'none';
            relwordsWrapper.style.display = 'none';
            phrasesWrapper.style.display = 'none';

            britishAudio.src = `https://dict.youdao.com/dictvoice?audio=${searchInput.value}&type=1`;
            americanAudio.src = `https://dict.youdao.com/dictvoice?audio=${searchInput.value}&type=2`;

            resultWord.innerText = data.data.text;
            result.innerText = data.data.translate;
        };
    };
    loadingModal.close();
    searchInput.blur();
    navigator.virtualKeyboard.hide();
};

britishAudioBtn.onclick = () => {
    britishAudio.play();
};
americanAudioBtn.onclick = () => {
    americanAudio.play();
};

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
        }, 300);
    };
};