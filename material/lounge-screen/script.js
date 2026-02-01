mdui.setColorScheme('#EF9A9A');

const server = 'https://www.12036.com';
const apiServer = 'https://www.12036.com:8095';
const $ = (query) => mdui.$(query)[0];
const xhr = new XMLHttpRequest();
let updateInterval;

xhr.onerror = () => {
    if (xhr.status === 404) {
        mdui.snackbar({ messgae: '无查询信息。'});
    } else {
        mdui.snackbar({ message: '无法连接至服务器。'});
    };
};

const searchInput = $('.search__input');
const headerBackBtn = $('.header__back_btn');
const headerTitle = $('.header__title');
const headerLoading = $('.header__loading');
const featuredStationsList = $('.stations_list__featured');
const stationsCollapse = $('.stations__collapse');
const searchPage = $(`.app_page#search`);
const screenPage = $('.app_page#screen');
const tableTrainsList = $('.table__trains_list');
const basicInfoList = $('.basic__info_list');
const stationsStationList = $('.stations__station_list');

let allCollapseItems;
let currentPage = 'search';
let currentStation;
function switchPage(options) {
    const destination = options.destination;
    const title = options.title;
    $(`.app_page#${currentPage}`).style.display = 'none';
    $(`.app_page#${destination}`).style.display = 'block';
    headerBackBtn.dataset.target = currentPage;
    headerBackBtn.dataset.title = headerTitle.innerText;
    headerBackBtn.onclick = (e) => {
        switchPage({ destination:  e.target.dataset.target, title: e.target.dataset.title });
    };

    currentPage = destination;
    headerTitle.innerText = title;

    if (destination !== 'search') {
        headerBackBtn.style.display = 'block';
    } else {
        headerBackBtn.style.display = 'none';
        clearInterval(updateInterval);
        updateInterval = null;
    };
    if (destination === 'train') {
        headerBackBtn.onclick = () => {
            switchPage({ destination: 'search', title: '选择一个车站' });
        };
    };
};

function loading(status) {
    if (status) {
        headerLoading.style.display = 'block'; 
    } else {
        headerLoading.style.display = 'none';
    };
};

function fetchStations() {
    loading(true);
    xhr.open('GET', `https://seep.eu.org/${server}/static/grouped_stations.json`);
    xhr.send();
    xhr.onload = () => {
        setTimeout(() => {
            const data = JSON.parse(xhr.responseText);
            let stations_lst = [];
            Object.keys(data).forEach((key) => {
                const collapseItem = document.createElement('mdui-collapse-item');
                const listItem = document.createElement('mdui-list-item');
                const collapseListContent = document.createElement('div');
                collapseListContent.className = 'collapse_list__content';
                collapseItem.value = listItem.innerHTML = key;
                listItem.slot = 'header';
                listItem.endIcon = 'keyboard_arrow_down';
                collapseItem.appendChild(listItem);
                Object.keys(data[key]).forEach((station) => {
                    stations_lst.push(station);
                    const stationItem = document.createElement('mdui-list-item');
                    stationItem.innerHTML = station;
                    stationItem.onclick = (e) => {
                        showResultOf(e.target.innerHTML);
                    };
                    collapseListContent.appendChild(stationItem);
                });
                collapseItem.appendChild(collapseListContent);
                stationsCollapse.appendChild(collapseItem);
            }); 
            searchInput.placeholder = `搜索全国 ${stations_lst.length} 个站点`;
            allCollapseItems = stationsCollapse.querySelectorAll('mdui-collapse-item');
            loading(false);
        }, 100);
    };
};

async function fetchFeaturedStation() {
    const res = await fetch('./featured_stations.json');
    const data = await res.json();
    data.forEach(station => {
        const item = document.createElement('mdui-list-item');
        item.innerHTML = station;
        item.onclick = (e) => {
            showResultOf(e.target.innerHTML);
        };
        featuredStationsList.appendChild(item);
    });
};

let currentExpandedType = 'trend';

stationsCollapse.addEventListener('change', (e) => {
    $(`mdui-collapse-item[value=${currentExpandedType ? currentExpandedType : stationsCollapse.value}] mdui-list-item[slot="header"]`).endIcon = stationsCollapse.value ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
    stationsCollapse.querySelectorAll('mdui-collapse-item').forEach(item => {
        if (item.value === e.target.value) {
            item.querySelector('mdui-list-item').endIcon = e.target.value ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
        } else {
            item.querySelector('mdui-list-item').endIcon = 'keyboard_arrow_down';
        };
    });
    currentExpandedType = stationsCollapse.value;
});

function fetchLoungeInfo() {
    loading(true);
};

fetchStations();
fetchFeaturedStation();

function getAllCollapseItems() {
    let item_lst =  stationsCollapse.querySelectorAll('mdui-collapse-item');
    let item_array = [];
    item_lst.forEach(item => {
        item_array.push(item);
    });
    item_array.forEach(item => {
        if (item.style.display === 'none') {
            item_array[item_array.indexOf(item)] = null;
        };
    });
    item_array = item_array.filter((item) => item !== null);
    return item_array;
};

// search feature
searchInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    if (value) {
        allCollapseItems.forEach(item => {
            item.style.display = 'none';
            item.querySelectorAll('.collapse_list__content mdui-list-item').forEach(station => {
                station.style.display = 'none';
                if (station.innerHTML.includes(value)) {
                    item.style.display = 'block';
                    item.children[0].style.display = 'block';
                    station.style.display = 'block';
                };
            });
        });
        if (getAllCollapseItems().length > 0) {
            stationsCollapse.value = getAllCollapseItems()[0].value;
        };
    } else {
        allCollapseItems.forEach(item => {
            item.querySelectorAll('.collapse_list__content mdui-list-item').forEach(station => {
                station.style.display = 'block';
            })
            item.style.display = 'block';
        });
        stationsCollapse.value = currentExpandedType = 'trend';
    };
});

searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        const keywords = searchInput.value.trim();
        if (keywords) {
            stationsCollapse.querySelectorAll('.collapse_list__content mdui-list-item').forEach(station => {
                if (station.innerHTML === keywords) {
                    showResultOf(keywords);
                };
            });
        };
    };
};

function showResultOf(station) {
    currentStation = station;
    if (!updateInterval) {
        switchPage({ destination: 'screen', title: station});
    };
    loading(true);
    xhr.open('GET', `${apiServer}/station/${station}`);
    xhr.send();
    xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        if (data.station) {
            headerTitle.innerText = data.station;
        };
        tableTrainsList.innerHTML = '';
        data.data.forEach(train => {
            const tr = document.createElement('tr');
            train.forEach(item => {
                const th = document.createElement('th');
                const itemIndex = train.indexOf(item);
                let displayText = item;
                if (itemIndex === 3) {
                    displayText = displayText.split(' ')[1].slice(0, 5);
                } else if (itemIndex === 5) {
                    switch (item) {
                        case '正点':
                            th.style.color = '#1976D2';
                            break;
                        case '正在检票':
                            th.style.color = '#009688';
                            break;
                        case '停止检票':
                            th.style.color = '#B71C1C';
                        default:
                            break;
                    };
                    if (item.includes('晚点')) {
                        th.style.color = '#FBC02D';
                    };
                } else if (itemIndex === 0) {
                    const link = document.createElement('a');
                    link.href = 'javascript:;';
                    link.innerText = item;
                    link.dataset.traincode = item;
                    link.className = 'table__train_code';
                    link.onclick = (e) => {
                        showTrainInfoOf(e.target.dataset.traincode);
                    };
                    th.appendChild(link);
                };

                if (itemIndex !== 0) {
                    th.innerText = displayText;
                };
                tr.appendChild(th);
            });
            tableTrainsList.appendChild(tr);
        });
        if (!updateInterval) {
            updateInterval = setInterval(() => {
                showResultOf(station);
            }, 5000);
        };
        loading(false);
    };
};

function showTrainInfoOf(traincode) {
    clearInterval(updateInterval);
    updateInterval = null;
    switchPage({ destination: 'train', title: `车次详情 ${traincode}` });
    
    loading(true);
    xhr.open('GET', `${apiServer}/train/${traincode}`);
    xhr.send();
    xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        basicInfoList.innerHTML = '';
        stationsStationList.innerHTML = '';
        Object.keys(data).forEach(item => {
            if (item !== '停站信息') {
                const listitem = document.createElement('mdui-list-item');
                listitem.innerHTML = `<span class="basic_info__label">${item}:</span> ${data[item]}`;
                listitem.nonclickable = true;
                basicInfoList.appendChild(listitem);
            } else {
                data[item].forEach(station => {
                    const tr = document.createElement('tr');
                    const row = [];
                    row[0] = station['站点'];
                    row[1] = station['到达时间'];
                    row[2] = station['发车时间'];
                    if (data[item].indexOf(station) === 0 ) {
                        row[3] = '始发站';
                    } else if (data[item].indexOf(station) === data[item].length - 1) {
                        row[3] = '终点站';
                    } else {
                        row[3] = station['停留时间'];
                    };
                    row[4] = station.exit;
                    row.forEach(cell => {
                        const th = document.createElement('th');
                        th.innerText = cell;
                        tr.appendChild(th);
                    });
                    stationsStationList.appendChild(tr);
                });
            };
        });
        loading(false);
    };
};