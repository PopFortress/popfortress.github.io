// essential ui logic
const $ = (query) => mdui.$(query)[0];

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
const playlistBadge = $('.playlist__title_badge');


// essential definitions
const xhr = new XMLHttpRequest();
const apiServer = 'https://163api.qijieya.cn';
const apiServerAlternate = 'https://apis.netstart.cn/music';
const mediaServer = 'https://music.163.com/song/media/outer/url';

xhr.onerror = (e) => {
    mdui.snackbar({ message: `无法连接至服务器。`});
};

// objects definitions
class Song {
    constructor(options) {
        this.title = options.title;
        this.artist = options.artist;
        this.url = options.url;
        this.cover = options.cover;
        this.album = options.album;

        // only for ncm
        if (options.id) {
            this.id = options.id;
        };
        if (options.mvid) {
            this.mvid = options.mvid;
        };
    };
};

class Player {
    constructor(options) {
        this.currentIndex = options.currentIndex;
        this.playlist = options.playlist;
        this.playback_mode = options.playback_mode;
        this.loadingState = 'loaded'; // 'loading' or 'loaded'
    };
    playSong(index) {
        console.log(index);
        
        const song = this.playlist.playlist[index];
        audio.src = song.url;
        this.switchLoadingState('loading');
        playerTitle.innerText = song.title;
        playerArtist.innerText = song.artist;
        playerTimeElapsed.innerText = '0:00';
        audio.play();
        this.currentIndex = index;
        playlistList.childNodes.forEach((item) => {
            item.active = false;
        });
        song.itemEle.active = true;
        if (!song.id) {
            lyricsDisplayer.resetLyrics();
        };
        setColorScheme();
    };
    getCurrentSong() {
        return this.playlist.playlist[this.currentIndex];
    };
    resetPlayer() {
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
        mdui.removeColorScheme();
        this.switchLoadingState('loaded');
        lyricsDisplayer.resetLyrics();
    };
    switchLoadingState(status) {
        switch (status) {
            case 'loading':
                playerLoading.style.display = 'flex';
                playerCover.style.display = 'none';
                this.loadingState = 'loading';
                break;
            case 'loaded':
                playerLoading.style.display = 'none';
                if (!controlsFullwidth) {
                    playerCover.style.display = 'block';
                };
                this.loadingState = 'loaded';
            default:
                break;
        };
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
        playlistList.appendChild(listItem);
        listItem.dataset.index = item.index;
        options.itemEle = listItem;
        listItem.onclick = (e) => {
            if (e.target === removeBtn) {
                return;
            } else {
                player.playSong(+e.target.dataset.index);
                playlistContainer.open = false;
                lyricsDisplayer.loadLyrics(player.getCurrentSong().id);
            };
        };
        this.playlist.push(item);
        this.length++;
        this.updateBadge();
    };
    removeItem(index) {
        this.playlist[index].itemEle.remove();
        this.playlist[index] = null;
        if (player.currentIndex === index) {
            player.resetPlayer();
        };
        this.updateBadge();
    };
    clearItems() {
        playlistList.innerHTML = '';
        this.playlist = [];
        this.length = 0;
        this.updateBadge();
    };
    updateBadge() {
        const playlist_length = this.getRealLength();
        playlistBadge.innerText = playlist_length;
        if (playlist_length > 0) {
            playlistBadge.style.display = 'inline-flex';
        } else {
            playlistBadge.style.display = 'none';
        };
    };
    getRealLength() {
        return this.playlist.filter((item) => item !== null).length;
    };
    getFilteredList() {
        return this.playlist.filter((item) => item !== null);
    };
};

class LyricsDisplayer {
    constructor() {
        this.lyrics = '[00:00.00]团结电台　Radio Reunion';
    };
    loadLyrics(id) {
        if (id) {
            doms.loading.style.display = 'flex';
            this.resetLyrics();
            xhr.open('GET', `https://163api.qijieya.cn/lyric?id=${id}`);
            xhr.send();
            xhr.onload = () => {
                doms.loading.style.display = 'none';
                const data = JSON.parse(xhr.responseText);
                if (data.lrc) {
                    this.lyrics = data.lrc.lyric;
                    lrcData = parseLrc(this.lyrics);
                    createLrcElement();
                };
            };
        };
    };
    resetLyrics() {
        doms.ul.style.transform = `translateY(0px)`;
        doms.ul.innerHTML = '';
    };
};



// initialize objects
const playlist = new Playlist();
const player = new Player({
    currentIndex: 0,
    playlist: playlist,
    playback_mode: 'list_repeat',
});
const lyricsDisplayer = new LyricsDisplayer();


// assistant functions
function time_formatting(seconds) {
    const ts = `${Math.floor(seconds % 60) < 10 ? '0' : ''}${Math.floor(seconds % 60)}`;
    const tm = seconds % 3600 >= 60 ? Math.floor(seconds % 3600 / 60) : '0';
    if (seconds >= 3600) {
        return `${Math.floor(seconds / 3600)}:${tm < 10 ? '0' : ''}${tm}:${ts}`;
    } else {
        return `${Math.floor(seconds / 60)}:${ts}`;
    };
};

function setColorScheme() {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = player.getCurrentSong().cover;
    mdui.getColorFromImage(image).then((color) => {
        mdui.setColorScheme(color);
    });
};


// player behavior control
audio.addEventListener('canplay', ()=> {
    if (audio.duration === Infinity || audio.duration === 0) {
        playerDuration.innerText = '';
        playerProgressbar.disabled = true;
    } else {
        playerDuration.innerText =  time_formatting(audio.duration);
        playerProgressbar.disabled = false;
    };
    playerCover.style.backgroundImage = `url(${player.getCurrentSong().cover})`;
    player.switchLoadingState('loaded');
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
    player.switchLoadingState('loaded');
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
    player.switchLoadingState('loaded');
});


// playlist ui
playerPlaylistBtn.onclick = () => {
    playlistContainer.open = playlistContainer.open ? false : true;
}

// mdui localization
mdui.loadLocale((locale) => import(`https://unpkg.com/mdui@2/locales/${locale}.js`));
mdui.setLocale('zh-cn');


// player control logic.
// space play/pause.
document.onkeydown = (e) => {
    if (e.key === ' ' && e.target.tagName !== 'MDUI-TEXT-FIELD') {
        e.preventDefault();
        playerPlayback.click();
    };
};


// clear playlist
playlistClearBtn.onclick = () => {
    mdui.confirm({
        headline: '清除播放列表',
        description: '所有项目将被移除。你确定吗？',
        onConfirm: () => {
            playlist.clearItems();
            player.resetPlayer();
        },
    });
};

// player behavior when ended
audio.addEventListener('ended', () => {
    let next_index;
    switch (player.playback_mode) {
        case 'list_repeat':
            let isLastSong;
            if (playlist.playlist[playlist.length - 1] && player.currentIndex === playlist.length - 1) {
                isLastSong = true;
            } else if (player.currentIndex === playlist.getRealLength() - 1) {
                isLastSong = true;
            } else {
                isLastSong = false;
            };
            if (isLastSong) {
                let founded = false;
                playlist.playlist.forEach(item => {
                    if (item && !founded) {
                        founded = true;
                        player.playSong(item.index);
                        next_index = item.index;
                    };
                });
            } else {
                next_index = player.currentIndex + 1
                player.playSong(next_index);
            };
            break;
        case 'shuffle':
            next_index = Math.floor(Math.random() * playlist.length);
            player.playSong(next_index);
            break;
        case 'play_list_once':
            if (player.currentIndex < playlist.length - 1) {
                const list = playlist.getFilteredList();
                next_index = list.indexOf(player.getCurrentSong()) + 1;
                next_index = playlist.playlist.indexOf(list[next_index]);
                player.playSong(next_index);
            };
            break;
        default:
            break;
    };
    console.log(next_index);
    if (next_index > -1) {
        audio.addEventListener('canplay', loadingHandler);
        checkMVAvailability();
    };
    function loadingHandler() {
        setTimeout(() => {
            lyricsDisplayer.loadLyrics(playlist.playlist[next_index].id);
        }, 1000);
        audio.removeEventListener('canplay', loadingHandler);
    };
});

// audio loading behavior
audio.addEventListener('waiting', () => {
    player.switchLoadingState('loading');
});

// playback mode
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

playerCover.onclick = () => {
    switchPage('lyrics');
};