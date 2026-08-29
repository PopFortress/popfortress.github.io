const plSaveBtn = $('.playlist__save_btn');
const plLoadBtn = $('.playlist__load_btn');
const plLoadDialog = $('.playlist__load_dialog');
const playlistsList = $('.playlist__playlists_select_list');
const headerPlLoadBtn = $('.header__load_playlist_btn');

const localPlaylistEles = {
    cover: $('#app_page__local_playlist_details .songlist__detail_cover'),
    title: $('#app_page__local_playlist_details .songlist__detail_title'),
    author: $('#app_page__local_playlist_details .songlist__detail_author'),
    description: $('#app_page__local_playlist_details .songlist__detail_description'),
    tracksList: $('#app_page__local_playlist_details .songlist__tracks_list'),
    playAllBtn: $('#app_page__local_playlist_details .songlist__play_all_btn'),
};
let currentLocalTracks = [];

plSaveBtn.onclick = playlist.savePlaylist.bind(playlist);

headerPlLoadBtn.onclick = plLoadBtn.onclick = () => {
    plLoadDialog.open = true;
    playlistsList.innerHTML = '';
    const playlists = JSON.parse(localStorage.rr_playlists || '[]');
    [...playlists].reverse().forEach(list => {
        const listitem = document.createElement('mdui-list-item');
        listitem.innerHTML = list.name;
        listitem.onclick = () => {
            plLoadDialog.open = false;
            playlistContainer.open = false;
            loadLocalPlaylistDetails(list.name, list.tracks);
            switchPage('local_playlist_details');
        };
        playlistsList.appendChild(listitem);
    });
};

function loadLocalPlaylistDetails(name, tracks) {
    currentLocalTracks = tracks;
    localPlaylistEles.title.innerText = name;
    localPlaylistEles.author.innerText = `本地播放列表　共 ${tracks.length} 首歌`;
    localPlaylistEles.description.innerText = '保存在本设备的播放列表。';
    localPlaylistEles.cover.src = tracks[0] && tracks[0].cover ? tracks[0].cover : './radioreunion__1.1.png';
    localPlaylistEles.tracksList.innerHTML = '';
    tracks.forEach((track, index) => {
        appendLocalSongItem(track, index, localPlaylistEles.tracksList);
    });
};

function appendLocalSongItem(track, index, listEle) {
    const listitem = document.createElement('mdui-list-item');
    const coverImg = document.createElement('img');
    coverImg.src = track.cover;
    coverImg.slot = 'icon';
    coverImg.className = 'playlist__item_cover';
    listitem.headline = track.title;
    listitem.description = track.album ? `${track.artist} - 《${track.album}》` : track.artist;
    listitem.appendChild(coverImg);
    listitem.onclick = () => {
        playLocalTracks(index);
    };
    listEle.appendChild(listitem);
};

function playLocalTracks(startIndex = 0) {
    playlist.clearItems();
    const songs = currentLocalTracks.map(track => {
        const song = new Song(track);
        if (song.id && !song.url) {
            song.url = `${apiServer}/song/url/v1/302%3Fid=${song.id}%26level=exhigh%26unblcok=true%26cookie=${authenticator.cookie}`;
        };
        return song;
    });
    songs.forEach(song => {
        playlist.addItem(song);
    });
    if (songs.length > 0) {
        player.switchLoadingState('loaded');
        player.playSong(startIndex);
        if (songs[startIndex] && songs[startIndex].id) {
            lyricsDisplayer.loadLyrics(songs[startIndex].id);
        };
    };
};

localPlaylistEles.playAllBtn.onclick = () => {
    playLocalTracks(0);
};
