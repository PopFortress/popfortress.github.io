mdui.setColorScheme('#62a6f9');

const $ = (query) => mdui.$(query)[0];

const xhr = new XMLHttpRequest();
const placeholderImg = 'https://pic1.imgdb.cn/i/0348f3nAsWnDeVCPsNNuBg.png';
const accessToken = localStorage.developer_access_token;

class Api {
    constructor(options) {
        this.server = options.server;
    };
    async get(path) {
        const response = await fetch(`${this.server}${path}`);
        const data = await response.json();
        return data;
    };
};

const api = new Api({
    server: 'https://gitee.com/api/v5/repos/popfortress/dev-data/contents/watchnow-tv',
});

mdui.loadLocale((locale) => import(`https://unpkg.com/mdui@2/locales/${locale}.js`));
mdui.setLocale('zh-cn');

function base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
};