mdui.setColorScheme('#EF9A9A');
const $ = (query) => mdui.$(query)[0];

const shareBtn = $('#share-btn');
const subscribeBtn = $('.subscribe-btn');
const momentsList = $('.moments-list');
const sortLatest = $('#sort-latest');
const sortOldest = $('#sort-oldest');
const toggleGiscus = $('#toggle-giscus');
const giscusWrapper = $('.giscus-wrapper');
const loading = $('mdui-circular-progress');
let rawMomentsData;
let momentsData;
let giscusEnabled = false;
const pin = Math.floor(Math.random() * 1000000);
const emailCfg = `title=Moments Subscription&text=<font color="DimGray">Greetings!</font>  <br><br> <font color="DimGray">You're now performing </font> <font color="red"> a subscription to the Moments</font> <font color="DimGray">, please enter the following code:</font>  <font color="Orange "size="5">${pin}</font> <font color="Gray "> in the text field to confirm your subscription.</font> <br>  <br><font color="Gray">Please note that your password or email may be modified accidentally by processing unauthorized activities. If you have not required this subscription, please simply ignore this email.</font> <br><font color="Gray">Our staff won't ask for your passcode, please keep this code secret.</font><br> <br> <font color="Gray">This email was sent automatically, please do not reply to it straightly.</font><br><font color="Gray">You received this email because you subscribed to the Moments on popfortress.github.io.</font><br><br><font color="Gray">popfortress.github.io</font>`;

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
        onConfirm: async (value, dialog) => {
            if (value.trim()) {
                subscribeBtn.loading = true;
                try {
                    await fetch(`https://api.mmp.cc/api/mail?email=1077379835%40qq.com&key=prdjcdaiifnlhjeg&mail=${value.trim()}&name=noreply%40popfortress.github.io&${emailCfg}`);
                } catch (e) {};
                dialog.open = false;
                mdui.prompt({
                    headline: '动态订阅确认',
                    description: '我们已向您发送了一封验证邮件，请在此输入验证码以完成订阅。',
                    textFieldOptions: {
                        type: 'number',
                        icon: 'password',
                        variant: 'outlined',
                        maxlength: 6,
                    },
                    onConfirm: (value) => {
                        if (value.trim() === pin.toString()) {
                            mdui.snackbar({ message: '动态订阅成功！' });
                        } else {
                            return false;
                        };
                    },
                });
            } else {
                return false;
            };
            subscribeBtn.loading = false;
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

    document.querySelectorAll('a').forEach(link => {
    link.target = '_blank';
    loading.style.display = 'none';
});
};

function displayMoments(moments) {
    momentsList.innerHTML = '';
    moments.forEach(moment => {
        momentsList.innerHTML += 
        `<mdui-card variant="filled">
            <div class="moment-text">${moment.text}</div>
            <mdui-divider></mdui-divider>
            <div class="moment-details">
                <div class="datetime">${moment.time.split(':')[1].length > 1 ? moment.time : `${moment.time.split(':')[0]}:0${moment.time.split(':')[1]}`}</div>
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

