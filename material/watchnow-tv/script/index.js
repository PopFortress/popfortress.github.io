mdui.setColorScheme('#62a6f9');

const $ = (query) => mdui.$(query)[0];

const searchBar = $('.search__input');

searchBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const searchValue = searchBar.value.trim();
        if (searchValue) {
            window.location.href = `./search?q=${searchValue}`;
            searchBar.value = '';
        };
    };
});