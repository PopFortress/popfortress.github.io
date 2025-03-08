const timeRemainLabel = document.querySelector('.time-value');
const clickCountLabel = document.querySelector('.clicks-value');
const latestCpsLabel = document.querySelector('.latest-cps-value');
const highestCpsLabel = document.querySelector('.highest-cps-value');
const durationRadioGroup = document.querySelector('.duration-radio-group');
const clickingPad = document.querySelector('.clicking-pad');
var duration = 10;
var timeReamin = 10;
var clicks = 0;
var highestCps = 0;
var latestCps = 0;
var isBegin = false;

function updateStats() {
    clickCountLabel.textContent = clicks;
    timeRemainLabel.textContent = timeReamin;
    latestCpsLabel.textContent = latestCps;
    highestCpsLabel.textContent = highestCps;
};

function begin(e) {
    if (isBegin) {
        clicks += 1;
        updateStats();
    } else {
        isBegin = true;
        durationRadioGroup.disabled = true;
        e.target.textContent = '';
        clicks += 1;
        updateStats();
        setTimeout(() => {
            isBegin = false;
            e.target.textContent = '点击任意处以开始';
            clearInterval(countdown);
            timeReamin = duration;
            durationRadioGroup.disabled = false;
            clickingPad.disabled = true;
            setTimeout(() => {
                clickingPad.disabled = false;
            }, 3000);
            latestCps = clicks / duration;
            if (latestCps > highestCps) {
                highestCps = latestCps;
            };
            updateStats();
            clicks = 0;
        }, duration * 1000);
        countdown = setInterval(() => {
            timeReamin -= 1;
            updateStats();
        }, 1000);
    };
};

function handleClick(e) {
    if (!clickingPad.disabled) {
        begin(e);
    };
};


clickingPad.onclick = handleClick;

durationRadioGroup.onchange = (e) => {
    duration = parseInt(e.target.value);
    timeReamin = duration;
};