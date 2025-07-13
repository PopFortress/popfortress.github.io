const stockLastUpdate = document.querySelector('.stock .update-time');
const stockList = document.querySelector('.stock-list');

function fortune_hq(data) {
    stockLastUpdate.textContent = `更新时间：${data.time[0]}-${data.time[1]}-${data.time[2]} ${data.time[3]}:${data.time[4]}`;
    data.index.forEach(stock => {
        stockList.innerHTML += `<mdui-list-item nonclickable description="${stock[4]} (${stock[3]})">${stock[1]}　${stock[2]}</mdui-list-item>`;
    });
    stockList.innerHTML += `<mdui-list-item nonclickable description="${data['price_A1'][3]} (${data['price_A1'][4]})">${data['price_A1'][1]}　${data['price_A1'][2]}</mdui-list-item>`
};