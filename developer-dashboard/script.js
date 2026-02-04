mdui.setColorScheme('#EF9A9A');
mdui.loadLocale((locale) => import(`https://unpkg.com/mdui@2/locales/${locale}.js`));
mdui.setLocale('zh-cn');

const $ = (query) => mdui.$(query)[0];
const tokenWrapper = $('.token__wrapper');
const tokenText = $('.token__token');
const tokenEditBtn = $('.token_edit_btn');


let ACCESS_TOKEN; // developer token
function updateAccessToken(value) {
    ACCESS_TOKEN = value;
    localStorage.developer_access_token = value;
    tokenWrapper.style.display = 'flex';
    tokenText.innerText = value;
};
const token = localStorage.developer_access_token;

tokenEditBtn.onclick = editToken;

function editToken() {
    mdui.prompt({
        headline: '需要访问令牌',
        description: '请键入开发者访问令牌以继续（此项是更改开发数据仓库所必需的。）',
        icon: 'lock--outlined',
        onConfirm: (value, dialog) => {
            if (value.trim()) {
                updateAccessToken(value.trim());
            } else {
                const settings = localStorage.dictionary_remote_settings;
                if (settings) {
                    const token = JSON.parse(settings)['accessToken'];
                    if (token) {
                        dialog.querySelector('mdui-text-field').value = token;
                        mdui.snackbar({ message: '已自动填充访问令牌。' });
                    };
                };
                return false;
            };
        },
        textFieldOptions: {
            placeholder: '访问令牌',
            icon: 'key',
            helper: '可点击确定尝试自动填充。',
        },
    });
};



if (token) {
    updateAccessToken(token);
} else {
    editToken();
};