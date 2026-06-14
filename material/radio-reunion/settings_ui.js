const settEles = {
    playerVolume: {
        slider: $('.sett__player_volume'),
        label: $('.sett__volume_label'),
    },
    playerPlayrate: {
        slider: $('.sett__player_playrate'),
        label: $('.sett__playrate_label'),
        preservePitchCheck: $('.sett__preserve_pitch_check'),
    },
};

settEles.playerVolume.slider.onchange = () => {
    settEles.playerVolume.label.innerHTML = `音量 ${settEles.playerVolume.slider.value}`;
    audio.volume = settEles.playerVolume.slider.value / 100;
};

settEles.playerPlayrate.slider.onchange = () => {
    settEles.playerPlayrate.label.innerHTML = `倍速 ${settEles.playerPlayrate.slider.value}x`;
    audio.playbackRate = settEles.playerPlayrate.slider.value;
};

settEles.playerPlayrate.preservePitchCheck.onchange = () => {
    audio.preservesPitch = settEles.playerPlayrate.preservePitchCheck.checked
};