const $ = (query) => mdui.$(query)[0];
const lyricsInput = $('.input');
const apiSelect = $('.api-select');
const lyricsBtn = $('.find-lyrics-btn');
const lyricsResult = $('.result-text');
const searchInput = $('.search-input');
const searchBtn = $('.search-btn');
const searchResultList = $('.search-result-list');
const songCountText = $('.count');
const prePageBtn = $('.pre-page');
const nextPageBtn = $('.next-page');
const pageControls = $('.page-controls');
const showPlayerBtn = $('.show-player');
const player = $('.player');
var respnse;
var data;
var songsList;
var songInfo;
var songsCount;
var pageIndex;
var apiURL;
var apiInfo;
var id;
var showPlayer = false;
var playerURL;
var playerCached = false;

searchBtn.onclick = () => {
    if (searchInput.value) {
        searchSongs(1);
        pageIndex = 1;
        updatePageControls();
    };
};

async function searchSongs(page) {
    searchBtn.loading = true;
    searchBtn.disabled = true;
    response = await fetch(`https://apis.netstart.cn/music/search?keywords=${searchInput.value}&limit=10&offset=${(page - 1) * 10}`);
    data = await response.json();
    if (data.code === 200) {
        songsCount = data.result.songCount;
        songsList = [];
        data.result.songs.forEach(song => {
            songInfo = [];
            songInfo.push(song.name);
            songInfo.push(song.artists[0].name);
            songInfo.push(song.id);
            songsList.push(songInfo);
        });
        searchResultList.innerHTML = '';
        songsList.forEach(song => {
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            const td3 = document.createElement('td');
            td1.innerText = song[0];
            td2.innerText = song[1];
            td3.innerText = song[2];
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            searchResultList.appendChild(tr);
        });
        searchBtn.loading = false;
        searchBtn.disabled = false;
        songCountText.textContent = `获取到 ${songsCount} 首歌曲，${Math.ceil(songsCount / 10)} 页中的第 ${page} 页`;
        pageControls.style.display = 'flex';
    } else {
        mdui.snackbar({message: '无效的关键字'});
    };
};

nextPageBtn.onclick = async () => {
    pageIndex++;
    updatePageControls();
    searchSongs(pageIndex);
};

prePageBtn.onclick = async () => {
    pageIndex--;
    updatePageControls();
    searchSongs(pageIndex);
};

function updatePageControls() {
    if (pageIndex < 2) {
        prePageBtn.disabled = true;
    } else {
        prePageBtn.disabled = false;
    };
    if (pageIndex * 10 > songsCount) {
        nextPageBtn.disabled = true;
    } else {
        nextPageBtn.disabled = false;
    };
};

function parseID(value) {
    if (value.match('https://music.163.com/#/song') && value.includes('?id=')){
        return value.split('id=').pop();
    } else if (Number.isInteger(parseInt(value))) {
        return value;
    };
};

lyricsBtn.onclick = async () => {
    if (lyricsInput.value) {
        id = parseID(lyricsInput.value);
        if (id) {
            lyricsBtn.loading = true;
            lyricsBtn.disabled = true;
            if (apiSelect.value) {
                apiInfo = $(`mdui-menu-item[value="${apiSelect.value}"`).dataset;
            } else {
                apiInfo = $(`mdui-menu-item[value="api-1"]`).dataset;
            };
            apiURL = apiInfo.url;
            respnse = await fetch(`${apiURL}${id}`);
            data = await respnse.json();
            if (apiInfo.cors === 'true') {
                lyricsResult.value = eval(`JSON.parse(data.contents).${apiInfo.lrcPath}`)
            } else {
                lyricsResult.value = eval(apiInfo.lrcPath);
            };
            lyricsBtn.loading = false;
            lyricsBtn.disabled = false;
            playerCached = false;
        } else {
            mdui.snackbar({message: '无效输入'});
        };
    };
};

showPlayerBtn.onclick = async (e) => {
    if (showPlayer) {
        showPlayer = false;
        player.style.display = 'none';
        e.target.textContent = '显示播放控件';
        e.target.icon = 'play_arrow';
    } else {
        showPlayer = true;
        player.style.display = 'block';
        e.target.textContent = '隐藏播放控件';
        e.target.removeAttribute('icon');

        if (!playerCached && id) {
            player.removeAttribute('src');
            response = await fetch(`https://apis.netstart.cn/music/song/download/url?id=${id}`);
            data = await response.json();
            if (data.data.url) {
                playerURL = data.data.url;
                player.src = playerURL;
                player.play();
                playerCached = true;
            } else {
                response = await fetch(`https://apis.netstart.cn/music/check/music?id=${id}`);
                data = await response.json();
                if (data.success) {
                    mdui.snackbar({message: '因为未知原因，无法播放。'});
                } else {
                    mdui.snackbar({message: data.message});
                };
            };
        };
    };
};