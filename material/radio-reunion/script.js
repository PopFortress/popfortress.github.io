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

const detailsMenu = $('.details__menu');
const lyrcisAlbumCover = $('.lyrics__album__cover');
const playerFrame = $('.player');
const appPages = document.querySelectorAll('.app_page');


// essential definitions
const xhr = new XMLHttpRequest();
let apiServer = 'https://seep.eu.org/https://ncm-api-enhanced-nine.vercel.app';
const apiServerAlternate = 'https://apis.netstart.cn/music';
const mediaServer = 'https://music.163.com/song/media/outer/url';

xhr.onerror = (e) => {
    mdui.snackbar({ message: `无法连接至服务器。`});
};

function requestAPI(endpoint, method = 'GET', cacheEnabled = true, noCookie = false) {
    let url;
    if (cacheEnabled) {
        if (endpoint.includes('?')) {
            url = `${apiServer}${endpoint}%26cookie=${authenticator.cookie}`;
        } else {
            url = `${apiServer}${endpoint}%3Fcookie=${authenticator.cookie}`;
        };
    } else {
        url = `${apiServer}${endpoint}?r=${Date.now()}%26cookie=${authenticator.cookie}`;
    };
    if (noCookie) {
        url = `${apiServer}${endpoint}`;
    };
    xhr.open(method, url);
    xhr.send();
    return xhr;
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
        this.hidden = false;
        this.isPlayingFM = false;
    };
    playSong(index) {
        this.showPlayerFrame(true);
        console.log(index);
        lyrcisAlbumCover.style.display = 'none';
        
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
        this.showPlayerFrame(false);
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
    showPlayerFrame(status) {
        if (status) {
            playerFrame.style.display = 'inherit';
            setTimeout(() => {
                playerFrame.classList.remove('hidden');
                appPages.forEach(page => {
                    page.style.maxHeight = 'calc(100vh - 100px)';
                });
            }, 0);
        } else {
            playerFrame.classList.add('hidden');
            setTimeout(() => {
                playerFrame.style.display = 'none';
                appPages.forEach(page => {
                    page.style.maxHeight = 'inherit';
                });
            }, 400);
        };
        this.hidden = !status;
    };
    playNcmSong(songInfo) {
        let info = songInfo;
        xhr.open('GET', `${apiServer}/song/url%3Fid=${info.id}%26cookie=${authenticator.cookie}`);
        xhr.send();
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            if (data.code === 200) {
                const url = data.data[0].url;
                info.url = url;
            };
            const song = new Song(info);
            playlist.addItem(song);
            player.playSong(playlist.length - 1);
            lyricsDisplayer.loadLyrics(info.id);
        };
    };
};

class Playlist {
    constructor() {
        this.length = 0;
        this.playlist = [];
        this.fmPlaylist = []; // for ncm personal fm
        this.fmIndex = 0;
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
    savePlaylist() {
        mdui.prompt({
            headline: '键入播放列表名称',
            description: '内容将保存在您的设备上。',
            onConfirm: (value) => {
                const listObj = {};
                listObj.name = value;
                const data = JSON.parse(localStorage.rr_playlists || '[]');
                const currentPlaylist = this.getFilteredList();
                currentPlaylist.forEach(song => {
                    delete song.itemEle;
                    delete song.index;
                    if (song.id) {
                        delete song.url;
                    };
                });
                listObj.tracks = currentPlaylist;
                data.push(listObj);
                localStorage.rr_playlists = JSON.stringify(data);
                mdui.snackbar({ message: '已保存当前播放列表。' });
                this.loadPlaylist(currentPlaylist);
            },
        });
    };
    loadPlaylist(tracks) {
        this.clearItems();
        tracks.forEach(track => {
            if (track.id && !track.url) {
                track.url = `${apiServer}/song/url/v1/302%3Fid=${track.id}%26level=exhigh%26cookie=${authenticator.cookie}`;
            };
            playlist.addItem(new Song(track));
        });
        lyricsDisplayer.loadLyrics(player.getCurrentSong().id);
        player.switchLoadingState('loaded');
        player.playSong(0);
    };
};

class LyricsDisplayer {
    constructor() {
        this.lyrics = '[00:00.00]团结电台　Radio Reunion';
        this.isLyricsStatic = false;
    };
    loadLyrics(id) {
        if (id) {
            this.isLyricsStatic = true;
            doms.loading.style.display = 'flex';
            this.resetLyrics();
            xhr.open('GET', `${apiServer}/lyric%3Fid=${id}`);
            xhr.send();
            xhr.onload = () => {
                doms.loading.style.display = 'none';
                const data = JSON.parse(xhr.responseText);
                if (data.lrc) {
                    this.lyrics = data.lrc.lyric;
                    if (data.tlyric && detailsMenu.value === 'show-translation') {
                        lrcData = parseLrc(this.lyrics, data.tlyric.lyric);
                    } else if (data.romalrc && detailsMenu.value === 'show-notations') {
                        lrcData = parseLrc(this.lyrics, data.romalrc.lyric);
                    } else {
                        lrcData = parseLrc(this.lyrics);
                    };
                    createLrcElement();
                };

                lyrcisAlbumCover.style.display = 'inherit';
                lyrcisAlbumCover.style.backgroundImage = `url(${player.getCurrentSong().cover})`;
            };
        };
    };
    resetLyrics() {
        doms.ul.style.transform = `translateY(0px)`;
        doms.ul.innerHTML = '';
        lyrcisAlbumCover.style.display = 'none';
    };
};

// lyrics options logic
detailsMenu.onchange = () => { if (player.getCurrentSong()) lyricsDisplayer.loadLyrics(player.getCurrentSong().id) };



// initialize objects
const playlist = new Playlist();
const player = new Player({
    currentIndex: 0,
    playlist: playlist,
    playback_mode: 'list_repeat',
});
const lyricsDisplayer = new LyricsDisplayer();
player.showPlayerFrame(false);


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
    audio.playbackRate = settEles.playerPlayrate.slider.value;
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
    if (e.key === ' ' && e.target.tagName !== 'MDUI-TEXT-FIELD'  && e.target.tagName !== 'VIDEO' && !player.hidden) {
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
    if (player.isPlayingFM) {
        fmPlayNext();
        return;
    };
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

function appendSongItem(song, listEle) {
    songInfo = {};
    songInfo.title = song.name;
    songInfo.InfoUrl = `${apiServer}/song/url%3Fid=${song.id}`;
    let artists = [];
    song.ar.forEach(artist => {
        artists.push(artist.name);  
    });
    songInfo.artist = artists.join(', ');
    songInfo.album = song.al.name;
    songInfo.cover = song.al.picUrl;
    
    const listitem = document.createElement('mdui-list-item');
    const coverImg = document.createElement('img');
    const extraInfo = document.createElement('div');
    let extra_info = [];
    if (song.fee) {
        extra_info.push('付费');
    };
    if (song.mv) {
        extra_info.push('MV 可用');
    };
    extraInfo.innerHTML = extra_info.join('　');
    extraInfo.slot = 'end-icon';

    coverImg.src = song.al.picUrl;
    coverImg.slot = 'icon';
    coverImg.className = 'playlist__item_cover';
    listitem.headline = songInfo.title;
    listitem.description = songInfo.album ? `${songInfo.artist} - 《${songInfo.album}》` : `${songInfo.artist}`;
    listitem.appendChild(coverImg);
    listitem.appendChild(extraInfo);
    songInfo.id = song.id;
    songInfo.mvid = song.mv;
    listitem.dataset.song_info = JSON.stringify(songInfo);
    listitem.onclick = (e) => {
        player.switchLoadingState('loading');
        const info = JSON.parse(e.target.dataset.song_info);
        player.playNcmSong(info);
    };
    listEle.appendChild(listitem);
};