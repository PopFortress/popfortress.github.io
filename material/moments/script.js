mdui.setColorScheme('#EF9A9A');
const $ = (query) => mdui.$(query)[0];

const shareBtn = $('#share-btn');
const subscribeBtn = $('.subscribe-btn');
const momentsList = $('.moments-list');
const sortLatest = $('#sort-latest');
const sortOldest = $('#sort-oldest');
const toggleGiscus = $('#toggle-giscus');
const giscusWrapper = $('.giscus-wrapper');
let rawMomentsData;
let momentsData;
let giscusEnabled = false;

shareBtn.onclick = () => {
    if (navigator.share) {
        mdui.snackbar({ message: '若无法分享，请授予相应权限或手动复制链接分享' });
        navigator.share({ url: window.location.href, title: '即刻短文 | Moments - 波普的温馨小阁', text: window.location.href });
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href);
        mdui.snackbar({ message: '链接已复制到剪贴板' });
    } else {
        mdui.snackbar({ message: '非安全上下文' });
    };
};

subscribeBtn.onclick = () => {
    mdui.prompt({
        headline: '订阅动态',
        description: '请键入您的邮箱地址。',
        onConfirm: () => {
            subscribeBtn.icon = 'check';
            subscribeBtn.textContent = '已订阅';
            subscribeBtn.disabled = true;
        },
        textFieldOptions: {
            type: 'email',
            icon: 'email',
            variant: 'outlined',
        }
    });
};

async function fetchMoments() {
    const response = await fetch('./moments.json');
    rawMomentsData = await response.json();
    momentsData = [...rawMomentsData].reverse();
    displayMoments(momentsData);
};

function displayMoments(moments) {
    momentsList.innerHTML = '';
    moments.forEach(moment => {
        momentsList.innerHTML += 
        `<mdui-card variant="filled">
            <div class="moment-text">${moment.text}</div>
            <mdui-divider></mdui-divider>
            <div class="moment-details">
                <div class="datetime">${moment.time}</div>
                <mdui-button-icon class="like-btn" icon="favorite_border" selected-icon="favorite" selectable></mdui-button-icon>
                <mdui-button-icon class="comment-btn" icon="forum--outlined"></mdui-button-icon>
            </div>
        </mdui-card>`;
    });
    const commentBtns = document.querySelectorAll('.comment-btn');
    commentBtns.forEach(commentBtn => {
        commentBtn.onclick = () => {
            toggleGiscus.scrollIntoView();
        };
    });
};

sortLatest.addEventListener('click', () => {
    if (sortLatest.selected) {
        sortOldest.selected = false;
        momentsData = [...rawMomentsData].reverse();
        displayMoments(momentsData);
    } else {
        sortLatest.selected = true;
    };
});

sortOldest.addEventListener('click', () => {
    if (sortOldest.selected) {
        sortLatest.selected = false;
        momentsData = [...rawMomentsData];
        displayMoments(momentsData);
    } else {
        sortOldest.selected = true;
    };
});

toggleGiscus.onclick = () => {
    if (giscusEnabled) {
        giscusWrapper.style.display = 'none';
        toggleGiscus.textContent = '显示留言板';
        toggleGiscus.icon = 'keyboard_arrow_down';
        giscusEnabled = false;
    } else {
        giscusWrapper.style.display = 'block';
        toggleGiscus.textContent = '隐藏留言板';
        toggleGiscus.icon = 'keyboard_arrow_up';
        giscusEnabled = true;
    };
};

fetchMoments();

mdui.loadLocale((locale) => import(`https://unpkg.com/mdui@2/locales/${locale}.js`));
mdui.setLocale('zh-cn');