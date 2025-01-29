const prefers = window.matchMedia('(prefers-color-scheme: dark)');
const isSystemDark = prefers.matches;
const body = document.querySelector('body');

if (isSystemDark) {
    body.style.background = '#1d1d1f';
    body.style.color = '#f5f5f5';
}