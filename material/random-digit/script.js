const $ = (query) => mdui.$(query)[0];

const rangeSlider = $('.range-slider');
const minInput = $('.min-input');
const maxInput = $('.max-input');
const rangeText = $('.range-text');
const tabs = $('mdui-tabs');
const generateBtn = $('.generate-btn');
const randomNumber = $('.random-number');
const averageText = $('.average-text');
const animationToggle = $('.animation-toggle');
const numbersList = $('.numbers-list');
let min;
let max;
let start, previousTimestamp;
let numbers = [];
let randomNum;

function syncRangeValues(e) {
    if (e.target === maxInput || e.target === minInput) {
        rangeSlider.value = [minInput.value, maxInput.value];
        min = minInput.valueAsNumber;
        max = maxInput.valueAsNumber;
    } else {
        minInput.value = min = rangeSlider.value[0];
        maxInput.value = max = rangeSlider.value[1];
    };
    if (min < max) {
        rangeText.textContent = `${min} ≤ x ≤ ${max}`;
    } else {
        rangeText.textContent = '无效范围';
    };
};

rangeSlider.onchange = syncRangeValues;
maxInput.oninput = syncRangeValues;
minInput.oninput = syncRangeValues;
syncRangeValues(rangeSlider);

tabs.onchange = (e) => {
    if (e.target.value === 'generate') {
        if (maxInput.checkValidity() && minInput.checkValidity() && min < max) {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
        };
    };
};

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

const calcAverage = () => (numbers.reduce((acc, curr) => acc + curr, 0) / numbers.length).toFixed(2);

function finalProcess() {
    numbers.push(randomNum);
    averageText.textContent = calcAverage();
    const listitem = document.createElement('mdui-menu-item');
    listitem.textContent = randomNum;
    listitem.onclick = (e) => {
        numbersList.removeChild(e.target);
    };
    numbersList.insertBefore(listitem, numbersList.firstChild);
};

function displayRandomNumber(timestamp) {
    if (start === undefined) {
        start = timestamp;
    };
    const elapsed = timestamp - start;
    if (previousTimestamp !== timestamp) {
        randomNum = getRandomInt(min, max + 1);
        randomNumber.textContent = randomNum;
    };
    if (elapsed < 2000) {
        previousTimestamp = timestamp;
        setTimeout(() => {
            window.requestAnimationFrame(displayRandomNumber);
        }, 50);
    } else {
        start = undefined;
        previousTimestamp = undefined;
        randomNumber.style.color = 'rgb(var(--mdui-color-primary))';
        generateBtn.disabled = false;
        finalProcess();
    };
};

generateBtn.onclick = () => {
    if (animationToggle.checked) {
        randomNumber.style.color = 'inherit';
        generateBtn.disabled = true;
        window.requestAnimationFrame(displayRandomNumber);
    } else {
        randomNumber.style.color = 'rgb(var(--mdui-color-primary))';
        randomNum = getRandomInt(min, max + 1);
        randomNumber.textContent = randomNum;
        finalProcess();
    };
};