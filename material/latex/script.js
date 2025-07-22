const $ = (query) => mdui.$(query)[0];

const latexInput = $('.latex-input');
const previewBtn = $('.preview-btn');
const latexImg = $('.latex-img');
const downloadBtn = $('.download-btn');
const resultContainer = $('.result-container');
let latexSource;

previewBtn.onclick = () => {
    latexSource = `https://www.zhihu.com/equation?tex=${encodeURIComponent(latexInput.value)}`
    latexImg.src = latexSource;
    downloadBtn.style.display = 'inline';
    downloadBtn.href = latexSource;
    resultContainer.style.display = 'block';
};

latexInput.oninput = () => {
    if (latexInput.value.trim()) {
        previewBtn.disabled = false;
    } else {
        previewBtn.disabled = true;
    };
};