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
const searchInput = $('.search__input');

let player_info = {
    cover: '', title: '', artist: '', url: ''
};
let playlist_array = [];
let playback_mode = 'list_repeat';

let currentPage = 'main';

class Song {
    constructor(options) {
        this.title = options.title;
        this.artist = options.artist;
        this.url = options.url;
        this.cover = options.cover;
        this.album = options.album;
    };
};

class Playlist {
    constructor(length) {
        this.length = length;
    };
    addItem(options) {
        const song = options;
        const listItem = document.createElement('mdui-list-item');
        listItem.headline = song.title;
        listItem.description = song.artist;
        const coverImg = document.createElement('img');
        coverImg.src = song.cover;
        coverImg.slot = 'icon';
        coverImg.className = 'playlist__item_cover';
        const removeBtn = document.createElement('mdui-button-icon');
        removeBtn.icon = 'close';
        removeBtn.slot = 'end-icon';
        removeBtn.onclick = () => {
            playlist.removeItem(playlist_array.indexOf(song), true);
        };
        listItem.appendChild(coverImg);
        listItem.appendChild(removeBtn);
        playlistList.firstChild ? playlistList.firstChild.before(listItem) : playlistList.appendChild(listItem);
        song.itemEle = listItem;
        listItem.onclick = () => {
            if (playlist_array.indexOf(song) > -1) {
                player_play_list_item(playlist_array.indexOf(song));
                playlistContainer.open = false;
            };
        };
        playlist_array.push(song);
        this.length++;
    };
    removeItem(index, isManual) {
        console.log(index);
        playlist_array[index].itemEle.remove();
        playlist_array.splice(index, 1);
        this.length--;
        if (player_info.playlistIndex === index && isManual) {
            resetPlayer();
        };
    };
    clearItems() {
        playlistList.innerHTML = '';
        playlist_array = [];
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

const playlist = new Playlist(playlist_array.length);

function time_formatting(seconds) {
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60) < 10 ? '0' : ''}${Math.floor(seconds % 60)}`
};

function setColorScheme() {
    const image = new Image();
    image.src = player_info.cover;
    mdui.getColorFromImage(image).then((color) => {
        mdui.setColorScheme(color);
    });
};

function player_play_list_item(playlist_index) {
    player_play_new(playlist_array[playlist_index]);
    playlist.removeItem(playlist_index, false);
};

function player_play_new(options) {
    Object.keys(options).forEach(key => {
        player_info[key] = options[key];
    });
    audio.src = player_info.url;
    playerCover.style.display = 'none';
    playerLoading.style.display = 'flex';
    playerTitle.innerText = player_info.title;
    playerArtist.innerText = player_info.artist;
    playerTimeElapsed.innerText = '0:00';
    playlist.addItem(options);
    audio.play();
    setColorScheme();
    player_info.playlistIndex = playlist_array.indexOf(options);
    playlistList.childNodes.forEach((item) => {
        item.active = false;
    });
    playlist_array[player_info.playlistIndex].itemEle.active = true;
};

audio.addEventListener('canplay', ()=> {
    if (audio.duration === Infinity) {
        playerDuration.innerText = '';
        playerProgressbar.disabled = true;
    } else {
        playerDuration.innerText =  time_formatting(audio.duration);
        playerProgressbar.disabled = false;
    };
    playerCover.style.backgroundImage = `url(${player_info.cover})`;
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
    if (player_info.url) {
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
                player_play_new({
                    url: url,
                    cover: './radioreunion__1.1.png',
                    title: url,
                    artist: url.split('://')[1].split('/')[0],
                });
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
    if (e.key === ' ') {
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
    switch (playback_mode) {
        case 'list_repeat':
            if (player_info.playlistIndex === playlist_array.length) {
                player_play_list_item(0);
            } else {
                player_play_list_item(player_info.playlistIndex);
            };
            break;
        case 'shuffle':
            player_play_list_item(Math.floor(Math.random() * playlist_array.length));
            break;
        case 'play_list_once':
            if (player_info.playlistIndex < playlist_array.length) {
                player_play_list_item(player_info.playlistIndex);
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
    switch (playback_mode) {
        case 'list_repeat':
            playbackModeBtn.icon = 'repeat_one';
            playback_mode = 'repeat_single';
            audio.loop = true;
            break;
        case 'repeat_single':
            playbackModeBtn.icon = 'shuffle';
            playback_mode = 'shuffle';
            audio.loop = false;
            break;
        case 'shuffle':
            playbackModeBtn.icon = 'arrow_right_alt';
            playback_mode = 'play_list_once';
            break;
        case 'play_list_once':
            playbackModeBtn.icon = 'repeat';
            playback_mode = 'list_repeat';
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