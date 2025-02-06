const $ = mdui.$;
const footnoteIndicator = $('.footnote-indicator')[0];
const viewCount = $('.view-count')[0];
const likes = $('.likes')[0];
const shares = $('.shares')[0];
const comments = $('.comments')[0];
const danmaku = $('.danmaku')[0];
const updateBtn = $('.update-btn')[0];
const autoUpdateChip = $('.auto-update')[0];
const apiURL = 'https://www.whateverorigin.org/get?url=https://coco.codemao.cn/http-widget-proxy/https@SEP@api.bilibili.com/x/web-interface/view?bvid=BV1GJ411x7h7';

footnoteIndicator.onclick = () => {
    mdui.alert({
        headline: '注释',
        description: '根据每分钟增加 27 次播放量计算得来，不保证实际时间与计算结果完全匹配。',
        confirmText: '确定'
    });
};

updateBtn.onclick = updateStats;

function updateStats() {
    if (!document.hidden) {
        updateBtn.disabled = true;
        updateBtn.loading = true;
        updateBtn.textContent = '更新中...';
        fetch(apiURL + '&r=' +Math.random().toString())
            .then(response => {
                return response.json();
            })
            .then(raw_data => {
                var data = JSON.parse(raw_data['contents']);
                var stats = data['data']['stat'];
                likes.innerText = stats['like'];
                shares.innerText = stats['share'];
                comments.innerText = stats['reply'];
                danmaku.innerText = stats['danmaku'];
                viewCount.innerText = stats['view'];
                updateBtn.disabled = false;
                updateBtn.loading = false;
                updateBtn.textContent = '更新数据';
                mdui.snackbar({
                    message: '更新成功',
                    autoCloseDelay: 2000
                });
            })
            .catch(error => {
                mdui.alert({
                    headline: '发生错误',
                    description: '当前无法连接到服务器：' + error,
                    confirmText: '确定'
                });
                updateBtn.disabled = false;
                updateBtn.loading = false;
                updateBtn.textContent = '更新数据';
            });
    }
};

autoUpdateChip.onchange = () => {
    if (autoUpdateChip.selected) {
        intervalId = setInterval(updateStats, 30000);
    } else {
        clearInterval(intervalId);
    }
};

updateStats();
var intervalId = setInterval(updateStats, 30000);