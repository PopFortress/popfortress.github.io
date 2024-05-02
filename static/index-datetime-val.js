// JS script created by PopFortress (c) 2024 波普的温馨小阁
// Latest Update: 2024/4/23 18:58


// 常量定义
const dateEle = document.querySelector('.date');
const timeEle = document.querySelector('.time');
const DateObj = new Date();
const day_of_weekMap = { 0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };
const search_btn = document.querySelector('.search-btn');
const body = document.querySelector('body');
const blackDays = ["1/6", "1/8", "1/21", "1/27", "2/19", "3/12", "3/29", "4/29", "6/26", "7/6", "7/7", "8/5", "9/9", "9/18", "12/12", "12/13"];

// 节日对应表
let festivalsMap; // 在全局作用域中声明 data 变量
var todays_festival;

// 设置日期
var year = DateObj.getFullYear(); // --> number XXXX ex:2023
var month = DateObj.getMonth() + 1; // --> number X[X] ex:12    **注意：返回的值是从0开始计的！要+1
var day_of_month = DateObj.getDate(); // --> number X[X] ex:31
var day_of_week = DateObj.getDay(); // --> number(0~6) 0: 周日, 1: 周一, 2: 周二 ... 6: 周六
var day_of_week_word = day_of_weekMap[day_of_week];

const date_index = month.toString() + '/' + day_of_month.toString();


// 辅助函数：方便调试
/**
 * 根据date_index查询今日节日
 * @returns 节日名字符串
 */
function queryFestival() {
    return festivalsMap[date_index];
}

// 辅助函数：将数字转换为固定长度的字符串
function leftFillNum(num, targetLength) {
    return num.toString().padStart(targetLength, "0");
}


/**
 * 获取节日列表并显示在页面上
 * @author PopFortress<popfortress@163.com>
 * @license Apache-2.0
 * @return {void}
 */
async function fetchData() {
    try {
        const response = await fetch("./static/index-festivals.json");
        const data = await response.json();

        // 在这里处理获取到的 JSON 数据
        festivalsMap = data;
        todays_festival = queryFestival();

        // 设置节日部分
        if (todays_festival) {
            var date_format = `${year}年${month}月${day_of_month}日 星期${day_of_week_word} ${todays_festival}`;
        } else {
            var date_format = `${year}年${month}月${day_of_month}日 星期${day_of_week_word}`;
        };
        dateEle.textContent = date_format;

        // 判断哀悼日时给页面设置黑白滤镜
        blackDays.forEach(day => {
            if (date_index === day) {
                body.style.filter = 'grayscale(1)';
            };
        });

        // 调试打印
        console.log(festivalsMap);
        console.groupCollapsed('date-val');
        console.log(year);
        console.log(month);
        console.log(day_of_month);
        console.log(day_of_week_word);
        console.log(date_format);
        console.groupEnd('date-val');

    } catch (error) {
        console.error('Error:', error);
    };
};

fetchData();


// 辅助函数：根据语言偏好选择不同的搜索引擎搜索节日
function searchFestival(query) {
    var searchEngine;
    if (navigator.language === 'zh-CN') {
        searchEngine = 'https://cn.bing.com/search?q=';
    } else {
        searchEngine = 'https://www.google.com/search?q=';
    }
    window.open(searchEngine + query, '_blank');
}

// 节日搜索函数
search_btn.addEventListener('click', () => {
    if (todays_festival) {

        if (todays_festival.includes('&')) {
            const festivalLst = todays_festival.split('&');
            var festivalPrt = '';
            for (let index = 0; index < festivalLst.length; index++) {
                festivalPrt = festivalPrt + festivalLst[index];
            };

            searchFestival(`${month}月${day_of_month}日${festivalPrt}`);

        } else {
            searchFestival(`${month}月${day_of_month}日${todays_festival}`);
        };

    } else {
        search_btn.innerHTML = 'Σ(っ °Д °;)っ啊咧，今天暂时没有节日哦~';
        search_btn.style.cssText = 'color: #CF1E1E';
        setTimeout(() => {
            search_btn.innerHTML = '<i class="fa fa-search" style="vertical-align: text-top; margin-right: 5px;"></i> 在 Web 上搜索此节日 ';
            search_btn.style.cssText = undefined;
        }, 3000);
    };
});


// 设置时间更新循环
function updateTime() {
    var tempDate = new Date;
    var hr = tempDate.getHours();   // 这是新的构造对象，每次循环时都会更新，以保证不会获得重复的时间。
    var min = tempDate.getMinutes();
    var sec = tempDate.getSeconds();

    var hr_zfilled = leftFillNum(hr, 2);
    var min_zfilled = leftFillNum(min, 2);
    var sec_zfilled = leftFillNum(sec, 2);
    var time_format = `${hr_zfilled}:${min_zfilled}:${sec_zfilled}`;

    timeEle.textContent = time_format;
};

setInterval(updateTime, 1000);
