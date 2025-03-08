const appContainer = document.querySelector('.app');
const sayingsCard = document.querySelector('.sayings');
const searchInput = document.querySelector('.search-box');
const searchBtn = document.querySelector('.search-btn');
const latestUpdateLabel = document.querySelector('.latest-update');
const listItems = document.querySelectorAll('mdui-list-item');
const activityImg = document.querySelector('.activity-card');
const activityTitleLabel =document.querySelector('.activity-title');
const helpInfoBtn = document.querySelector('.info-btn');
var sayingsDesc;
var data;


async function fetchSrc() {
    var response = await fetch('/static/index-src.json');
    data = await response.json();

    sayingsCard.innerHTML = data.saying;
    sayingsDesc = data.saying_desc;
    latestUpdateLabel.innerHTML = `最后更新时间　${data.latest_update}`;
    activityImg.style.backgroundImage = `url(${data.activity_imgurl})`;
    activityTitleLabel.innerHTML = data.activity_title;
    activityImg.href = `/fakecaptcha?r=${data.activity_target_url}`;
    activityImg.target = '_blank';
}

function showSayingsDesc() {
    mdui.snackbar({
        message: sayingsDesc,
        closeable: true
    });
}

function searchSite() {
    if (searchInput.value) {
        window.open(`/fakecaptcha?r=//cn.bing.com/search?q=${searchInput.value} site:popfortress.github.io`, '_blank');
        searchInput.value = '';
    }
}

function addListItemIcon() {
    listItems.forEach(element => {
        element.endIcon = 'arrow_forward';
        if (!element.icon) {
            element.icon = 'auto_awesome';
        };
    });
}

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
}

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchSite();
    };
});
searchBtn.addEventListener('click', searchSite);
sayingsCard.addEventListener('click', showSayingsDesc);
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