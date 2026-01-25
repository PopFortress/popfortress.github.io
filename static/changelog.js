const prefers = window.matchMedia('(prefers-color-scheme: dark)');
const isSystemDark = prefers.matches;
const body = document.querySelector('body');
const params = new URLSearchParams(document.location.search);
const header = document.querySelector('h1');
const main = document.querySelector('.main');
const dl = document.querySelector('dl');
const links = document.querySelectorAll('a');
const dt = document.querySelectorAll('dt');

if (isSystemDark) {
    body.style.background = '#1d1d1f';
    body.style.color = '#f5f5f5';
}

if (params.get('frame') === 'true') {
    document.documentElement.style.scrollbarWidth = 'thin';
    header.style.display = 'none';
    main.style.padding = '0 0 17px 9px';
    dl.style.margin = '0';
    links.forEach(e => {
        e.target = '_top';
    });
    body.style.fontSize = '12px';
    dt.forEach(e => {
        e.style.fontSize = '12px';
    });
};