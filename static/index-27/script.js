// clinet verification
if (Date.now() - (+localStorage.lastVerified || 0) > 5.76e7 && localStorage.disableCaptcha !== 'true') {
    location.href = '/fakecaptcha?r=/cf-challenge?r=/';
};

const copyrightsText = document.querySelector('footer .copyrights');

copyrightsText.innerHTML = `Copyright &copy; ${new Date().getFullYear()} PopFortress. 保留所有权利。`;

const addressCopyLink = document.querySelector('.craft-address a');
const copyIcon = document.querySelector('.craft-address .copy-icon');

addressCopyLink.addEventListener('click', (e) => {
    navigator.clipboard.writeText(addressCopyLink.innerText).then(() => {
        copyIcon.style.backgroundImage = 'url(https://pic1.imgdb.cn/i/034VTUufTvfLosGFiAsQQk.png)'; // done icon
        setTimeout(() => {
            copyIcon.style.backgroundImage = 'url(https://pic1.imgdb.cn/i/034VTN9PPNGpm3zjnoXGl8.png)'; // copy icon
        }, 3000);
    })
})