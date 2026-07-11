// clinet verification
if (Date.now() - (+localStorage.lastVerified || 0) > 5.76e7 && localStorage.disableCaptcha !== 'true') {
    location.href = '/fakecaptcha?r=/cf-challenge?r=/';
};

const copyrightsText = document.querySelector('footer .copyrights');

copyrightsText.innerHTML = `Copyright &copy; ${new Date().getFullYear()} PopFortress. 保留所有权利。`;