// contains search page logic

const searchInput = $('.search__input');
const searchLoading = $('.search__loading');
const searchStats = $('.search__result_stats');
const searchList = $('.search__result_list');
const searchTabs = $('.search__tabs');
const stationsLoading = $('.stations__loading');
const stationsList = $('.stations__result_list');

const stationsAPI = 'https://seep.eu.org/https://radio5.cn/api/play';

searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        searchSongs(1);
    };
};

function searchSongs(page) {
    const keywords = searchInput.value.trim();
    if (keywords) {
        searchTabs.style.display = 'flex';
        searchLoading.style.display = 'block';
        searchList.innerHTML = '';
        xhr.open('GET', `${apiServer}/cloudsearch?keywords=${keywords}&limit=20&offset=${(page - 1) * 20}`);
        xhr.send();
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            let songInfo = {};
            if (data.code === 200) {
                songsCount = data.result.songCount;
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
                        xhr.open('GET', info.url);
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
                    searchList.appendChild(listitem);
                });
            searchLoading.style.display = 'none';
            };
        };
    };
};

function searchStations() {
    const keywords = searchInput.value.trim();
    if (keywords) {
        stationsLoading.style.display = 'block';
        stationsList.innerHTML = '';
        xhr.open('GET', `${stationsAPI}/search?search=${keywords}`);
        xhr.send();
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            data.forEach(station => {
                const listitem = document.createElement('mdui-list-item');
                listitem.headline = station.title;
                listitem.description = station.author;
                const coverImg = document.createElement('img');
                coverImg.outerHTML = station.thumbnail;
                coverImg.slot = 'icon';
                listitem.appendChild(coverImg);
                stationsList.appendChild(listitem);
            });
        };
    };
};

// searchTabs.onchange = () => {
//     if (searchTabs.value = 'stations') {
//         searchStations();
//     };
// };