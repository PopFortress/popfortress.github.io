const searchInput = $('.search__input');
const searchLoading = $('.search__loading');
const searchStats = $('.search__result_stats');
const searchList = $('.search__result_list');

searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        searchSongs(1);
    };
};

function searchSongs(page) {
    const keywords = searchInput.value.trim();
    if (keywords) {
        searchLoading.style.display = 'block';
        xhr.open('GET', `${apiServer}/cloudsearch?keywords=${keywords}&limit=20&offset=${(page - 1) * 20}`);
        xhr.send();
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            let songInfo = {};
            if (data.code === 200) {
                songsCount = data.result.songCount;
                searchList.innerHTML = '';
                data.result.songs.forEach(song => {
                    songInfo = {};
                    songInfo.title = song.name;
                    songInfo.url = `${apiServer}/song/url?id=${song.id}`;
                    let artists = [];
                    song.ar.forEach(artist => {
                        artists.push(artist.name);  
                    });
                    songInfo.artist = artists.join(', ');
                    songInfo.album = song.al.name;
                    songInfo.cover = song.al.picUrl;
                    
                    const listitem = document.createElement('mdui-list-item');
                    const coverImg = document.createElement('img');
                    coverImg.src = songInfo.cover;
                    coverImg.slot = 'icon';
                    coverImg.className = 'playlist__item_cover';
                    listitem.headline = songInfo.title;
                    listitem.description = songInfo.album ? `${songInfo.artist} - 《${songInfo.album}》` : `${songInfo.artist}`;
                    listitem.appendChild(coverImg);
                    listitem.dataset.song_info = JSON.stringify(songInfo);
                    listitem.onclick = (e) => {
                        playerLoading.style.display = 'block';
                        playerCover.style.display = 'none';
                        const info = JSON.parse(e.target.dataset.song_info);
                        xhr.open('GET', info.url);
                        xhr.send();
                        xhr.onload = () => {
                            const data = JSON.parse(xhr.responseText);
                            if (data.code === 200) {
                                const url = data.data[0].url;
                                info.url = url;
                            };
                            playlist.addItem(info);
                            player.playSong(playlist.length - 1);
                        };
                    };
                    searchList.appendChild(listitem);
                });
            searchLoading.style.display = 'none';
            };
        };
    };
};