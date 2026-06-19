const songlistEles = {
    cover: $('.songlist__detail_cover'),
    title: $('.songlist__detail_title'),
    author: $('.songlist__detail_author'),
    description: $('.songlist__detail_description'),
    tracksList: $('.songlist__tracks_list'),
    playAllBtn: $('.songlist__play_all_btn'),
};

function loadPlaylistDetails(id) {
    xhr.open('GET', `${apiServer}/playlist/detail%3Fid=${id}`);
    xhr.send();
    xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        songlistEles.cover.src = data.playlist.coverImgUrl;
        songlistEles.title.innerText = data.playlist.name;
        songlistEles.author.innerText = `创建者：${data.playlist.creator.nickname}　共 ${data.playlist.trackCount} 首歌`;
        songlistEles.description.innerText = data.playlist.description;
        songlistEles.tracksList.innerHTML = '';

        data.playlist.tracks.forEach((track) => {
            appendSongItem(track, songlistEles.tracksList);
        });
    };
};

songlistEles.playAllBtn.onclick = () => {
    playlist.clearItems();
    const tracks = JSON.parse(xhr.responseText).playlist.tracks;
    tracks.forEach((track) => {
        let artists = [];
        track.ar.forEach(artist => {
            artists.push(artist.name);
        });
        playlist.addItem(new Song({
            title: track.name,
            artist: artists.join(', '),
            cover: track.al.picUrl,
            album: track.al.name,
            id: track.id,
            mvid: track.mv,
            url: `${apiServer}/song/url/v1/302%3Fid=${track.id}%26level=exhigh%26unblcok=true%26cookie=${authenticator.cookie}`,
        }));
    });
    lyricsDisplayer.loadLyrics(player.getCurrentSong().id);
    player.switchLoadingState('loaded');
    player.playSong(0);
};