// contains ui logic exluding player and playlist.

const startOptionUrl = $('#start__url_option');
const startOptionSearch = $('#start__search_option');
const startOptionFeatured = $('#start__featured_option');
const welcomeOverlay = $('.welcome_overlay');
const viewMV = $('.detail__see_mv');
const mvVideo = $('.mv__video');
let currentPage = 'main';
let pages_stack = [];
startOptionSearch.onclick =() => {
    switchPage('search');
};

startOptionFeatured.onclick = () => {
    switchPage('featured');
};

function switchPage(destination) {
    if (!pages_stack.includes(destination) && currentPage !== destination) {
        pages_stack.push(currentPage);
    };
    const currentPageEle = $(`#app_page__${currentPage}`);
    const destinationEle = $(`#app_page__${destination}`);
    currentPageEle.style.opacity ='0';
    setTimeout(() => {
        currentPageEle.style.display = 'none';
        destinationEle.style.display = 'block';
        destinationEle.style.opacity = '0';
        setTimeout(() => {
            destinationEle.style.opacity = '1';
        }, 100);

        currentPage = destination;
        // back btn handler
        if (currentPage !== 'main') {
            $(`#app_page__${currentPage} .header__back_btn`).onclick = () => {
                switchPage(pages_stack[pages_stack.length - 1]);
                pages_stack.pop();
            };
        } else {
            pages_stack = [];
        };
    
        // page switching events handling
        switch (destination) {
            case 'featured':
                fetchFeaturedList();
                break;
            case 'lyrics':
                checkMVAvailability();
                break;
            case 'mv':
                audio.pause();
                loadMV();
                break;
            case 'search':
                searchHistoryList.style.width = searchInput.clientWidth + 'px';
                searchInput.focus();
                break;
            default:
                break;
        };
    }, 200);
};

function checkMVAvailability() {
    if (player.getCurrentSong()) {
        if (player.getCurrentSong().mvid) {
            viewMV.style.display = 'block';
        } else {
            viewMV.style.display = 'none';
        };
    };
};

viewMV.onclick = () => {
    switchPage('mv');
};



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

// welcome screen
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        welcomeOverlay.style.opacity = 0;
        setTimeout(() => {
            welcomeOverlay.style.display = 'none';
        }, 300)
    }, 1000);
})