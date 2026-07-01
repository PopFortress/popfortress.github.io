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