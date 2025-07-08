const $ = (query) => mdui.$(query)[0];

const durationInput = $('.duration-input');
const subjectInput = $('.subject-input');
const startBtn = $('.start-btn');
const labels = document.querySelectorAll('.label');
const subtitles = $('.subtitles');
const animationBox = $('.animation-box');
const animateWrapper = $('.animate-wrapper');
const broadcastAudio = $('audio');
const timerText = $('.countdown');
const resetBtn = $('.reset-btn');
const wakeLockCheckbox = $('.wake-lock-toggle');
var _remainMin = 0;
var _remainSec = 0;
var preExamInterval;
var ExamInterval;
var afterExamInterval;
var broadcastIndex = 0;
const noSleep = new NoSleep();
noSleep.enable();
wakeLockCheckbox.onchange = (e) => {
    if (e.target.checked) {
        noSleep.enable();
    } else {
        noSleep.disable();
    };
};

const signals = ['请监考员迅速到考务办公室领卷 Preparing Exam Papers.mp3',
    '预备上课铃 pre-class mention.mp3',
    '请监考员分发试卷 Monitor Distributing Papers.mp3',
    '正式上课铃 Beginning of class.mp3',
    '考试开始 Beginning of Exam Voice Signal.mp3',
    '考试结束 End of Exam Voice Signal.mp3',
    '下课铃 End of Class.mp3',
];
const intervalDurations = [20000, 60000, 10000, 210000, undefined, 10000];

startBtn.onclick = (e) => {
    e.target.disabled = true;
    setTimeout(() => {
        if (subjectInput.value && durationInput.value && durationInput.checkValidity()) {
            e.target.style.display = 'none';
            intervalDurations[4] = durationInput.valueAsNumber * 60 * 1000;
            start();
        } else {
            mdui.snackbar({message: '请填写所有字段'});
            e.target.disabled = false;
        };
    }, 1000);
};

labels.forEach(label => {
    label.onclick = (e) => {
        switch (e.target.dataset.name) {
            case 'subject':
                subjectInput.focus();
                break;
            case 'duration':
                durationInput.focus();
                break;
        };
    };
});

function subtitle(text) {
    subtitles.innerHTML = text;
};

function broadcast(filename) {
    broadcastAudio.src = `https://pan.superbed.cn/share/nbp8bkx8/${filename}`;
    broadcastAudio.play();
    if (filename === signals[0]) {
        broadcastAudio.onended = () => {
            if (broadcastIndex < 2) {
                broadcastAudio.play();
                broadcastIndex++;
            };
        };
    } else {
        broadcastAudio.onended = null;
    };
};

function countdown(interval) {
    _remainSec = _remainSec - 1;
    if (_remainSec < 0) {
        _remainMin = _remainMin - 1;
        _remainSec = 59;
    };
    timerText.textContent = `${_remainMin.toString().padStart(2, '0')}:${_remainSec.toString().padStart(2, '0')}`;
    if (_remainMin <= 0 && _remainSec <= 0) {
        eval(`clearInterval(${interval})`);
    };
};

function start() {
    animationBox.style.opacity = .6;
    subjectInput.readonly = true;
    durationInput.readonly = true;
    wakeLockCheckbox.style.display = 'inline-flex';
    for (let i = 0; i <= 3; i++) {
        _remainMin += intervalDurations[i];
    };
    _remainSec = (_remainMin % 60000) / 1000;
    _remainMin = Math.floor(_remainMin / 60000);
    preExamInterval = setInterval(countdown, 1000, 'preExamInterval');

    const steps = [
        { action: () => { subtitle('请监考员迅速到考务办公室领卷。'); broadcast(signals[0]); }, delay: 0},
        { action: () => { broadcast(signals[1]); }, delay: intervalDurations[0] },
        { action: () => { subtitle('请监考员分发试卷。'); broadcast(signals[2]); }, delay: intervalDurations[1] },
        { action: () => { broadcast(signals[3]); }, delay: intervalDurations[2] },
        { action: () => { subtitle('现在考试正式开始，请答题。'); broadcast(signals[4]);
            _remainMin = durationInput.valueAsNumber;
            _remainSec = 0;
            ExamInterval = setInterval(countdown, 1000, 'ExamInterval');
        }, delay: intervalDurations[3] },
        { action: () => { broadcast(signals[5]); subtitle('考试结束，请考生立即停止作答。');
            _remainMin = Math.floor((52000 + intervalDurations[5]) / 60000);
            _remainSec = (52000 + intervalDurations[5]) % 60000 / 1000;
            afterExamInterval = setInterval(countdown, 1000, 'afterExamInterval');
        }, delay: intervalDurations[4] },
        { action: () => { subtitle('双手垂下，坐在原位。'); }, delay: 21000 },
        { action: () => { subtitle('待监考员将答题卡、试卷、草稿纸清点完毕，'); }, delay: 3000 },
        { action: () => { subtitle('宣布离开，方可离开考场。'); }, delay: 5000 },
        { action: () => { broadcast(signals[6]);}, delay: intervalDurations[5] },
        { action: () => { resetBtn.style.display = 'block'; wakeLockCheckbox.style.display = 'none';}, delay: 23000},
    ];

    let index = 0;

    function nextStep() {
        if (index < steps.length) {
            const step = steps[index++];
            setTimeout(() => {
                step.action();
                nextStep();
            }, step.delay);
        };
    };

    nextStep();
};

resetBtn.onclick = () => {location.reload()};

animateWrapper.onclick = () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        $('html').requestFullscreen();
    };
};