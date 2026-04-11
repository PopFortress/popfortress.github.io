// contains logic handling user specialized contents (requires authentication)

const fmStart = $('.personal_fm__start');
const fmSkipBtn = $('.personal_fm__skip');
const fmStop = $('.personal_fm__stop');

function playPersonalFM() {
    if (authenticator.isLoggedIn) {
        requestAPI('/personal_fm').onload = () => {
            const data = JSON.parse(xhr.responseText);
            const songInfoList = [];
            data.data.forEach(song => {
                const songInfo = {};
                songInfo.id = song.id;
                songInfo.title = song.name;
                const artists = [];
                song.artists.forEach(artist => {
                    artists.push(artist.name);  
                });
                songInfo.artist = artists.join(', ');
                songInfo.cover = song.album.picUrl;
                songInfo.album = song.name;
                songInfo.mvid = song.mvid;
                songInfoList.push(songInfo);
            });
            playlist.fmPlaylist = songInfoList;
            playlist.fmIndex = 0;
            player.isPlayingFM = true;
            player.playNcmSong(songInfoList[0]);
        };
    } else {
        switchPage('auth');
    };
};

function fmPlayNext() {
    playlist.fmIndex++;
    if (playlist.fmIndex < playlist.fmPlaylist.length) {
        player.playNcmSong(playlist.fmPlaylist[playlist.fmIndex]);
    } else {
        playPersonalFM();
    };
    checkMVAvailability();
};

fmStart.onclick = () => {
    fmStart.style.display = 'none';
    fmSkipBtn.style.display = fmStop.style.display = 'inline-block';
    playPersonalFM();
};

fmSkipBtn.onclick = () => { fmPlayNext(); };
fmStop.onclick = () => {
    player.isPlayingFM = false;
    playlist.clearItems();
    player.resetPlayer();
    fmStart.style.display = 'inline-block';
    fmSkipBtn.style.display = fmStop.style.display = 'none';
};