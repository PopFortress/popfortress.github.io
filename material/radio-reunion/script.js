const $ = (query) => mdui.$(query)[0];

const startOptionUrl = $('#start__url_option');
const startOptionSearch = $('#start__search_option');
const startOptionFeatured = $('#start__featured_option');
const audio = $('#player-audio');
const playerTitle = $('.player__title');
const playerArtist = $('.player__artist');
const playerCover = $('.player__cover');
const playerProgressbar = $('.player__progress-bar');
const playerTimeElapsed = $('.player__time_elapsed');
const playerDuration = $('.player__duration');
const playerLoading = $('.player__loading');
const playerPlayback = $('.player__playback_btn');

const playlistContainer = $('.playlist');
const playerPlaylistBtn = $('.player__playlist_btn');
const playlistList = $('.playlist__playlist');
const playlistClearBtn = $('.playlist__clear_btn');
const playbackModeBtn = $('.playback__ordering_btn');

const headerBackBtns = document.querySelectorAll('.header__back_btn');

let currentPage = 'main';

const xhr = new XMLHttpRequest();
const apiServer = 'https://163api.qijieya.cn';


class Song {
    constructor(options) {
        this.title = options.title;
        this.artist = options.artist;
        this.url = options.url;
        this.cover = options.cover;
        this.album = options.album;
    };
};

class Player {
    constructor(options) {
        this.currentIndex = options.currentIndex;
        this.playlist = options.playlist;
        this.playback_mode = options.playback_mode;
    };
    playSong(index) {
        const song = this.playlist.playlist[index];
        audio.src = song.url;
        playerCover.style.display = 'none';
        playerLoading.style.display = 'flex';
        playerTitle.innerText = song.title;
        playerArtist.innerText = song.artist;
        playerTimeElapsed.innerText = '0:00';
        audio.play();
        setColorScheme();
        this.currentIndex = index;
        playlistList.childNodes.forEach((item) => {
            item.active = false;
        });
        song.itemEle.active = true;
    };
    getCurrentSong() {
        return this.playlist.playlist[this.currentIndex];
    };
};

class Playlist {
    constructor() {
        this.length = 0;
        this.playlist = [];
    };
    addItem(options) {
        let item = options;
        item.index = this.length;
        const listItem = document.createElement('mdui-list-item');
        listItem.headline = options.title;
        listItem.description = options.artist;
        const coverImg = document.createElement('img');
        coverImg.src = options.cover;
        coverImg.slot = 'icon';
        coverImg.className = 'playlist__item_cover';
        const removeBtn = document.createElement('mdui-button-icon');
        removeBtn.icon = 'close';
        removeBtn.slot = 'end-icon';
        removeBtn.onclick = () => {
            playlist.removeItem(item.index);
        };
        listItem.appendChild(coverImg);
        listItem.appendChild(removeBtn);
        playlistList.firstChild ? playlistList.firstChild.before(listItem) : playlistList.appendChild(listItem);
        options.itemEle = listItem;
        listItem.onclick = (e) => {
            if (e.target === removeBtn) {
                return;
            } else {
                player.playSong(item.index);
                playlistContainer.open = false;
            };
        };
        this.playlist.push(item);
        this.length++;
    };
    removeItem(index) {
        this.playlist[index].itemEle.remove();
        this.playlist.splice(index, 1);
        this.length--;
        if (player.currentIndex === index) {
            resetPlayer();
        };
    };
    clearItems() {
        playlistList.innerHTML = '';
        this.playlist = [];
        this.length = 0;
    };
};

function resetPlayer() {
    audio.pause();
    playerCover.style.backgroundImage = 'url("./radioreunion__1.1.png")';
    playerTitle.innerText = 'Radio Reunion';
    playerArtist.innerText = '团结电台';
    playerProgressbar.disabled = true;
    setTimeout(() => {
        playerTimeElapsed.innerText = playerDuration.innerText ='0:00';
        playerProgressbar.value = 0;
    }, 100);
    audio.removeAttribute('src');
    player_info = { cover: '', title: '', artist: '', url: '' };
    mdui.removeColorScheme();
};

const playlist = new Playlist();
const player = new Player({
    currentIndex: 0,
    playlist: playlist,
    playback_mode: 'list_repeat',
});

function time_formatting(seconds) {
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60) < 10 ? '0' : ''}${Math.floor(seconds % 60)}`
};

function setColorScheme() {
    const image = new Image();
    image.src = player.getCurrentSong().cover;
    mdui.getColorFromImage(image).then((color) => {
        mdui.setColorScheme(color);
    });
};


audio.addEventListener('canplay', ()=> {
    if (audio.duration === Infinity) {
        playerDuration.innerText = '';
        playerProgressbar.disabled = true;
    } else {
        playerDuration.innerText =  time_formatting(audio.duration);
        playerProgressbar.disabled = false;
    };
    playerCover.style.backgroundImage = `url(${player.getCurrentSong().cover})`;
    playerLoading.style.display = 'none';
    playerCover.style.display = 'block';
});

function progressUpdateHandler() {
    playerTimeElapsed.innerText = time_formatting(audio.currentTime);
    playerProgressbar.value = (audio.currentTime / audio.duration) * 100;
};

audio.addEventListener('timeupdate', progressUpdateHandler);

playerProgressbar.addEventListener('input', () => {
    audio.removeEventListener('timeupdate', progressUpdateHandler);
    playerTimeElapsed.innerText = time_formatting((playerProgressbar.value / 100) * audio.duration);
});
playerProgressbar.addEventListener('change', () => {
    audio.currentTime = (playerProgressbar.value / 100) * audio.duration;
    audio.addEventListener('timeupdate', progressUpdateHandler);
    audio.play();
});

audio.addEventListener('play', ()=> {
    playerPlayback.icon = 'pause';
    playerLoading.style.display = 'none';
    playerCover.style.display = 'block';
});
audio.addEventListener('pause', ()=> {
    playerPlayback.icon = 'play_arrow';
});
playerPlayback.onclick = () => {
    if (player.getCurrentSong()) {
        audio.paused ? audio.play() : audio.pause();
    };
};
audio.addEventListener('error', () => {
    mdui.snackbar({ message: `无法播放资源: ${audio.currentSrc}`});
    playerLoading.style.display = 'none';
    playerCover.style.display = 'block';
});

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
                playlist.addItem({
                    url: url,
                    cover: './radioreunion__1.1.png',
                    title: url,
                    artist: url.split('://')[1].split('/')[0],
                    album: '团结电台（媒体流）'
                });
                player.playSong(playlist.length - 1);
            } else {
                return false;
            }
        }
    })
}

playerPlaylistBtn.onclick = () => {
    playlistContainer.open = playlistContainer.open ? false : true;
}

mdui.loadLocale((locale) => import(`https://unpkg.com/mdui@2/locales/${locale}.js`));
mdui.setLocale('zh-cn');

document.onkeydown = (e) => {
    if (e.key === ' ' && e.target.tagName !== 'MDUI-TEXT-FIELD') {
        e.preventDefault();
        playerPlayback.click();
    };
};

playlistClearBtn.onclick = () => {
    mdui.confirm({
        headline: '清除播放列表',
        description: '所有项目将被移除。你确定吗？',
        onConfirm: () => {
            playlist.clearItems();
            resetPlayer();
        },
    });
};

audio.addEventListener('ended', () => {
    switch (player.playback_mode) {
        case 'list_repeat':
            if (player.currentIndex === playlist.length - 1) {
                player.playSong(0);
            } else {
                player.playSong(player.currentIndex + 1);
            };
            break;
        case 'shuffle':
            player.playSong(Math.floor(Math.random() * playlist.length));
            break;
        case 'play_list_once':
            if (player.currentIndex < playlist.length) {
                player.playSong(player.currentIndex + 1);
            };
            break;
        default:
            break;
    };
});

audio.addEventListener('waiting', () => {
    playerLoading.style.display = 'flex';
    playerCover.style.display = 'none';
});

playbackModeBtn.onclick = () => {
    switch (player.playback_mode) {
        case 'list_repeat':
            playbackModeBtn.icon = 'repeat_one';
            player.playback_mode = 'repeat_single';
            audio.loop = true;
            break;
        case 'repeat_single':
            playbackModeBtn.icon = 'shuffle';
            player.playback_mode = 'shuffle';
            audio.loop = false;
            break;
        case 'shuffle':
            playbackModeBtn.icon = 'arrow_right_alt';
            player.playback_mode = 'play_list_once';
            break;
        case 'play_list_once':
            playbackModeBtn.icon = 'repeat';
            player.playback_mode = 'list_repeat';
        default:
            break;
    };
};

startOptionSearch.onclick =() => {
    switchPage('search');
    searchInput.focus();
};

function switchPage(destination) {
    $(`#app_page__${currentPage}`).style.display = 'none';
    $(`#app_page__${destination}`).style.display = 'block';
    currentPage = destination;
};

headerBackBtns.forEach((btn) => {
    btn.onclick = () => {
        switchPage('main');
    };
});