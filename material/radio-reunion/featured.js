// contains featured page logic

const radioStationsList = $('.featured__radio_stations_list');
const featuredLoading = $('.featured__loading');

async function fetchFeaturedList() {
    radioStationsList.innerHTML = '';
    featuredLoading.style.display = 'block';
    const res = await fetch('./featured.json');
    const data = await res.json();
    featuredLoading.style.display = 'none';
    data.radio_stations.forEach(item => {
        const listitem = document.createElement('mdui-list-item');
        listitem.headline = item.title;
        listitem.description = item.description;
        const cover = document.createElement('img');
        cover.slot = 'icon';
        cover.src = item.cover;
        cover.className = 'featured__item_cover';
        listitem.appendChild(cover);
        listitem.dataset.song_info = JSON.stringify(item);
        listitem.onclick = (e) => {
            player.switchLoadingState('loading');
            const song = JSON.parse(e.target.dataset.song_info);
            delete song.description;
            song.cover = `https://seep.eu.org/${song.cover}`;
            playlist.addItem(song);
            player.playSong(playlist.length - 1);
            lyricsDisplayer.resetLyrics();
        };
        radioStationsList.appendChild(listitem);
    });
};

