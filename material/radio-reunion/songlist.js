const songlistEles = {
    cover: $('.songlist__detail_cover'),
    title: $('.songlist__detail_title'),
    author: $('.songlist__detail_author'),
    description: $('.songlist__detail_description'),
    tracksList: $('.songlist__tracks_list'),
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