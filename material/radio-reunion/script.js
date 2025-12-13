const $ = (query) => mdui.$(query)[0];

const startOptionUrl = $('#start__url_option');
const audio = $('#player-audio');
const playerTitle = $('.player__title');
const playerArtist = $('.player__artist');
const playerCover = $('.player__cover');
const playerProgressbar = $('.player__progress-bar');
const playerTimeElapsed = $('.player__time_elapsed');
const playerDuration = $('.player__duration');
const playerLoading = $('.player__loading');
const playerPlayback = $('.player__playback_btn');

let player_info = {
    cover: '', title: '', artist: '', url: ''
};

function time_formatting(seconds) {
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60) < 10 ? '0' : ''}${Math.floor(seconds % 60)}`
};

function player_play_new(options) {
    Object.keys(options).forEach(key => {
        player_info[key] = options[key];
    });
    audio.src = player_info.url;
    playerCover.style.display = 'none';
    playerLoading.style.display = 'flex';
    playerTitle.innerText = player_info.title;
    playerArtist.innerText = player_info.artist;
    playerTimeElapsed.innerText = '0:00';
    audio.play();
};

audio.addEventListener('canplay', ()=> {
    if (audio.duration === Infinity) {
        playerDuration.innerText = '';
        playerProgressbar.disabled = true;
    } else {
        playerDuration.innerText =  time_formatting(audio.duration);
        playerProgressbar.disabled = false;
    };
    playerCover.backgroundImage = `url(${player_info.cover})`;
    playerLoading.style.display = 'none';
    playerCover.style.display = 'block';
});

audio.addEventListener('timeupdate', ()=> {
    playerTimeElapsed.innerText = time_formatting(audio.currentTime);
    playerProgressbar.value = (audio.currentTime / audio.duration) * 100;
})

audio.addEventListener('play', ()=> {
    playerPlayback.icon = 'pause';
});
audio.addEventListener('pause', ()=> {
    playerPlayback.icon = 'play_arrow';
});
playerPlayback.onclick = () => {
    if (player_info.url) {
        audio.paused ? audio.play() : audio.pause();
    };
};

startOptionUrl.onclick = ()=> {
    mdui.prompt({
        headline: "输入 URL.",
        textFieldOptions: {
            placeholder: "https://example.com/stream",
            pattern: '[a-zA-z]+://[^\]*',
        },
        onConfirm: (value) => {
            if (value.trim()) {
                const url = value.trim();
                player_play_new({
                    url: url,
                    cover: './radioreunion__1.1.png',
                    title: 'Radio Reunion',
                    artist: '团结电台'
                });
            } else {
                return false;
            }
        }
    })
}

mdui.loadLocale((locale) => import(`https://unpkg.com/mdui@2/locales/${locale}.js`));
mdui.setLocale('zh-cn');