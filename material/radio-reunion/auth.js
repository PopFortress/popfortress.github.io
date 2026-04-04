// contains user accounts login, logout and authentication logic

const loginBtn = $('.login__button');
const emailEmailInput = $('.login_email__email_input');
const emailPwdInput = $('.login_email__pasword_input');
const submitLoginEmailBtn = $('.login__login_email_btn');
const qrMethodBtn = $('.login__qr_method_btn');

const emailMethodWrapper = $('.login__email_wrapper');
const qrMethodWrapper = $('.login__qr_wrapper');
const accountMethodBtn = $('.login__account_method_btn');

const qrImg = $('.login__qr__img');
const qrLink = $('.login__qr__link');
const qrInfo = $('.login__form__qr__info');

loginBtn.onclick = () => {
    switchPage('auth');
};

class Authenticator {
    constructor(options) {
        this.account = options.account;
        this.cookie;
        this.qrImgUrl = '';
        this.isLoggedIn = false;
    };
    loginEmail(options) {
        const email = options.email;
        const password = options.password;
        submitLoginEmailBtn.disabled = submitLoginEmailBtn.loading = true;
        xhr.open('GET', `${apiServer}/login%3Femail=${email}&password=${password}`);
        xhr.send();
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            if (data.code === 501 || data.code === 502) {
                mdui.snackbar({ message: '账号或密码错误。' });
            } else if (data.code === 200) {
                this.cookie = data.cookie;
                mdui.snackbar({ message: '登录成功。' });
            } else {
                mdui.snackbar({ message: `${data.code} ${data.message}` });
            };

            submitLoginEmailBtn.disabled = submitLoginEmailBtn.loading = false;
        };
    };
    loginQrcode(key) {
        xhr.open('GET', `${apiServer}/login/qr/check%3Fkey=${key}`);
        xhr.send();
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            if (data.code === 800) {
                qrInfo.innerText = '二维码已失效，请重新登录。';
                qrImg.classList.add('expired');
            } else if (data.code === 802) {
                qrInfo.innerText = '请确认授权以登录。';
            } else if (data.code === 803) {
                qrInfo.innerText = '登录成功。';
                this.cookie = data.cookie;
                mdui.snackbar({ message: '登录成功。' });
                switchPage('main');
                this.isLoggedIn = true;
            };

            if (!this.isLoggedIn) {
                setTimeout(() => { this.loginQrcode(key); }, 2000);
            };
        };
    };
};

const authenticator = new Authenticator({ account: 'guest' });

submitLoginEmailBtn.onclick = attemptLoginEmail;

function attemptLoginEmail() {
    const email = emailEmailInput.value.trim();
    const pwd = emailPwdInput.value.trim();
    if (emailEmailInput.checkValidity() && emailPwdInput.checkValidity() && email && pwd) {
        authenticator.loginEmail({
            email: emailEmailInput.value.trim(),
            password: emailPwdInput.value.trim()
        });
    };
};

emailPwdInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        attemptLoginEmail();
    };
};

qrMethodBtn.onclick = () => {
    emailMethodWrapper.style.display = 'none';
    qrMethodWrapper.style.display = 'flex';
    qrMethodBtn.style.display = 'none';
    accountMethodBtn.style.display = 'block';

    qrImg.classList.remove('expired');

    if (!authenticator.qrImgUrl) {
        xhr.open('GET', `${apiServer}/login/qr/key`);
        xhr.send();
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            const unikey = data.data.unikey;
            xhr.open('GET', `${apiServer}/login/qr/create%3Fkey=${unikey}&qrimg=true`);
            xhr.send();
            xhr.onload = () => {
                const data = JSON.parse(xhr.responseText);
                authenticator.qrImgUrl = data.data.qrimg;
                qrImg.src = authenticator.qrImgUrl;
                qrLink.href = data.data.qrurl;
                authenticator.loginQrcode(unikey);
            };
        };
    };
};

accountMethodBtn.onclick = () => {
    emailMethodWrapper.style.display = 'flex';
    qrMethodWrapper.style.display = 'none';
    qrMethodBtn.style.display = 'block';
    accountMethodBtn.style.display = 'none';
};