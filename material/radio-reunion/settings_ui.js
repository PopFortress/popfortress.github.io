const settEles = {
    playerVolume: {
        slider: $('.sett__player_volume'),
        label: $('.sett__volume_label'),
    },
    playerPlayrate: {
        slider: $('.sett__player_playrate'),
        label: $('.sett__playrate_label'),
        preservePitchCheck: $('.sett__preserve_pitch_check'),
        options: document.querySelectorAll('.sett__player_playrate__options mdui-menu-item'),
    },
    noSleepCheck: $('.sett__no_sleep_check'),
    titleLyricsCheck: $('.sett__show_title_lyrics'),
};

settEles.playerVolume.slider.onchange = () => {
    settEles.playerVolume.label.innerHTML = `音量 ${settEles.playerVolume.slider.value}`;
    audio.volume = settEles.playerVolume.slider.value / 100;
};

settEles.playerPlayrate.preservePitchCheck.onchange = () => {
    audio.preservesPitch = settEles.playerPlayrate.preservePitchCheck.checked;
};

settEles.playerPlayrate.options.forEach((option) => {
    option.onclick = () => {
        settEles.playerPlayrate.label.innerHTML = settEles.playerPlayrate.slider.value = `倍速 ${option.innerText}x`;
        audio.playbackRate = player.playbackRate = +option.innerText;
    };
});

settEles.noSleepCheck.onchange = () => {
    if (settEles.noSleepCheck.checked) {
        noSleep.enable();
        modifyAppSettings('keepScreenOn', true);
    } else {
        noSleep.disable();
        modifyAppSettings('keepScreenOn', false);
    };
};

if (appSettings.keepScreenOn) {
    settEles.noSleepCheck.checked = true;
    noSleep.enable();
};

settEles.titleLyricsCheck.onchange = () => {
    if (settEles.titleLyricsCheck.checked) {
        modifyAppSettings('showTitleLyrics', true);
    } else {
        modifyAppSettings('showTitleLyrics', false);
        document.title = APP_TITLE;
    };
};

if (appSettings.showTitleLyrics) {
    settEles.titleLyricsCheck.checked = true;
};