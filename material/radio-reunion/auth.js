// contains user accounts login, logout and authentication logic

const loginBtn = $('.login__button');
const emailEmailInput = $('.login_email__email_input');
const emailPwdInput = $('.login_email__pasword_input');
const submitLoginEmailBtn = $('.login__login_email_btn');

loginBtn.onclick = () => {
    switchPage('auth');
};

class Authenticator {
    constructor(options) {
        this.account = options.account;
        this.cookie;
    };
    loginEmail(options) {
        const email = options.email;
        const password = options.password;
        submitLoginEmailBtn.disabled = submitLoginEmailBtn.loading = true;
        xhr.open('GET', `${apiServer}/login?email=${email}&password=${password}`);
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