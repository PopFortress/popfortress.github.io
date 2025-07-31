mdui.setColorScheme('#EF9A9A');
const $ = (query) => mdui.$(query)[0];

const mainAvatar = $('.main-avatar');
const mainAvatarAlt = $('.main-avatar-alt');
const jumpToTop = $('.jump-to-top');
const nav = $('mdui-tabs');
const contactBtn = $('#contact-btn');
const worksBtn = $('#works-btn');
const sectionCards = document.querySelectorAll('mdui-card');

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

const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
            nav.value = entry.target.id;
        };
    });
});

sectionCards.forEach(card => {
    io.observe(card);
});