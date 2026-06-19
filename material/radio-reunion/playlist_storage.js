const plSaveBtn = $('.playlist__save_btn');
const plLoadBtn = $('.playlist__load_btn');
const plLoadDialog = $('.playlist__load_dialog');
const playlistsList = $('.playlist__playlists_select_list');
const headerPlLoadBtn = $('.header__load_playlist_btn');

plSaveBtn.onclick = playlist.savePlaylist.bind(playlist);

headerPlLoadBtn.onclick = plLoadBtn.onclick = () => {
    plLoadDialog.open = true;
    playlistsList.innerHTML = '';
    const playlists = JSON.parse(localStorage.rr_playlists || '[]');
    [...playlists].reverse().forEach(list => {
        const listitem = document.createElement('mdui-list-item');
        listitem.dataset.list = JSON.stringify(list.tracks);
        listitem.innerHTML = list.name;
        listitem.onclick = () => {
            playlist.loadPlaylist(JSON.parse(listitem.dataset.list));
            plLoadDialog.open = false;
        };
        playlistsList.appendChild(listitem);
    });
};