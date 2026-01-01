// contains lyrics details page logic
var doms = {
    audio: audio,
    ul:document.querySelector('.lyrics__container ul'),
    container:document.querySelector('.lyrics__container'),
    loading: $('.lyrics__loading_wrapper'),
};

// 解析时间字符串
function parseTime(timeStr){
    let parts = timeStr.split(':');
    return +parts[0]*60 + +parts[1];
};

/**
 * 解析歌词字符串，得到歌词的对象数组
 * 每个歌词对象 
 * {time: 开始时间, words:歌词内容}
 */
function parseLrc(lrc){
    var result = [];
    var lines = lrc.split('\n'); // 字符串数组
    for(let i = 0; i < lines.length; i++){
        // 遍历lines
        let str = lines[i]; //每一句歌词字符串
        let parts = str.split(']'); //分割
        let timeStr = parts[0].substring(1); //截取时间
        var obj ={
            time:parseTime(timeStr),
            words: parts[1]
        }
        result.push(obj);
    }
    return result;
}

var lrcData = parseLrc(lyricsDisplayer.lyrics);


/**
 * 计算在当前情况下，播放器播放到第几秒的情况
 * lrcData数组中应该高亮显示的歌词下标
 */
function findIndex(){
    // 获取播放器的当前时间
    let curTime = doms.audio.currentTime;
    for(let i = 0; i<lrcData.length; i++){
        if(curTime<lrcData[i].time){
            return i-1;
        }
    }
    // 如果没有任何一句歌词显示，则返回-1
    // 如果找遍了都没有找到，说明播放到最后一句
    return lrcData.length-1;
}

// 创建歌词元素
function createLrcElement(){
    for(let i=0; i<lrcData.length; i++){
        let li = document.createElement('li');
        li.textContent = lrcData[i].words;
        doms.ul.appendChild(li);
    }
}
createLrcElement()



// 容器高度
var containerHeight = doms.container.clientHeight;
// li高度
var liHeight = doms.ul.children[0].clientHeight;
// 最大高度
var maxOffset = doms.ul.clientHeight - containerHeight;


// 设置ul元素的偏移量
function setOffset(){
    let index = findIndex();
    var offset = liHeight * index + liHeight/2 - containerHeight/2;
    if(offset < 0){
        offset = 0;
    }
    if(offset > maxOffset){
        offset = maxOffset;
    }
    doms.ul.style.transform = `translateY(-${offset}px)`;

    // 去掉之前的active样式
    let li1 = doms.ul.querySelector('.active');
    if(li1){
        li1.classList.remove('active');
    }

    let li2 = doms.ul.children[index];
    if(li2){
        li2.classList.add('active');
    }

    const activatedLine = $('.lyrics__container li.active')
    if (activatedLine) {
        activatedLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
}

// 事件监听
doms.audio.addEventListener('timeupdate', setOffset);

