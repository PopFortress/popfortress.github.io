const params = new URLSearchParams(window.location.search);
let categoryName;
let categoryInfo;
let isDescExpanded = false;
let episodesList;

const detailsImgCover = $('.details__img_cover');
const detailsTitle = $('.details__title');
const detailsYear = $('.details__year');
const detailsDesc = $('.details__desc');
const detailsDescExpandBtn = $('.details__desc_expand');
const episodesListEle = $('.episodes_list');
const loadingFrame = $('.loading_frame');

if (sessionStorage.entryInfo) {
    categoryInfo = JSON.parse(sessionStorage.entryInfo);
    if (params.has('category')) {
        fetchEpisodesList();
    } else {
        loadingFrame.style.display = 'none';
    };
};


if (params.has('category')) {
    categoryName = params.get('category');
    document.title = `${categoryName} - Watchnow TV - 📺 详情剧集列表`;
    detailsImgCover.src = categoryInfo.cover_img || placeholderImg;
    detailsTitle.innerText = categoryName;
    detailsYear.innerText = categoryInfo.year || '';
    detailsDesc.innerText = categoryInfo.desc;
};

detailsDescExpandBtn.addEventListener('click', () => {
    detailsDesc.classList.toggle('details__desc--expanded');
    isDescExpanded = !isDescExpanded;
    if (isDescExpanded) {
        detailsDescExpandBtn.innerText = '收起';
    } else {
        detailsDescExpandBtn.innerText = '显示全部';
    };
});

function fetchEpisodesList() {
    xhr.open('GET', accessToken ? `${api.server}/${categoryInfo.category}?access_token=${accessToken}` : `${api.server}/${categoryInfo.category}`);
    xhr.send();
    xhr.onload = () => {
        const base64 = JSON.parse(xhr.responseText).content;
        if (base64) {
            episodesList = JSON.parse(new TextDecoder().decode(base64ToBytes(base64)));

            episodesList.forEach(episode => {
                const listitem = document.createElement('mdui-list-item');
                listitem.headline = episode;
                listitem.endIcon = 'keyboard_arrow_right';
                listitem.addEventListener('click', (e) => {
                    const keyword = encodeURIComponent(`${categoryInfo.title} ${e.target.headline}`);
                    window.location.href = `https://search.bilibili.com/all?keyword=${keyword}`;
                });
                episodesListEle.appendChild(listitem);
            });
        };
        loadingFrame.style.display = 'none';
    };
};