import createRequestWithTimeout from "/static/lib-request-with-timeout.mjs";

const $ = (query) =>  mdui.$(query)[0];
const date = new Date();
const request = createRequestWithTimeout(10000);

const body = $('body');
const app = $('.app');
const cards = document.querySelectorAll('.app mdui-card');
const headline = $('.headline');
const hitokoto = $('.hitokoto');
const dateHeader = $('.date-header');
const hrText = $('.hr');
const minText = $('.min');
const dateText = $('.date');
const container = $('.app');
const cardWidth = 340;
const weatherCard = $('.weather .content');
const highestText = $('.highest-text');
const lowestText = $('.lowest-text');
const avgText = $('.average-text');
const city = $('.city');
const wind = $('.wind');
const airQuality = $('.air-quality .text');
const zhihuDaily = $('.zhihu-daily .content');
const zhihuDailyList = $('.zhihu-daily .zhihu-daily-list');
const historyCard = $('.history .content');
const historyTitle = $('.history .title');
const englishDate = $('.english .date');
const englishChinese = $('.english .chinese');
const englishOriginal = $('.english .original');
const englishCard = $('.english .content');
const englishImg = $('.english .img');
const oneminCard = $('.om .content');
const oneminDate = $('.om .date');
const oneminNewsList = $('.om .news-list');
const oneminDetailsLink = $('.om .details');
const oneminSayings = $('.om .sayings');
const currencyCard = $('.currency .content');
const currencyList = $('.currency-list');
const currencyLastUpdate = $('.currency .update-time');
const bilibiliList = $('.bilibili-list');
const zhihuList = $('.zhihu-list');
const maoyanList = $('.maoyan-list');
const maoyanLastUpdate = $('.maoyan .update-time');
const epicList = $('.epic-list');
const answerText = $('.answer-text');
const answerZh = $('.answer .zh');
const answerEn = $('.answer .en');
const newAnswer = $('.new-answer');
const bingImg = $('.wallpaper .img');
const bingTitle = $('.wallpaper .img-title');
const bingDesc = $('.wallpaper .desc');
const bingQuiz = $('.wallpaper .quiz');
const bingMore = $('.wallpaper .more');
const horoInput = $('.horoscope-input');
const horoYiJi = $('.yi-ji');
const horoLuckIndex = $('.luck-index');
const horoShort = $('.horoscope .short');
const horoSummary = $('.horoscope .summary');
const horoLuckThings = $('.luck-things');
const horoContent = $('.horoscope .content');
const cityInput = $('.city-input');
const weatherContent = $('.weather-content');
const provinceInput = $('.province-input');
const emptyAlarmsLabel = $('.empty-alarms-label');
const alarmsList = $('.alarms-list');
const alarmContent = $('.alarm-content');
const regionInput = $('.region-input');
let lunarDate = '';

const preferDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (preferDarkMode) {
    body.style.backdropFilter = 'blur(4px) brightness(0.5)';
};

let cardContentHTMLs = {};
let contentHTML;
let img_currency;

if (!localStorage.life_daily_preferences) {
    localStorage.life_daily_preferences = JSON.stringify({});
} else {
    const settings = JSON.parse(localStorage.life_daily_preferences);
    if (settings.city) {
        cityInput.value = settings.city;
    };
    if (settings.horoscope) {
        horoInput.value = settings.horoscope;
    };
    if (settings.province) {
        provinceInput.value = settings.province;
    };
    if (settings.region) {
        regionInput.value = settings.region;
    };
};

const apis = {
    lunarCalendar: 'https://www.36jxs.com/api/Commonweal/almanac?sun=',
    weather: 'https://v2.xxapi.cn/api/weather?city={city}',
    zhihuDaily: 'https://api.allorigins.win/get?url=https://coco.codemao.cn/http-widget-proxy/https://news-at.zhihu.com/api/4/news/latest',
    history: 'https://seep.eu.org/https://query.asilu.com/today/list/',
    english: 'https://api.vvhan.com/api/dailyEnglish',
    oneMin: 'https://60s-api-cf.viki.moe/v2/60s',
    hitokoto: 'https://v1.hitokoto.cn/?c=i&c=d&c=k&encode=json',
    currency: 'https://60s-api-cf.viki.moe/v2/exchange_rate',
    stock: 'https://hq.stock.sohu.com/zs/006/zs_399006-1.html',
    bilibili: 'https://api.vvhan.com/api/hotlist/bili',
    zhihu: 'https://api.vvhan.com/api/hotlist/zhihuHot',
    maoyan: 'https://seep.eu.org/https://api.52vmy.cn/api/wl/top/movie',
    epic: 'https://60s-api-cf.viki.moe/v2/epic',
    answer: 'https://60s-api-cf.viki.moe/v2/answer',
    bing: 'https://bing.shangzhenyang.com/api/json',
    horoscopes: 'https://v2.xxapi.cn/api/horoscope?type={type}&time=today',
    alarms: 'https://app.gjzwfw.gov.cn/fwmhapp/qixiang/interfaces/findWarnCapByElement.do',
};

const enMonth = {1: 'January.', 2: 'February.', 3: 'March.', 4: 'April.', 5: 'May.', 6: 'June.', 7: 'July.', 8: 'August.', 9: 'September.', 10: 'October.', 11: 'November.', 12: 'December.'};
const currencyNamesList = ['USD','EUR','GBP','JPY','HKD','MOP','TWD', 'KRW', 'AUD', 'CAD'];
const horoscopes = {'白羊座': 'aries', '金牛座': 'taurus', '双子座': 'gemini', '巨蟹座': 'cancer', '狮子座': 'leo', '处女座': 'virgo', '天秤座': 'libra', '天蝎座': 'scorpio', '射手座': 'sagittarius', '摩羯座': 'capricorn', '水瓶座': 'aquarius', '双鱼座': 'pisces'};
const areaCodes = {"北京市": "110000","天津市": "120000","河北省": "130000","山西省": "140000","内蒙古自治区": "150000","辽宁省": "210000","吉林省": "220000","黑龙江省": "230000","上海市": "310000","江苏省": "320000","浙江省": "330000","安徽省": "340000","福建省": "350000","江西省": "360000","山东省": "370000","河南省": "410000","湖北省": "420000","湖南省": "430000","广东省": "440000","广西壮族自治区": "450000","海南省": "460000","重庆市": "500000","四川省": "510000","贵州省": "520000","云南省": "530000","西藏自治区": "540000","陕西省": "610000","甘肃省": "620000","青海省": "630000","宁夏回族自治区": "640000","新疆维吾尔自治区": "650000","新疆生产建设兵团": "660000"};


function updateLocalStorage(key, input) {
    const settings = JSON.parse(localStorage.life_daily_preferences);
    settings[key] = input.value;
    localStorage.life_daily_preferences = JSON.stringify(settings);
};
/**
 * 
 * @param {*} options {url, callback, errorCallback}
 */
function requestAPI(options) {
    request(options.url)
    .then (response => response.json())
    .then (data => {
        options.callback(data);
        // setPositions();
    })
    .catch(error => {
        console.error(`Failed to fetch ${options.url}: ${error}`);
        options.errorCallback(error);
    });
};

function getTimeSayings() {
    const currentHour = date.getHours();
    if (currentHour < 4) {
        return {greets: '已经这么晚了，该睡觉了~', sayings: '夜深人静~'};
    } else if (currentHour < 8) {
        return {greets: '早上好~ 美好的一天开始啦！', sayings: '早安，世界。'};
    } else if (currentHour < 11) {
        return {greets: '上午好~ 感觉活力满满~', sayings: '早安，世界。'};
    } else if (currentHour < 13) {
        return {greets: '中午好~ 吃午饭了吗？', sayings: '午安，世界。'};
    } else if (currentHour < 17) {
        return {greets: '下午好~ 来杯咖啡吧~', sayings: '阳光灿烂~'};
    } else if (currentHour < 19) {
        return {greets: '夕阳西下，该吃晚餐了~', sayings: '华灯初上~'};
    } else if (currentHour < 22) {
        return {greets: '晚上好~ 放松一下吧~', sayings: '晚安，世界。'};
    } else {
        return {greets: '夜深了~ 记得早点休息~', sayings: '做个好梦~'};
    };
};

headline.textContent = getTimeSayings().greets;

async function fetchHitokoto() {
    const response = await fetch(apis.hitokoto);
    const data = await response.json();
    if (data.from_who) {
        hitokoto.textContent = `${data.hitokoto} —— ${data.from_who}`;
    } else {
        hitokoto.textContent = data.hitokoto;
    };
};

function setPositions() {
    var info = cal();
    var nextTops = new Array(info.columns);
    nextTops = nextTops.fill(0);

    for (var i = 0; i < container.children.length; i++)
    {
        var card = container.children[i];
        var minTop = Math.min.apply(null, nextTops);
        card.style.top = minTop + 'px';
        var index = nextTops.indexOf(minTop);
        nextTops[index] += card.clientHeight + info.space;
        var left = (index + 1) * info.space + index * cardWidth;
        
        card.style.left = left + 'px';
    };
    var max = Math.max.apply(null, nextTops);
    container.style.height = max + 'px';
    if (window.innerWidth < 368) {
        cards.forEach(card => {
            card.style.cssText = 'left: 0 !important;';
        });
    };
};

window.onload = setPositions;
setTimeout(setPositions, 5000);

function cal() {
    var containerWidth = container.clientWidth;
    var columns = Math.floor(containerWidth / cardWidth);
    var spaceNumber = columns + 1;
    var leftSpace = containerWidth - columns * cardWidth;
    var space = leftSpace / spaceNumber;
    return {
        space: space,
        columns: columns,
    };
};

var timerId = null;
window.onresize = function () {
    if (timerId) {
        clearTimeout(timerId);
    };
    timerId = setTimeout(setPositions, 300);
};

function leftFillNum(num, targetLength) {
    return num.toString().padStart(targetLength, "0");
};

function updateDatetime() {
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('zh-CN', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}　${lunarDate}`;
    const timeSaying = getTimeSayings().sayings;
    dateHeader.textContent = timeSaying;
    const hr = leftFillNum(now.getHours(), 2);
    const min = leftFillNum(now.getMinutes(), 2);

    hrText.textContent = hr;
    minText.textContent = min;
    dateText.textContent = dateStr;
}

updateDatetime();
setInterval(updateDatetime, 1000);



/**
 * 
 * @param {*} options {cardContent, error, func}
 */
function apiFailureHandler(options) {
    options.cardContent.parentNode.clickable = false;
    contentHTML = options.cardContent.innerHTML;
    cardContentHTMLs.card = contentHTML;
    options.cardContent.innerHTML = 
    `<div class="error-frame">\
        <mdui-button class="retry-btn" icon="refresh" variant="tonal">重试</mdui-button>\
        <div>API Failure: ${options.error.message}</div>\
    </div>`
    $('.retry-btn').onclick = options.func;
};

function fetchLunarCalendar() {
    requestAPI({
        url: `${apis.lunarCalendar}${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        callback: (data) => {
            lunarDate = `农历${data.data.LMonth}${data.data.LDay}`;
        },
        errorCallback: (error) =>{
            lunarDate = '';
        },
    });
};

function fetchWeather() {
    weatherContent.style.opacity = .3;
    requestAPI({
        url: apis.weather.replace('{city}', cityInput.value),
        callback: (data) => {
            weatherContent.style.opacity = 1;
            if (cardContentHTMLs.weather) {
                weatherCard.innerHTML = cardContentHTMLs.weather;
                weatherCard.parentNode.clickable = true;
            };
            const today = data.data.data[1];
            const weatherHighest = today.temperature.split('-')[0];
            const weatherLowest = today.temperature.split('-')[1].split('℃')[0];
            const weatherAvg = ((+weatherHighest) + (+weatherLowest)) / 2;
            highestText.textContent = weatherHighest + '℃';
            lowestText.textContent = weatherLowest + '℃';
            avgText.textContent = weatherAvg + '℃';
            city.textContent = data.data.city;
            wind.textContent = `${today.weather}　${today.wind}`;
            airQuality.innerHTML = `空气质量　${today.air_quality}`;
        },
        errorCallback: (error) => {
            apiFailureHandler({
                cardContent: weatherCard,
                error: error,
                func: fetchWeather,
            });
        },
    });
};

cityInput.onchange = () => {
    if (cityInput.value.trim()) {
        updateLocalStorage('city', cityInput);
        fetchWeather();
    };
};

function fetchZhihuDaily() {
    requestAPI({
        url: apis.zhihuDaily,
        callback: (data) => {
            if (cardContentHTMLs.zhihuDaily) {
                zhihuDaily.innerHTML = cardContentHTMLs.zhihuDaily;
                zhihuDaily.parentNode.clickable = true;
            };
            zhihuDailyList.innerHTML += '<mdui-list-subheader>今日精选</mdui-list-subheader>';
            JSON.parse(data.contents).top_stories.forEach(story => {
                zhihuDailyList.innerHTML += `<mdui-list-item href=${story.url} target="_blank">${story.title}\
                    <img slot="end-icon" src=${story.image}>\
                </mdui-list-item>`;
            });
            zhihuDailyList.innerHTML += '<mdui-list-subheader>故事</mdui-list-subheader>';
            JSON.parse(data.contents).stories.forEach(story => {
                zhihuDailyList.innerHTML += `<mdui-list-item href=${story.url} target="_blank">${story.title}\
                    <img slot="end-icon" src=${story.images[0]}>\
                </mdui-list-item>`;
            });
            zhihuDaily.innerHTML += '<a href="https://daily.zhihu.com/" target="_blank">查看更多内容</a>';
        },
        errorCallback: (error) => {
            apiFailureHandler({
                cardContent: zhihuDaily,
                error: error,
                func: fetchZhihuDaily,
            });
        }
    });
};

function fetchHistory() {
    requestAPI({
        url: apis.history,
        callback: (data) => {
            if (cardContentHTMLs.history) {
                historyCard.innerHTML = cardContentHTMLs.history;
                historyCard.parentNode.clickable = true;
            };
            historyTitle.textContent += `　${data.month}月${data.day}日`;
            data.data.forEach(item => {
                historyCard.innerHTML += `<a href=${item.link} target="_blank">${item.year}　${item.title}</a>`;
            });
        },
        errorCallback: (error) => {
            apiFailureHandler({
                cardContent: historyCard,
                error: error,
                func: fetchHistory,
            });
        },
    });
};

function fetchEnglish() {
    requestAPI({
        url: apis.english,
        callback: (data) => {
            if (cardContentHTMLs.english) {
                englishCard.innerHTML = cardContentHTMLs.english;
                englishCard.parentNode.clickable = true;
            };
            englishDate.textContent = `${enMonth[date.getMonth()+1]} ${date.getDate()}`;
            englishChinese.textContent = data.data.zh;
            englishOriginal.textContent = data.data.en;
            englishImg.src = data.data.pic;
        },
        errorCallback: (error) => {
            apiFailureHandler({
                cardContent: englishCard,
                error: error,
                func: fetchEnglish,
            });
        },
    });
};

function fetchOneMin() {
    requestAPI({
        url: apis.oneMin,
        callback: (data) => {
            if (cardContentHTMLs.oneMin) {
                oneminCard.innerHTML = cardContentHTMLs.oneMin;
                oneminCard.parentNode.clickable = true;
            };
            oneminDate.textContent = `农历　${data.data.lunar_date}`;
            data.data.news.forEach(news => {
                oneminNewsList.innerHTML += `<mdui-list-item href="//cn.bing.com/search?q=${news}" target="_blank" icon="keyboard_arrow_right">${news}</mdui-list-item>`;
            });
            oneminDetailsLink.href = data.data.link;
            oneminSayings.textContent = `【微语】${data.data.tip}`;
            if (lunarDate === '') {
                lunarDate = data.data.lunar_date;
            };
        },
        errorCallback: (error) => {
            apiFailureHandler({
                cardContent: oneminCard,
                error: error,
                func: fetchOneMin,
            });
        },
    });
};

function fetchCurrency() {
    requestAPI({
        url: apis.currency,
        callback: (data) => {
            currencyLastUpdate.textContent = `更新时间：${data.data.updated}`;
            data.data.rates.forEach(rate => {
                if (currencyNamesList.includes(rate.currency)) {
                    if (rate.currency === 'TWD') {
                        img_currency = 'CNY';
                    } else {
                        img_currency = rate.currency;
                    };
                    currencyList.innerHTML += `<mdui-list-item nonclickable>${rate.rate} ${rate.currency}\
                    <img slot="icon" src="https://coinyep.com/img/png/${img_currency}.png">
                    </mdui-list-item>`;
                };
            });
        },
        errorCallback: (error) => {
            apiFailureHandler({
                cardContent: currencyCard,
                error: error,
                func: fetchCurrency,
            });
        },
    });
};

/**
 * 
 * @param {*} options {url, list}
 */
function fetchHot(options) {
    requestAPI({
        url: options.url,
        callback: (data) => {
            data.data.forEach(item => {
                options.list.innerHTML += `<mdui-list-item href=${item.url} target="_blank">${item.title}\
                <div slot="end-icon">${item.hot}</div>\
                </mdui-list-item>`;
            });
        },
    });
};

function fetchHots() {
    fetchHot({url: apis.bilibili, list: bilibiliList});
    fetchHot({url: apis.zhihu, list: zhihuList});
};

function fetchMaoyan() {
    requestAPI({
        url: apis.maoyan,
        callback: (data) => {
            let rankIndex = 1;
            maoyanLastUpdate.textContent = `更新时间：${data.data.updateInfo.date}　${data.data.updateInfo.time}`;
            data.data.list.forEach(item => {
                maoyanList.innerHTML += `<mdui-list-item href="https://www.maoyan.com/films/${item.movieInfo.movieId}" target="_blank">${item.movieInfo.movieName}\
                <div slot="icon">#${rankIndex++}</div>\
                <div slot="end-icon">${item.sumBoxDesc} (${item.movieInfo.releaseInfo})</div></mdui-list-item>`
            });
        },
    });
};

function fetchEpic() {
    requestAPI({
        url: apis.epic,
        callback: (data) => {
            data.data.forEach(game => {
                const gameItem = document.createElement('mdui-list-item');
                gameItem.href = game.link;
                gameItem.target = '_blank';
                gameItem.innerHTML = `${game.title} <img slot="icon" src="${game.cover}"> <div slot="description" class="price">原价：${game.original_price_desc}</div>`;
                const description = document.createElement('mdui-list-subheader');
                description.textContent = game.description;
                epicList.appendChild(gameItem);
                epicList.appendChild(description);
            });
        },
    })  
};

function fetchAnswer() {
    newAnswer.disabled = true;
    newAnswer.loading = true;
    answerText.style.opacity = .3;
    requestAPI({
        url: apis.answer,
        callback: (data) => {
            newAnswer.loading = false;
            newAnswer.disabled = false;
            answerText.style.opacity = 1;
            answerZh.innerHTML = data.data.answer;
            answerEn.innerHTML = data.data.answer_en;
        },
    });
};

function fetchBing() {
    requestAPI({
        url: apis.bing,
        callback: (data) => {
            bingImg.src = `https://cn.bing.com${data.images[0].url}`;
            bingTitle.textContent = data.images[0].title;
            bingDesc.textContent = data.images[0].copyright;
            bingQuiz.href = `https://cn.bing.com${data.images[0].quiz}`;
            bingMore.href = data.images[0].copyrightlink;
        },
    });
};

newAnswer.onclick = fetchAnswer;


function fetchHoroscopes() {
    horoContent.style.opacity = .3;
    requestAPI({
        url: apis.horoscopes.replace('{type}', horoscopes[horoInput.value]),
        callback: (data) => {
            horoContent.style.opacity = 1;
            const luck_index = data.data.index;
            const fortune = data.data.fortunetext;
            horoYiJi.innerText = `${data.data.todo.yi}　${data.data.todo.ji}`;
            horoLuckIndex.innerHTML = `爱情${luck_index.love}　事业${luck_index.work}<br>财富${luck_index.money}　健康${luck_index.health}<br>总体${luck_index.all}`;
            horoShort.innerText = `短评：${data.data.shortcomment}`;
            horoSummary.innerHTML = `事业：${fortune.work}<br><br>财富：${fortune.money}<br><br>总体：${fortune.all}`;
            horoLuckThings.innerHTML = `幸运颜色：${data.data.luckycolor}<br>幸运星座：${data.data.luckyconstellation}<br>幸运数字：${data.data.luckynumber}`;
        },
    });
};

horoInput.onchange = () => {
    if (horoscopes[horoInput.value] && horoInput.value.trim()) {
        fetchHoroscopes();
        updateLocalStorage('horoscope', horoInput);
    } else {
        horoInput.value = '';
        mdui.snackbar({ message: '名称不存在'});
    };
};

async function fetchAlarms() {
    alarmContent.style.opacity = .3;
    const formData = new FormData();
    formData.append('areaCode', areaCodes[provinceInput.value]);
    formData.append('warnLevel', 'RED,BLUE,YELLOW,Orange,UNKOWN');
    formData.append('warnEvent', 'A');
    const response = await fetch(apis.alarms, {
        method: 'POST',
        body: formData,
    });
    const data = await response.json();
    alarmContent.style.opacity = 1;
    alarmsList.innerHTML = '';
    data.forEach(alarm => {
        if (alarm.sender.includes(regionInput.value)) {
            const headline = document.createElement('mdui-list-item');
            const description = document.createElement('mdui-list-subheader');
            headline.innerHTML = alarm.headline;
            description.innerHTML = `生效时间：${alarm.effective.split('.')[0]}<br>${alarm.description}`;
            description.style.display = 'none';
            headline.onclick = () => {
                if (description.style.display === 'none') {
                    alarmsList.querySelectorAll('mdui-list-subheader').forEach(item => {
                        item.style.display = 'none';
                    });
                    description.style.display = 'block';
                } else {
                    description.style.display = 'none';
                };
                setPositions();
            };
            alarmsList.appendChild(headline);
            alarmsList.appendChild(description);
        };
    });
    if (alarmsList.children.length > 0) {
        emptyAlarmsLabel.style.display = 'none';
    };
    setTimeout(setPositions, 300);
};

provinceInput.onchange = () => {
    if (areaCodes[provinceInput.value] && provinceInput.value.trim()) {
        fetchAlarms();
        updateLocalStorage('province', provinceInput);
    } else {
        provinceInput.value = '';
        mdui.snackbar({ message: '名称不存在，请尝试键入省级行政区的完整名称。'});
    };
};
regionInput.onchange = () => {
    updateLocalStorage('region', regionInput);
    fetchAlarms();
};

function fetchAllAPIs() {
    fetchHitokoto();
    fetchLunarCalendar();
    fetchWeather();
    fetchZhihuDaily();
    fetchHistory();
    fetchEnglish();
    fetchOneMin();
    fetchCurrency();
    // fetchHots();
    fetchMaoyan();
    fetchEpic();
    fetchAnswer();
    fetchBing();
    fetchHoroscopes();
    fetchAlarms();
};

fetchAllAPIs();

if (window.innerWidth >= 368) {
    cards.forEach(card => {
        if (card.clickable) {
            card.onclick = () => {
                if (card.clickable) {
                    card.requestFullscreen();
                    card.style.opacity = 1;
                    card.clickable = false;
                    card.innerHTML += '<mdui-button-icon icon="arrow_back" class="exit-btn"></mdui-button-icon>'
                    $('.exit-btn').onclick = () => {
                        document.exitFullscreen();
                    };
                    card.style.overflow = 'auto';
                };
            };
            card.onfullscreenchange = () => {
                if (document.fullscreenElement === null) {
                    card.style.opacity = .8;
                    card.clickable = true;
                    card.removeChild($('.exit-btn'));
                    card.style.overflow = 'inherit';
                };
            };
        };
    });
} else {
    cards.forEach(card => {
        card.clickable = false;
    });
};