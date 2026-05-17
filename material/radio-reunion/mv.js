const mvTitle = $('.mv__title');
const mvDesc = $('.mv__desc');
let mvidCache;

function loadMV() {
    const mvid = player.getCurrentSong().mvid;

    if (!(+mvidCache === mvid)) {
        mvidCache = mvid;
        xhr.open('GET', `${apiServer}/mv/detail%3Fmvid=${mvid}%26cookie=${authenticator.cookie}`);
        xhr.send();
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            mvVideo.poster = data.data.cover;
            mvTitle.innerText = data.data.name;
            mvDesc.innerText = data.data.desc ? `MV 简介：${data.data.desc}` : '';
            xhr.open('GET', `${apiServer}/mv/url%3Fid=${mvid}%26cookie=${authenticator.cookie}`);
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