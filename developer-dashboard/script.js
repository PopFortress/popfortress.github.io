mdui.setColorScheme('#EF9A9A');
mdui.loadLocale((locale) => import(`https://unpkg.com/mdui@2/locales/${locale}.js`));
mdui.setLocale('zh-cn');

const $ = (query) => mdui.$(query)[0];
// for gitee token
const tokenWrapper = $('.token__wrapper');
const tokenText = $('.token__token');
const tokenEditBtn = $('.token_edit_btn');

// for github token
const editGhTokenBtn = $('.edit_gh_token__btn');
const githubTokenText = $('.github_token__token');


let ACCESS_TOKEN; // developer token (gitee).
let GH_TOKEN; // github token
function updateAccessToken(value) {
    ACCESS_TOKEN = value;
    localStorage.developer_access_token = value;
    tokenWrapper.style.display = 'flex';
    tokenText.innerText = value;
};

function updateGhToken(value) {
    GH_TOKEN = value;
    localStorage.github_access_token = value.trim();
    githubTokenText.innerText = value;
};

const token = localStorage.developer_access_token; // gitee
const gh_token = localStorage.github_access_token; // github

tokenEditBtn.onclick = editToken;

function editToken() {
    mdui.prompt({
        headline: '需要访问令牌',
        description: '请键入 Gitee 开发者访问令牌以继续（此项是更改开发数据仓库所必需的。）',
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

editGhTokenBtn.onclick = () => {
    mdui.prompt({
        headline: '填写 GitHub API Token',
        description: '请在下方键入 Github Rest API 访问令牌以获取在 GitHub 上的远程数据仓库的访问权限。',
        icon: 'lock--outlined',
        textFieldOptions: {
            placeholder: '访问令牌',
            icon: 'key',
            value: gh_token || GH_TOKEN || '',
        },
        onConfirm: (value) => {
            if (value.trim()) {
                updateGhToken(value.trim());
                mdui.snackbar({ message: '已保存 GitHub API Token。' });
            } else {
                return false;
            };
        },
    });
};



if (token) {
    updateAccessToken(token);
} else {
    editToken();
};

if (gh_token) {
    updateGhToken(gh_token);
};