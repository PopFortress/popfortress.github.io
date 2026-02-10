mdui.setColorScheme('#EF9A9A');

const $ = (query) => mdui.$(query)[0];
const pronounceBtn = $('.pronounce__btn');
const stopBtn = $('.stop__btn');
const dataField = $('.data__field');
const audio = $('.audio');

let proxyData;
let quesItems; // words list
let currentWordIndex = 0;
let timeElpased = 0; // in seconds
let isPlaying = false;

dataField.oninput = (e) => {
    if (e.target.value.trim()) {
        pronounceBtn.disabled = false;
    } else {
        pronounceBtn.disabled = true;
    };
};

stopBtn.onclick = stopPlaying;

pronounceBtn.onclick = () => {
    try {
        proxyData = JSON.parse(dataField.value.trim());
    } catch (error) {
        mdui.snackbar({ message: '输入数据无效。'});
        return;
    };
    console.log('processing data...');
    console.log(proxyData);
    pronounceBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    try {
        quesItems = proxyData.data[0].ques_item;   
    } catch (error) {
        mdui.snackbar({ message: '输入数据无效。'});
        return;
    };
    if (!quesItems) {
        mdui.snackbar({ messgae: '输入数据不完整或无效。'});
        return;
    };
    quesItems.forEach(item => {
        if (!item.audio) {
            mdui.snackbar({ message: '输入数据不完整或无效。'});
            return;
        };
    });
    stopBtn.textContent = `停止朗读（单词 1/${quesItems.length}） 00:00`;
    isPlaying = true;
    timeElpased = 0;
    currentWordIndex = 0;
    updateStatus();
    pronounce();
    audio.onended = () => {
        setTimeout(() => {
            if (isPlaying && currentWordIndex < quesItems.length - 1) {
                currentWordIndex++;
                timeElpased += audio.duration + 2.5;
                updateStatus();
                pronounce();
            } else {
                stopPlaying();
            };
        }, 2500);
    };
};

function updateStatus() {
    stopBtn.textContent = `停止朗读 （单词 ${currentWordIndex+1}/${quesItems.length}） ${formatTime(timeElpased)}`;
};

function formatTime(seconds) {
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
};

function pronounce() {
    audio.src = quesItems[currentWordIndex].audio;
    audio.play();
};

function stopPlaying() {
    isPlaying = false;
    audio.pause();
    stopBtn.style.display = 'none';
    pronounceBtn.style.display = 'block';
};