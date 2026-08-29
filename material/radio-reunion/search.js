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

// multi-select mode
const searchSelectBtn = $('.search__select_btn');
const searchSelectBar = $('.search__select_bar');
const searchSelectAllBtn = $('.search__select_all_btn');
const searchSelectCount = $('.search__select_count');
const searchSelectAddBtn = $('.search__select_add_btn');
let selectMode = false;
let suppressTabSearch = false;

function enterSelectMode() {
    selectMode = true;
    if (searchTabs.value !== 'songs') {
        suppressTabSearch = true;
        searchTabs.value = 'songs';
    };
    $('#app_page__search').classList.add('selecting');
    searchSelectBar.classList.add('show');
    searchSelectBar.style.bottom = player.hidden ? '16px' : '116px';
    searchSelectBtn.selected = true;
    updateSelectCount();
};

function exitSelectMode() {
    selectMode = false;
    $('#app_page__search').classList.remove('selecting');
    searchSelectBar.classList.remove('show');
    searchSelectBtn.selected = false;
    searchList.querySelectorAll('.search__select_checkbox').forEach(cb => {
        cb.checked = false;
    });
    updateSelectCount();
};

function toggleSelectSong(checkBox) {
    checkBox.checked = !checkBox.checked;
    updateSelectCount();
};

function updateSelectCount() {
    const checkboxes = searchList.querySelectorAll('.search__select_checkbox');
    let count = 0;
    checkboxes.forEach(cb => {
        if (cb.checked) {
            count++;
        };
    });
    searchSelectCount.innerText = `已选 ${count} 首`;
    searchSelectAddBtn.disabled = count === 0;
    searchSelectAllBtn.innerText = checkboxes.length > 0 && count === checkboxes.length ? '取消全选' : '全选';
};

searchSelectBtn.onclick = () => {
    if (selectMode) {
        exitSelectMode();
    } else {
        enterSelectMode();
    };
};

searchSelectAllBtn.onclick = () => {
    const checkboxes = searchList.querySelectorAll('.search__select_checkbox');
    const allSelected = [...checkboxes].every(cb => cb.checked);
    checkboxes.forEach(cb => {
        cb.checked = !allSelected;
    });
    updateSelectCount();
};

searchSelectAddBtn.onclick = () => {
    const wasEmpty = playlist.getRealLength() === 0;
    let added = 0;
    let firstSong = null;
    searchList.querySelectorAll('mdui-list-item').forEach(item => {
        const cb = item.querySelector('.search__select_checkbox');
        if (cb && cb.checked && item.dataset.song_info) {
            const info = JSON.parse(item.dataset.song_info);
            const song = new Song({
                title: info.title,
                artist: info.artist,
                album: info.album,
                cover: info.cover,
                id: info.id,
                mvid: info.mvid,
                url: `${apiServer}/song/url/v1/302%3Fid=${info.id}%26level=exhigh%26unblcok=true%26cookie=${authenticator.cookie}`,
            });
            playlist.addItem(song);
            if (!firstSong) {
                firstSong = song;
            };
            added++;
        };
    });
    if (added > 0) {
        if (wasEmpty && firstSong) {
            player.playSong(firstSong.index);
            lyricsDisplayer.loadLyrics(firstSong.id);
        };
        mdui.snackbar({ message: `已将 ${added} 首歌曲添加到播放列表。` });
        exitSelectMode();
    } else {
        mdui.snackbar({ message: '请先选择要添加的歌曲。' });
    };
};
// search history
function loadSearchHistory() {
    return JSON.parse(localStorage.rr_search_history || '[]');
};
function setSearchHistory(object) {
    localStorage.rr_search_history = JSON.stringify(object);
};
let search_history = loadSearchHistory();
let songsCount = 0;
const noResultsText = $('.search__no_results');

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
            if (searchTabs.value !== e.target.dataset.type) {
                searchTabs.value = e.target.dataset.type;
            };
            switch (e.target.dataset.type) {
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
                if (songsCount > 0) {
                    data.result.songs.forEach(song => {
                        appendSongItem(song, searchList, true);
                    });
                } else {
                    noResultsText.style.display = 'block';
                };
                searchLoading.style.display = 'none';
                updateSelectCount();
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

searchTabs.onchange = (e) => {
    // ignore 'change' events bubbled up from child components (e.g. mdui-checkbox)
    if (e.target !== searchTabs) {
        return;
    };
    if (searchTabs.value !== 'songs') {
        exitSelectMode();
    };
    if (suppressTabSearch) {
        suppressTabSearch = false;
        return;
    };
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
    noResultsText.style.display = 'none';
    searchTypeFrames.forEach(frame => {
        frame.style.display = 'none';
    });
};