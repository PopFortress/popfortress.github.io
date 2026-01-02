function loadMV() {
    const mvid = player.getCurrentSong().mvid;
    xhr.open('GET', `${apiServer}/mv/detail?mvid=${mvid}`);
    xhr.send();
    xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        mvVideo.poster = data.data.cover;
        xhr.open('GET', `${apiServer}/mv/url?id=${mvid}`);
        xhr.send();
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            mvVideo.src = data.data.url;
        };
    };
};