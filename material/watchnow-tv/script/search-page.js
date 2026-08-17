const searchBar = $('.search__input');
const params = new URLSearchParams(window.location.search);
let searchValue;
let searchResults;
const resultsList = $('.search_results__list');
const loadingFrame = $('.loading_frame');
const bottomText = $('.bottom_text');

if (params.has('q')) {
    searchValue = params.get('q');
    searchBar.value = searchValue;
    document.title = `${searchValue} - Watchnow TV 📺 搜索结果`;
    if (searchValue.trim()) {
        searchResources();
    } else {
        loadingFrame.style.display = 'none';
    };
};

searchBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const searchValue = searchBar.value.trim();
        if (searchValue) {
            window.location.href = `./search?q=${searchValue}`;
            searchBar.value = '';
        };
    };
});

function searchResources() {
    xhr.open('GET', accessToken ? `${api.server}/index.json?access_token=${accessToken}` : `${api.server}/index.json`);
    xhr.send();
    xhr.onload = () => {
        const base64 = JSON.parse(xhr.responseText).content;
        searchResults = JSON.parse(new TextDecoder().decode(base64ToBytes(base64)));

        loadingFrame.style.display = 'none';

        searchResults.forEach(result => {
            if (result.title.includes(searchValue) || result.desc.includes(searchValue)) {
                const listitem = document.createElement('mdui-list-item');
                listitem.headline = result.title;
                listitem.description = result.desc || '';
                listitem.headlineLine = 1;
                listitem.descriptionLine = 3;
                listitem.title = result.desc;
                const coverImg = document.createElement('img');
                coverImg.src = result.cover_img || placeholderImg;
                coverImg.slot = 'icon';
                coverImg.classList.add('search_results__cover');
                listitem.appendChild(coverImg);

                listitem.addEventListener('click', () => {
                    sessionStorage.entryInfo = JSON.stringify(result);
                    window.location.href = `./details?category=${result.title}`;
                });

                resultsList.appendChild(listitem);
            };
        });

        bottomText.style.display = 'block';
    };
};