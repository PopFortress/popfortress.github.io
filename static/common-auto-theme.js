const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const body = document.querySelector('body');
if (isSystemDark) {
    body.style.backgroundColor = '#1d1d1f';
    body.style.color = '#fff';
}