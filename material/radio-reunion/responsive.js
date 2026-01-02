const MOBILE_BREAKPOINT = 425;
const playerControls = $('.player__controls');
const playerProgress = $('.player__progress');
const playerInfo = $('.player__info');
const playerContainer = $('.player__container');

function hideElements(elements) {
    elements.forEach((element) => {
        element.style.display = 'none';
    });
};

function showElements(elements, value) {
    elements.forEach((element) => {
        element.style.display = value;
    });
};

let controlsFullwidth = false;

function resizePlayer() {
    if (controlsFullwidth) {
        showElements([playerCover], 'block');
        showElements([playerControls], 'flex');
        playerInfo.style.width = playerProgress.style.width = 'inherit';
        playerContainer.style.width = 'auto';
        if (window.innerWidth < 710) {
            playerInfo.style.maxWidth = 'calc(100vw - 212px)';
            playerProgress.style.minWidth = 'calc(100vw - 222px - 1em)';
        } else {
            playerInfo.style.maxWidth = '500px';
            playerProgress.style.minWidth = '400px';
        };
        controlsFullwidth = false;
    } else {
        hideElements([playerCover, playerControls, playerLoading]);
        playerInfo.style.width = playerContainer.style.width = '100%';
        playerInfo.style.maxWidth = 'inherit';
        playerProgress.style.minWidth = 'inherit';
        playerProgress.style.width = '100%';
        playerProgress.style.display = 'flex';
        controlsFullwidth = true;
    };
};


function reloadUI() {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
        playerTitle.onclick = resizePlayer;
    } else {
        playerTitle.onclick = null;
    };
};

window.onresize = () => {
    if (controlsFullwidth) {
        mdui.confirm({
            headline: '窗口尺寸变更',
            description: '是否重新调整播放器布局？',
            onConfirm: resizePlayer,
        });
    };
    reloadUI();
};
reloadUI();