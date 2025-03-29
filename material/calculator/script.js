const $ = (query) => {
    return mdui.$(query)[0];
};

var themeRadioValue;
var latestResult;
const themeDialog = $('.theme-dialog');
const themeRadioGroup = $('.theme-radio-group');
const themeDlgCancelBtn = $('.theme-dlg-cancel-btn');
const themeDlgConfirmBtn = $('.theme-dlg-confirm-btn');
$('.theme-btn').addEventListener('click', () => {
    themeDialog.open = true;
    themeRadioValue = themeRadioGroup.value;
});
themeDlgCancelBtn.onclick = () => {
    themeRadioGroup.value = themeRadioValue;
    themeDialog.open = false;
};
themeDlgConfirmBtn.onclick = () => {
    mdui.setTheme(themeRadioGroup.value);
    themeDialog.open = false;
};
const expressionCard = $('.expression');
const inputBtns = document.querySelectorAll('.input-btn');
inputBtns.forEach(element => {
    element.onclick = () => {
        expressionCard.innerHTML += element.id;
    };
});
$('#ac').onclick = () => {
    expressionCard.innerHTML = '';
};
$('#backspace').onclick = () => {
    expressionCard.innerHTML = expressionCard.innerHTML.slice(0, -1);
};
$('#equal').onclick = () => {
    try {
        expressionCard.innerHTML = eval(expressionCard.innerHTML);
        latestResult = expressionCard.innerHTML;
    } catch {
        expressionCard.innerHTML = 'Invalid expression';
    };
};
function copyExpression() {
    navigator.clipboard.writeText(expressionCard.innerHTML);
};
$('.copy').onclick = copyExpression;
$('.cut').onclick = () => {copyExpression(); expressionCard.innerHTML = '';};
$('.paste').onclick = () => {
    navigator.clipboard.readText().then((text) => expressionCard.innerHTML += text);
};
$('.history-btn').onclick = () => {
    mdui.dialog({
        icon: 'history',
        closeOnOverlayClick: true,
        description: latestResult
    });
};