const $ = (query) => mdui.$(query)[0];

const latexInput = $('.latex-input');
const previewBtn = $('.preview-btn');
const latexImg = $('.latex-img');
const downloadBtn = $('.download-btn');
const resultContainer = $('.result-container');
const expandBtn = $('.expand-btn');
const viewSettingsWrapper = $('.view-settings');
const centerCheck = $('.center-checkbox');
const whiteCheck = $('.white-checkbox');
const expnadIcon = $('.expand-icon');
const resultCard = $('.result-card');
let latexSource;
let expanded = false;

previewBtn.onclick = async () => {
    latexSource = `https://www.zhihu.com/equation?tex=${encodeURIComponent(latexInput.value)}`;
    latexImg.src = latexSource;
    const resp = await fetch(`https://api.allorigins.win/get?url=${latexSource}`);
    const data = await resp.json();
    const dataURL = data.contents;
    downloadBtn.style.display = 'inline';
    downloadBtn.href = dataURL;
    resultContainer.style.display = 'block';
    expandBtn.style.display = 'inline';
};

latexInput.oninput = () => {
    if (latexInput.value.trim()) {
        previewBtn.disabled = false;
    } else {
        previewBtn.disabled = true;
    };
};

expandBtn.onclick = () => {
    if (expanded) {
        viewSettingsWrapper.style.display = 'none';
        expnadIcon.innerHTML = 'keyboard_arrow_down';
        expanded = false;
    } else {
        viewSettingsWrapper.style.display = 'flex';
        expnadIcon.innerHTML = 'keyboard_arrow_up';
        expanded = true;
    };
};

centerCheck.onchange = () => {
    if (centerCheck.checked) {
        resultCard.style.justifyContent = 'center';
    } else {
        resultCard.style.justifyContent = 'safe center';
    };
};

whiteCheck.onchange = () => {
    if (whiteCheck.checked) {
        resultCard.style.backgroundColor = '#fff';
    } else {
        resultCard.style.backgroundColor = 'revert-layer';
    };
};