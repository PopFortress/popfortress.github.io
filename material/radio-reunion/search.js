// contains search page logic

const searchInput = $('.search__input');
const searchLoading = $('.search__loading');
const searchStats = $('.search__result_stats');
const searchList = $('.search__result_list');
const searchTabs = $('.search__tabs');
const stationsLoading = $('.stations__loading');
const stationsList = $('.stations__result_list');
const searchTypeFrames = document.querySelectorAll('.search__type_frame');
const songlistsList = $('.songlist__result_list');

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
        switch (item.type) {
            case 'songs':
                entry.endIcon = 'music_note--outlined';
                break;
            case 'stations':
                entry.endIcon = 'radio--outlined';
                break;
            case 'songlists':
                entry.endIcon = 'playlist_play--outlined';
                break;
            default:
                break;
        };
        entry.onclick = (e) => {
            searchInput.value = item.kw;
            switch (e.target.dataset.type) {
                case 'songs':
                    searchTabs.value = 'songs';
                    break;
                case 'stations':
                    searchTabs.value = 'stations';
                    break;
                case 'songlists':
                    searchTabs.value = 'songlists';
                    break;
                default:
                    break;
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
        switch (searchTabs.value) {
            case 'songs':
                searchSongs(1);
                break;
            case 'stations':
                searchStations();
                break;
            case 'songlists':
                searchSonglists();
                break;
            default:
                break;
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
        hideAllTypeFrames();
        searchTabs.style.display = 'flex';
        searchLoading.style.display = 'flex';
        searchList.innerHTML = '';
        xhr.open('GET', `${apiServer}/cloudsearch%3Fkeywords=${keywords}&limit=20&offset=${(page - 1) * 20}`);
        xhr.send();
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            let songInfo = {};
            if (data.code === 200) {
                songsCount = data.result.songCount;
                data.result.songs.forEach(song => {
                    appendSongItem(song, searchList);
                });
            searchLoading.style.display = 'none';
            };
        };
    };
};

function searchStations() {
    const keywords = searchInput.value.trim();
    if (keywords) {
        hideAllTypeFrames();
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

function searchSonglists() {
    const keywords = searchInput.value.trim();
    if (keywords) {
        hideAllTypeFrames();
        songlistsList.innerHTML = '';
        xhr.open('GET', `${apiServer}/cloudsearch?keywords=${keywords}&type=1000`);
        xhr.send();
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            data.result.playlists.forEach(songlist => {
                const listitem = document.createElement('mdui-list-item');
                listitem.headline = songlist.name;
                listitem.description = songlist.creator.nickname;
                const coverImg = document.createElement('img');
                coverImg.src = songlist.coverImgUrl;
                coverImg.slot = 'icon';
                coverImg.className = 'playlist__item_cover';
                listitem.dataset.id = songlist.id;
                listitem.onclick = (e) => {
                    switchPage('playlist_details');
                    loadPlaylistDetails(e.target.dataset.id);
                };
                listitem.appendChild(coverImg);
                songlistsList.appendChild(listitem);
            });
        };
    };
}

searchTabs.onchange = () => {
    switch (searchTabs.value) {
        case 'songs':
            searchSongs(1);
            break;
        case 'stations':
            searchStations();
            break;
        case 'songlists':
            searchSonglists();
            break;
        default:
            break;
    };
};

function hideAllTypeFrames() {
    searchTypeFrames.forEach(frame => {
        frame.style.display = 'none';
    });
};