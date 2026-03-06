mdui.setColorScheme('#EF9A9A');
const $ = (query) => mdui.$(query)[0];

const mainAvatar = $('.main-avatar');
const mainAvatarAlt = $('.main-avatar-alt');
const jumpToTop = $('.jump-to-top');
const nav = $('mdui-tabs');
const contactBtn = $('#contact-btn');
const worksBtn = $('#works-btn');
const sectionCards = document.querySelectorAll('mdui-card');
const header = $('header');

let observer;
let headerHeight;


function loadHeaderHeight() {
    if (observer) {
        sectionCards.forEach(card => {
            observer.unobserve(card);
        });
    };
    headerHeight = header.clientHeight;
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            nav.value = entries[0].target.id;
        };
    }, {
        threshold: 0.3,
        rootMargin: `-${headerHeight}px 0px 0px 0px`,
    });
    sectionCards.forEach(card => {
        observer.observe(card);
    });
};

window.onload = () => {
    mainAvatarAlt.style.display = 'none';
    mainAvatar.style.display = 'block';
};

jumpToTop.onclick = () => {
    window.scrollTo(0, 0);
    location.hash = '';
};

nav.onclick = () => {
    location.hash = nav.value;
};

contactBtn.onclick = () => {
    nav.value = 'contact';
};

worksBtn.onclick = () => {
    nav.value = 'works';
};





window.onresize = () => {
    loadHeaderHeight();
};
loadHeaderHeight();