const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const bodyEle = document.querySelector('body');
const searchBox = document.querySelector('#search');
const mottoContainer = document.querySelector('.motto-container');
const iyanBox = document.querySelector('.iyan-content');
const searchFestivalBtn = document.querySelector('.search-btn');

if (isSystemDark) {
    bodyEle.style.backgroundColor = '#1d1d1f';
    bodyEle.style.color = '#fff';
    searchBox.style.backgroundColor = '#2d2d2f';
    mottoContainer.style.backgroundColor = '#2d2d2f';
    mottoContainer.style.color = '#fff';
    iyanBox.style.backgroundColor = '#2d2d2f';
    iyanBox.style.color = '#fff';
    searchFestivalBtn.style.backgroundColor = '#2d2d2f';
}