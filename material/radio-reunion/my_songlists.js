const myMusicContainer = $('.my_music__menu_drawer_container');
let myMusicListsloading;
const myMusicSonglistsList = $('.my_music__songlists_list');
let isSonglistsListLoaded = false;
const addToMySonglist = $('.detail__add_to_my_songlist');
const menuDrawerSelectSonglist = $('#menu-drawer__select_songlist_to_add');
const addToSonglistList = $('.add_to_songlists_list');

let songlistCover;
let songlistTitle;
let songlistTracksCount;

myMusicMenuDrawer.onclose = () => {
    myMusicListsloading.remove();
};

let currentMyTracks = [];

const myPlaylistEles = {
    cover: $('#app_page__my_songlists_details .songlist__detail_cover'),
    title: $('#app_page__my_songlists_details .songlist__detail_title'),
    author: $('#app_page__my_songlists_details .songlist__detail_author'),
    description: $('#app_page__my_songlists_details .songlist__detail_description'),
    tracksList: $('#app_page__my_songlists_details .songlist__tracks_list'),
    playAllBtn: $('#app_page__my_songlists_details .songlist__play_all_btn'),
    detailsWrapper: $('.my_songlist__details_wrapper'),
};

function loadMySonglists() {
    myMusicSonglistsList.innerHTML = '';
    myMusicListsloading = placeLoadingAnimation({
        text: "加载歌单中 …",
        destination: myMusicContainer,
    });

    xhr.open('GET', `${apiServer}/user/playlist%3Fuid=${authenticator.userId}%26cookie=${authenticator.cookie}`);
    xhr.send();
    xhr.onload = () => {
        myMusicListsloading.remove();
        const data = JSON.parse(xhr.responseText);
        if (data.playlist) {
            isSonglistsListLoaded = true;
            data.playlist.forEach(playlist => {
                const listitem = document.createElement('mdui-list-item');
                const img = document.createElement('img');
                img.className = 'my_music__listitem_img';
                img.slot = 'icon';
                img.src = playlist.coverImgUrl;
                listitem.headline = playlist.name;
                listitem.description = `${playlist.trackCount} 单曲`;
                listitem.dataset.pid = playlist.id;
                listitem.appendChild(img);
                listitem.onclick = (e) => {
                    menudrawer.close(myMusicMenuDrawer);
                    switchPage('my_songlists_details');
                    songlistCover = playlist.coverImgUrl;
                    songlistTitle = playlist.name;
                    songlistTracksCount = playlist.trackCount;
                    loadMySonglistsDetails(e.target.dataset.pid);
                };
                myMusicSonglistsList.appendChild(listitem);
            });
        };
    };
};

function loadMySonglistsDetails(pid) {
    myPlaylistEles.tracksList.innerHTML = '';
    const loading = placeLoadingAnimation({
        text: "正在加载歌单详情 …",
        destination: myPlaylistEles.detailsWrapper,
    });
    xhr.open('GET', `${apiServer}/playlist/track/all%3Fid=${pid}%26cookie=${authenticator.cookie}`);
    xhr.send();
    xhr.onload = () => {
        loading.remove();
        const data = JSON.parse(xhr.responseText);
        if (data.songs) {
            myPlaylistEles.cover.src = songlistCover;
            myPlaylistEles.title.innerText = songlistTitle;
            myPlaylistEles.author.innerText = '';
            myPlaylistEles.description.innerText = `共 ${songlistTracksCount} 首单曲`;

            currentMyTracks = data.songs;
            data.songs.forEach(song => {
                const track = document.createElement('mdui-list-item');
                const number = document.createElement('span');
                number.className = 'my_songlist__track_number';
                number.slot = 'icon';
                number.innerText = data.songs.indexOf(song) + 1;
                track.appendChild(number);
                track.dataset.id = song.id;
                track.headline = song.name;
                let artists = [];
                song.ar.forEach(artist => {
                    artists.push(artist.name);  
                });
                track.description = `${artists.join(' / ')} - 《${song.al.name}》`;
                track.onclick = (e) => {
                    playMyTracks(currentMyTracks.findIndex(track => track.id === +e.target.dataset.id));
                };
                myPlaylistEles.tracksList.appendChild(track);
            });
        };
    };
};

function playMyTracks(startIndex = 0) {
    playlist.clearItems();
    const songs = currentMyTracks.map(track => {
        let songInfo = {};
        if (track.id) {
            songInfo.url = `${apiServer}/song/url/v1/302%3Fid=${track.id}%26level=exhigh%26unblcok=true%26cookie=${authenticator.cookie}`;
            songInfo.title = track.name;
            let artists = [];
            track.ar.forEach(artist => {
                artists.push(artist.name);  
            });
            songInfo.artist = artists.join(', ');
            songInfo.cover = track.al.picUrl;
            songInfo.album = track.al.name;
            if (track.mv) {
                songInfo.mvid = track.mv;
            };
            songInfo.id = track.id;
        };
        const song = new Song(songInfo);
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

myPlaylistEles.playAllBtn.onclick = () => {
    playMyTracks(0);
};

addToMySonglist.onclick = () => {
    menudrawer.open(menuDrawerSelectSonglist);
    addToSonglistList.innerHTML = '';
    xhr.open('GET', `${apiServer}/user/playlist/create%3Fuid=${authenticator.userId}%26cookie=${authenticator.cookie}`);
    xhr.send();
    xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        if (data.data.count > 0) {
            data.data.playlist.forEach(playlist => {
                const listitem = document.createElement('mdui-list-item');
                const img = document.createElement('img');
                img.src = playlist.coverImgUrl;
                img.className = 'my_music__listitem_img';
                img.slot = 'icon';
                listitem.appendChild(img);
                listitem.headline = playlist.name;
                listitem.description = `${playlist.trackCount} 单曲`;
                listitem.dataset.pid = playlist.id;
                listitem.onclick = (e) => {
                    menudrawer.close(menuDrawerSelectSonglist);
                    addSongToMySonglist(e.target.dataset.pid, player.getCurrentSong().id);
                };
                addToSonglistList.appendChild(listitem);
            });
        };
    };
};

function addSongToMySonglist(pid, songId) {
    xhr.open('GET', `${apiServer}/playlist/tracks%3Fop=add%26pid=${pid}%26tracks=${songId}%26cookie=${authenticator.cookie}`);
    xhr.send();
    xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        if (data.body.code === 200) {
            mdui.snackbar({ message: '✅ 已添加到歌单！' });
        } else {
            mdui.snackbar({ message: `❌ 添加失败 Code ${data.body.code}: ${data.body.message}` });
        };
    };
};