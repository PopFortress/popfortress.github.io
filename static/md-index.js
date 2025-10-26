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

notifyDlgCloseBtn.onclick = () => {
    notifyDialog.open = false;
};

clearCache.onclick = () => {
    localStorage.removeItem('ignoreNotifyID');
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
    latestUpdateLabel.innerHTML = `最后更新时间　${data.latest_update}`;
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
        element.endIcon = 'arrow_forward';
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
};

commitLabel.onclick = fetchCommitVersion;

clearStorage.onclick = () => {
    localStorage.clear();
    location.reload();
};

acceptCookies.onclick = declineCookies.onclick = (e) => {
    e.target.loading = true;
    sessionStorage.cookiesAccepted = true;
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
    document.body.style.overflow = 'auto';
    $('#main-avatar-alt').style.display = 'none';
    $('#main-avatar').style.display = 'block';
};

if (sessionStorage.cookiesAccepted) {
    cookieWrapper.style.display = 'none';
};