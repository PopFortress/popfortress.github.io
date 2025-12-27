// contains ui logic exluding player and playlist.

const startOptionUrl = $('#start__url_option');
const startOptionSearch = $('#start__search_option');
const startOptionFeatured = $('#start__featured_option');
const headerBackBtns = document.querySelectorAll('.header__back_btn');
let currentPage = 'main';
startOptionSearch.onclick =() => {
    switchPage('search');
    searchInput.focus();
};

startOptionFeatured.onclick = () => {
    switchPage('featured');
};

function switchPage(destination) {
    $(`#app_page__${currentPage}`).style.display = 'none';
    $(`#app_page__${destination}`).style.display = 'block';
    currentPage = destination;
    if (destination === 'featured') {
        fetchFeaturedList();
    };
};

headerBackBtns.forEach((btn) => {
    btn.onclick = () => {
        switchPage('main');
    };
});


// url option handler
startOptionUrl.onclick = ()=> {
    mdui.prompt({
        headline: "输入 URL.",
        textFieldOptions: {
            placeholder: "https://example.com/stream",
            pattern: '[a-zA-z]+://[^\]*',
        },
        onConfirm: (value) => {
            if (value.trim()) {
                const url = value.trim();
                const song = new Song({
                    url: url,
                    cover: './radioreunion__1.1.png',
                    title: url,
                    artist: url.split('://')[1].split('/')[0],
                    album: '团结电台（媒体流）'
                });
                playlist.addItem(song);
                player.playSong(playlist.length - 1);
                resetLyrics();
            } else {
                return false;
            };
        },
    });
};