const $ = (query) => mdui.$(query)[0];

const appContainer = $('.app');
const sayingsCard = $('.sayings');
const sayingsText = $('.sayings-text');
const prevSayings = $('.prev-sayings');
const nextSayings = $('.next-sayings');
const prevActivity = $('.prev-activity');
const nextActivity = $('.next-activity');
const searchInput = $('.search-box');
const searchBtn = $('.search-btn');
const latestUpdateLabel = $('.latest-update');
const listItems = document.querySelectorAll('mdui-list-item');
const activityImg = $('.activity-card');
const activityTitleLabel =$('.activity-title');
const helpInfoBtn = $('.info-btn');
const optionsBtn = $('.options-btn');
const optionsDialog = $('.options-dialog');
const dlgCloseBtn = $('.options-dlg-close-btn');
const changelogWrapper = $('.changelog-wrapper');
const changelogSwitch = $('#changelog-box-switch');
const commitLabel = $('.commit-label');
const clearStorage = $('.clear-storage');
const vanillaSwitch = $('#vanilla-switch');
const notifySwitch = $('#notify-switch');
const notify = $('.notify-wrapper');
const notifyList = $('.notify-list');
const notifyBadge = $('.notify-badge');
const commentsSwitch = $('#comments-switch');
const giscus = $('.giscus');
const notifyDialog = $('.notify-dialog');
const ignoreNotifyCheckbox = $('.ignore-notify-checkbox');
const openlinkBtn = $('.open-link-btn');
const notifyDlgCloseBtn = $('.notify-dlg-close-btn');
const notifyDlgDesc = $('.notify-dlg-desc');
const clearCache = $('.clear-cache');
const cookieWrapper = $('.cookie-wrapper');
const acceptCookies = $('#accept-cookies');
const declineCookies = $('#decline-cookies');
const cookieDialog = $('.cookie-dialog');
const cookieClosing = $('.cookie-closing');
const loadingClose = $('.loading-close');
const foldedSectionsTriggers = document.querySelectorAll('.folded-sections-menu mdui-menu-item');
const tabs = $('mdui-tabs.sections-tabs');
const dayEffectSwitch = $('#day-effects');
const fallbackFontSwitch = $('#second-font-src');
const festivalText = $('.festival-text');
var sayingsDesc;
var sha;
var commitMessage;
var responseCommit;
var dataCommit;
var responseCount;
var dataCount;
var notifyTitle;
var notifyLink;
var notifyWrapper;
var currSayingsIndex = 0;
var currActivityIndex = 0;
var data;
const monthsMap = {'01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'};
const blackDays = ["1/6", "1/8", "1/21", "1/27", "2/4", "2/19", "3/5", "3/12", "3/29", "4/29", "5/9", "5/12", "6/26", "7/6", "7/7", "7/14", "8/5", "9/9", "9/18", "10/10", "11/7", "12/12", "12/13", "9/30"];
const date_index = `${new Date().getMonth()+1}/${new Date().getDate()}`;
const ghApiUrl = 'https://api.github.com/repos/PopFortress/popfortress.github.io';
if (localStorage.showChangelog) {
    var showChangelog = localStorage.showChangelog;
} else {
    var showChangelog = 'true';
};
if (localStorage.vanilla === 'true') {
    location.href = '/index-vanilla';
};
if (localStorage.showNotify) {
    var showNotify = localStorage.showNotify;
} else {
    var showNotify = 'true';
};
if (localStorage.showComments) {
    var showComments = localStorage.showComments;
} else {
    var showComments = 'true';
};
if (localStorage.dayEffect) {
    var dayEffect = localStorage.dayEffect;
} else {
    var dayEffect = 'true';
};
if (localStorage.fallback_font_src) {
    var fallback_font_src = localStorage.fallback_font_src;
} else {
    var fallback_font_src = 'false';
};

notifyDlgCloseBtn.onclick = () => {
    notifyDialog.open = false;
};

clearCache.onclick = () => {
    localStorage.removeItem('ignoreNotifyID');
    localStorage.removeItem('cookiesAccepted');
    sessionStorage.clear();
    mdui.snackbar({message: '已清除缓存',});
    setTimeout(() => {
        location.reload();
    }, 1000);
};

prevSayings.onclick = () => {
    if (currSayingsIndex > 0) {
        prevSayings.disabled = false;
        nextSayings.disabled = false;
        currSayingsIndex--;
        sayingsText.innerHTML = data.sayings[currSayingsIndex].title;
        sayingsDesc = data.sayings[currSayingsIndex].desc;
    };
    checkSayingsIndex();
};

nextSayings.onclick = () => {
    if (currSayingsIndex < data.sayings.length - 1) {
        nextSayings.disabled = false;
        prevSayings.disabled = false;
        currSayingsIndex++;
        sayingsText.innerHTML = data.sayings[currSayingsIndex].title;
        sayingsDesc = data.sayings[currSayingsIndex].desc;
    };
    checkSayingsIndex();
};

function checkSayingsIndex() {
    if (currSayingsIndex <= 0) {
        prevSayings.disabled = true;
    } else {
        prevSayings.disabled = false;
    };
    if (currSayingsIndex >= data.sayings.length - 1) {
        nextSayings.disabled = true;
    } else {
        nextSayings.disabled = false;
    };
};

prevActivity.onclick = () => {
    if (currActivityIndex > 0) {
        currActivityIndex--;
        activityImg.style.backgroundImage = `url(${data.activities[currActivityIndex].imgurl})`;
        activityTitleLabel.innerHTML = data.activities[currActivityIndex].title;
        activityImg.href = `/fakecaptcha?r=${data.activities[currActivityIndex].target_url}`;
    };
};

nextActivity.onclick = () => {
    if (currActivityIndex < data.activities.length - 1) {
        currActivityIndex++;
        activityImg.style.backgroundImage = `url(${data.activities[currActivityIndex].imgurl})`;
        activityTitleLabel.innerHTML = data.activities[currActivityIndex].title;
        activityImg.href = `/fakecaptcha?r=${data.activities[currActivityIndex].target_url}`;
    };
};


async function fetchSrc() {
    var response = await fetch('/static/index-src.json');
    data = await response.json();

    sayingsText.innerHTML = data.sayings[0].title;
    sayingsDesc = data.sayings[0].desc;
    activityImg.style.backgroundImage = `url(${data.activities[0].imgurl})`;
    activityTitleLabel.innerHTML = data.activities[0].title;
    activityImg.href = `/fakecaptcha?r=${data.activities[0].target_url}`;
    activityImg.target = '_blank';

    if (data.notifications.length > 0) {
        notifyBadge.style.display = 'inline-flex';
        notifyList.innerHTML = '';
        notify.placement = 'bottom-end';
        data.notifications.forEach(notify => {
            notifyWrapper = document.createElement('div');
            notifyTitle = document.createElement('span');
            notifyTitle.innerHTML = notify.title;
            notifyWrapper.appendChild(notifyTitle);
            if (notify.link) {
                notifyLink = document.createElement('a');
                notifyLink.href = notify.link;
                notifyLink.target = '_blank';
                notifyLink.innerHTML = '打开链接';
                notifyLink.style.marginLeft = '10px';
                notifyWrapper.appendChild(notifyLink);
            };
            notifyList.appendChild(notifyWrapper);

            if (notify.alert && +localStorage.ignoreNotifyID !== notify.id) {
                notifyDlgDesc.innerHTML = notify.title;
                if (notify.link) {
                    openlinkBtn.href = notify.link;
                };
                notifyDialog.open = true;
                notifyDialog.dataset.notifyId = notify.id;
            };
        });
    };

    checkSayingsIndex();
};

openlinkBtn.onclick = () => { notifyDialog.open = false; };

ignoreNotifyCheckbox.onchange = (e) => {
    if (e.target.checked) {
        localStorage.ignoreNotifyID = notifyDialog.dataset.notifyId;
    } else {
        localStorage.removeItem('ignoreNotifyID');
    };
};

notify.addEventListener('opened', () => {
    notifyBadge.style.display = 'none';
});

function showSayingsDesc() {
    mdui.snackbar({
        message: sayingsDesc,
        closeable: true,
        closeOnOutsideClick: true,
    });
};

function searchSite() {
    if (searchInput.value) {
        window.open(`/fakecaptcha?r=//cn.bing.com/search?q=${searchInput.value} site:popfortress.github.io`, '_blank');
        searchInput.value = '';
    }
};

function addListItemIcon() {
    listItems.forEach(element => {
        element.endIcon = 'keyboard_arrow_right';
        if (!element.icon) {
            element.icon = 'auto_awesome';
        };
    });
};

function lstItemAnimate(e) {
    if (e.target.active) {
        e.target.active = false;
    } else {
        e.target.active = true;
    };
};

function showActivityHelpDialog() {
    mdui.alert({
        headline: '主页活动',
        description: '不定期更新的主页活动，紧跟时事~ 点击图片可查看详细信息。'
    });
};

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchSite();
    };
});
searchBtn.addEventListener('click', searchSite);
sayingsText.addEventListener('click', showSayingsDesc);
fetchSrc();
mdui.setColorScheme('#EF9A9A');
addListItemIcon();
listItems.forEach(element => {
    element.addEventListener('focus', lstItemAnimate);
    element.addEventListener('blur', lstItemAnimate);
});
helpInfoBtn.addEventListener('click', showActivityHelpDialog);
mdui.loadLocale((locale) => import(`https://unpkg.com/mdui@2/locales/${locale}.js`));
mdui.setLocale('zh-cn');

optionsBtn.onclick = () => {
    optionsDialog.open = true;
};

dlgCloseBtn.onclick = () => {
    optionsDialog.open = false;
};

if (showChangelog === 'true') {
    changelogSwitch.checked = true;
} else {
    changelogWrapper.style.display = 'none';
};

changelogSwitch.onchange = (e) => {
    if (e.target.checked) {
        localStorage.showChangelog = true;
        changelogWrapper.style.display = 'block';
    } else {
        localStorage.showChangelog = false;
        changelogWrapper.style.display = 'none';
    };
};

vanillaSwitch.onchange = (e) => {
    if (e.target.checked) {
        localStorage.vanilla = true;
        location.href = '/index-vanilla';
    };
};

if (showNotify === 'true') {
    notifySwitch.checked = true;
} else {
    notify.style.display = 'none';
};

notifySwitch.onchange = (e) => {
    if (e.target.checked) {
        localStorage.showNotify = true;
        notify.style.display = 'block';
    } else {
        localStorage.showNotify = false;
        notify.style.display = 'none';
    };
};

if (showComments === 'true') {
    commentsSwitch.checked = true;
} else {
    giscus.style.display = 'none';
    giscus.removeChild(giscus.firstChild);
};

commentsSwitch.onchange = (e) => {
    if (e.target.checked) {
        localStorage.showComments = true;
        giscus.style.display = 'block';
    } else {
        localStorage.showComments = false;
        giscus.style.display = 'none';
    };
};

if (dayEffect === 'true') {
    dayEffectSwitch.checked = true;
    blackDays.forEach(day => {
        if (date_index === day) {
            document.documentElement.style.filter = 'grayscale(1)';
        };
    });
};
dayEffectSwitch.onchange = (e) => {
    if (e.target.checked) {
        localStorage.dayEffect = true;
    } else {
        localStorage.dayEffect = false;
    };
    location.reload();
};
if (fallback_font_src === 'true') {
    fallbackFontSwitch.checked = true;
    document.head.innerHTML += '<link rel="stylesheet" href="/mdui/fallback_icons/material-icons-fallback.css"><link rel="stylesheet" href="/mdui/fallback_icons/material-icons-outlined-fallback.css">';
};
fallbackFontSwitch.onchange = (e) => {
    if (e.target.checked) {
        localStorage.fallback_font_src = true;
    } else {
        localStorage.fallback_font_src = false;
    };
    location.reload();
};

async function fetchCommitVersion() {
    commitLabel.removeEventListener('click', fetchCommitVersion);
    responseCommit = await fetch(`${ghApiUrl}/commits?per_page=1&page=1`);
    dataCommit = await responseCommit.json();
    responseCount = await fetch(`${ghApiUrl}/stats/contributors`);
    dataCount = await responseCount.json();
    
    if (!responseCommit.status === 200 && !responseCount.status === 200) {
        commitLabel.textContent = 'Failed to fetch. Retry.';
        commitLabel.onclick = fetchCommitVersion;
        return;
    };

    sha = dataCommit[0].sha;
    commitMessage = dataCommit[0].commit.message;
    if (responseCount.status === 200) {
        commitLabel.textContent = `${sha.slice(0, 7)} (${dataCount[0].total} commits, +${dataCount[0].weeks[0].a}, -${dataCount[0].weeks[0].d})`;
    } else {
        commitLabel.textContent = `${sha.slice(0, 7)} (${commitMessage.split('\n')[0]})`;
    };
    commitLabel.title = `${sha}\n\n${commitMessage}`;
    commitLabel.href = '//github.com/PopFortress/popfortress.github.io/commits/main/';
    commitLabel.target = '_blank';
    const raw_date = dataCommit[0].commit.committer.date;
    const yr = raw_date.slice(0, 4);
    const month = monthsMap[raw_date.slice(5, 7)] + '.';
    const day = raw_date.slice(8, 10);
    latestUpdateLabel.innerHTML = `最后更新时间　${month} ${day}, ${yr}`;
};

commitLabel.onclick = fetchCommitVersion;

clearStorage.onclick = () => {
    localStorage.clear();
    location.reload();
};

acceptCookies.onclick = declineCookies.onclick = (e) => {
    e.target.loading = true;
    localStorage.cookiesAccepted = true;
    setTimeout(() => {
        e.target.loading = false;
        cookieDialog.style.display = 'none';
        cookieClosing.style.display = 'flex';
        setTimeout(() => {
            cookieWrapper.hide = true;
            setTimeout(() => {
                cookieWrapper.style.display = 'none';
            }, 500);
        }, 1200);
    }, 800);
};

window.onload = () => {
    loadingModal.close();
    $('#main-avatar-alt').style.display = 'none';
    $('#main-avatar').style.display = 'block';
};

loadingClose.onclick = () => { loadingModal.close() };
let loadingTimer = setTimeout(() => { loadingClose.style.display = 'block' }, 3000);

loadingModal.onclose = () => {
    document.body.style.overflow = 'auto';
    document.body.style.paddingBottom = '0';
    clearTimeout(loadingTimer);
};

if (localStorage.cookiesAccepted) {
    cookieWrapper.style.display = 'none';
};

if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.querySelectorAll('mdui-card').forEach(card => {
        card.style.backgroundColor = 'rgb(var(--mdui-color-surface-container))';
    });
    $('.changelog-view-all').elevated = false;
};

async function fetchFestival() {
    const res = await fetch('https://seep.eu.org/https://api.52vmy.cn/api/wl/day/world');
    const data = await res.json();
    const date = data.info[0].date;
    let text;
    if (data.info[0].countdown === 0) {
        text = `今天是 ${data.info[0].festival}`;
    } else {
        text = `${data.info[0].desc}.　(${date.slice(0, 4)}年${date.slice(4, 6)}月${date.slice(6, 8)}日)`;
    };
    festivalText.innerText = text;
    festivalText.style.display = 'block';
};
fetchFestival();

// handling folded sections
foldedSectionsTriggers.forEach(item => {
    item.onclick = () => {
        tabs.value = item.dataset.value;
        $(`.sections-tabs mdui-tab-panel[value=${item.value}]`).style.display = 'block';
        const firstTab = $('.sections-tabs mdui-tab')
        firstTab.textContent = item.textContent;
        setTimeout(() => {
            firstTab.active = true;
        }, 100);
        tabs.classList.add('viewing-folded-sections');
    };
});

tabs.onchange = () => {
    document.querySelectorAll('.hidden-sections').forEach(section => {
        if (tabs.value) {
            section.style.display = 'none';
            $('.sections-tabs mdui-tab').textContent = '精选';
            tabs.classList.remove('viewing-folded-sections');
        };
   });
};