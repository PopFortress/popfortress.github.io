const mvTitle = $('.mv__title');
let mvidCache;

function loadMV() {
    const mvid = player.getCurrentSong().mvid;

    if (!(+mvidCache === mvid)) {
        mvidCache = mvid;
        xhr.open('GET', `${apiServer}/mv/detail%3Fmvid=${mvid}`);
        xhr.send();
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            mvVideo.poster = data.data.cover;
            mvTitle.innerText = data.data.name;
            xhr.open('GET', `${apiServer}/mv/url%3Fid=${mvid}`);
            xhr.send();
            xhr.onload = () => {
                const data = JSON.parse(xhr.responseText);
                mvVideo.src = data.data.url;
                mvVideo.play();
            };
        };
    } else {
        mvVideo.play();
    };
};