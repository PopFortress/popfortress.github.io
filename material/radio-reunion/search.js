// contains search page logic

const searchInput = $('.search__input');
const searchLoading = $('.search__loading');
const searchStats = $('.search__result_stats');
const searchList = $('.search__result_list');
const searchTabs = $('.search__tabs');
const stationsLoading = $('.stations__loading');
const stationsList = $('.stations__result_list');

const stationsAPI = 'https://radio5.cn/api/play';

const searchHistoryList = $('.search__history_list');
const searchClearHistory = $('.search__clear_history');
const searchHIstoryDropdown = $('.search__history_dropdown');
// search history
function loadSearchHistory() {
    return JSON.parse(localStorage.rr_search_history || '[]');
};
function setSearchHistory(object) {
    localStorage.rr_search_history = JSON.stringify(object);
};
let search_history = loadSearchHistory();

function loadHistoryList() {
    search_history = loadSearchHistory();
    searchHistoryList.innerHTML = '';
    [...search_history].reverse().forEach(item => {
        const entry = document.createElement('mdui-menu-item');
        entry.icon = 'history';
        entry.innerText = item.kw;
        entry.dataset.type = item.type;
        if (item.type === 'songs') {
            entry.endIcon = 'music_note--outlined';
        } else {
            entry.endIcon = 'radio--outlined';
        };
        entry.onclick = (e) => {
            searchInput.value = item.kw;
            if (e.target.dataset.type === 'songs') {
                searchTabs.value = 'songs';
                searchSongs(1);
            } else {
                searchTabs.value = 'stations';
                searchStations();
            };
        };
        searchHistoryList.appendChild(entry);
    });
    searchHistoryList.appendChild(searchClearHistory);
    if (search_history.length > 0) {
        searchClearHistory.style.display = 'block';
    } else {
        searchClearHistory.style.display = 'none';
    };
    searchInput.focus();
    searchHistoryList.scrollTo(0, 0);
};
searchInput.onfocus = loadHistoryList;

searchClearHistory.onclick = () => {
    localStorage.removeItem('rr_search_history');
    loadHistoryList();
};

searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        if (searchTabs.value === 'songs') {
            searchSongs(1);
        } else {
            searchStations();
        };
        const historyObject = { kw: searchInput.value.trim(), type: searchTabs.value };
        if (!search_history.includes(historyObject)) {
            search_history.push(historyObject);
            setSearchHistory(search_history);
        };
        searchInput.blur();
        searchHIstoryDropdown.open = false;
    };
};

searchInput.oninput = (e) => {
    searchHistoryList.childNodes.forEach(item => {
        if (item.innerText.toLowerCase().includes(searchInput.value.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        };
    });
};

function searchSongs(page) {
    const keywords = searchInput.value.trim();
    if (keywords) {
        searchTabs.style.display = 'flex';
        searchLoading.style.display = 'flex';
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
                    songInfo.url = `${mediaServer}?id=${song.id}`;
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
                        // xhr.open('GET', info.url);
                        // xhr.send();
                        // xhr.onload = () => {
                        //     const data = JSON.parse(xhr.responseText);
                        //     if (data.code === 200) {
                        //         const url = data.data[0].url;
                        //         info.url = url;
                        //     };
                        //     const song = new Song(info);
                        //     playlist.addItem(song);
                        //     player.playSong(playlist.length - 1);
                        //     lyricsDisplayer.loadLyrics(info.id);
                        // };
                        const song = new Song(info);
                        playlist.addItem(song);
                        player.playSong(playlist.length - 1);
                        lyricsDisplayer.loadLyrics(info.id);
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
        stationsLoading.style.display = 'flex';
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
                coverImg.src = station.thumbnail.split('src=\"')[1].split('\"')[0];
                coverImg.slot = 'icon';
                coverImg.className = 'playlist__item_cover';
                const station_info = {};
                station_info.webpage_url = station.url;
                station_info.cover = `https://seep.eu.org/${coverImg.src}`;
                station_info.title = station.title;
                station_info.artist = station.author;
                station_info.album = 'radio5.cn';
                listitem.dataset.station_info = JSON.stringify(station_info);
                listitem.onclick = (e) => {
                    player.switchLoadingState('loading');
                    const info = JSON.parse(e.target.dataset.station_info);
                    xhr.open('GET', `https://seep.eu.org/${info.webpage_url}`);
                    xhr.send();
                    xhr.onload = () => {
                        const postid = xhr.responseText.split('postid-')[1].split(' ')[0];
                        xhr.open('GET', `https://seep.eu.org/${stationsAPI}/play/${postid}?type=post`);
                        xhr.send();
                        xhr.onload = () => {
                            const data = JSON.parse(xhr.responseText);
                            info.url = data.stream_url;
                            const song = new Song(info);
                            playlist.addItem(song);
                            player.playSong(playlist.length - 1);
                        };
                    };
                };
                listitem.appendChild(coverImg);
                stationsList.appendChild(listitem);
            });
            stationsLoading.style.display = 'none';
        };
    };
};

searchTabs.onchange = () => {
    if (searchTabs.value === 'stations') {
        searchStations();
    } else {
        searchSongs(1);
    };
};