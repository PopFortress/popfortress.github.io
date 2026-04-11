// contains ui logic exluding player and playlist.

const startOptionUrl = $('#start__url_option');
const startOptionSearch = $('#start__search_option');
const startOptionFeatured = $('#start__featured_option');
const welcomeOverlay = $('.welcome_overlay');
const viewMV = $('.detail__see_mv');
const mvVideo = $('.mv__video');
const viewComments = $('.detail__view_comments');
const viewSongDetails = $('.detail__view_song_details');
const songDetailsDialog = $('.lyrics__details_dialog');
const songDetailsText = $('.lyrics__song_details');

let currentPage = 'main';
let previousPage;
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

        previousPage = currentPage;
        currentPage = destination;
        
        // back btn handler
        if (currentPage !== 'main') {
            $(`#app_page__${currentPage} .header__back_btn`).onclick = () => {
                if (currentPage === 'mv') {
                    player.showPlayerFrame(true);
                };

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
                mvVideo.pause();
                audio.play();
                break;
            case 'mv':
                audio.pause();
                loadMV();
                player.showPlayerFrame(false);
                break;
            case 'search':
                searchHistoryList.style.width = searchInput.clientWidth + 'px';
                if (previousPage === 'main') {
                    searchInput.focus();
                };
                break;
            case 'comments':
                loadComments();
                break;
            default:
                break;
        };
    }, 200);
};

function checkMVAvailability() {
    if (player.getCurrentSong()) {
        if (player.getCurrentSong().mvid) {
            viewMV.disabled = false;
        } else {
            viewMV.disabled = true;
        };
    };
};

viewMV.onclick = () => {
    switchPage('mv');
};

viewComments.onclick = () => {
    switchPage('comments');
};

viewSongDetails.onclick = () => {
    songDetailsDialog.open = true;
    const song = player.getCurrentSong();
    songDetailsText.innerHTML = 
    `标题：${song.title}<br>艺术家：${song.artist}<br>专辑名称：${song.album}<br>网易云 id: ${song.id || 'N/A'}<br>网易云 mvid: ${song.mvid || 'N/A'}`;
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
                lyricsDisplayer.resetLyrics();
            } else {
                return false;
            };
        },
    });
};