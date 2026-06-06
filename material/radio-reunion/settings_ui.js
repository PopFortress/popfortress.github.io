const settEles = {
    playerVolume: {
        slider: $('.sett__player_volume'),
        label: $('.sett__volume_label'),
    },
};

settEles.playerVolume.slider.onchange = () => {
    settEles.playerVolume.label.innerHTML = `音量 ${settEles.playerVolume.slider.value}`;
    audio.volume = settEles.playerVolume.slider.value / 100;
};