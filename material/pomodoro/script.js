const $ = (query) => {
    return mdui.$(query)[0];
};

const noSleep = new NoSleep();
const wakeLockCheckbox = $('.wake-lock-checkbox');
const statusToggleFab = $('.status-toggle');
const workInput = $('.work-duration-input');
const breakInput = $('.break-duration-input');
const statusText = $('.status-indicator');
const dot = $('.dot');
const dotStatic = $('.dot-static');
const timerText = $('.timer');
const fullscreenBtn = $('.toggle-fullscreen');
const todoItemsLst = $('.todo-items-list');
const addTodoBtn = $('.add-todo-btn');
const clearTodosBtn = $('.clear-todos-btn');
var _status = 'stopped';
var _remainMin = 0;
var _remainSec = 0;
var workCountdownInterval;
var breakCountdownInterval;
var workTimeout;
var breakTimeout;
var newLstItem;
var newLstItemCheckbox;

wakeLockCheckbox.onchange = (e) => {
    if (e.target.checked) {
        noSleep.enable();
    } else {
        noSleep.disable();
    };
};

fullscreenBtn.onclick = (e) => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
        e.target.icon = 'fullscreen';
    } else {
        $('html').requestFullscreen();
        e.target.icon = 'fullscreen_exit';
    };
};

function countdown() {
    _remainSec = _remainSec - 1;
    if (_remainSec < 0) {
        _remainMin = _remainMin - 1;
        _remainSec = 59;
    };
    timerText.textContent = `${_remainMin.toString().padStart(2, '0')}:${_remainSec.toString().padStart(2, '0')}`;
};

function working() {
    if (breakCountdownInterval) {
        clearInterval(breakCountdownInterval);
    };
    _status = 'working';
    statusText.textContent = 'Focusing.';
    mdui.setColorScheme('#66BB6A');
    _remainMin = parseInt(workInput.value);
    _remainSec = 0;
    workTimeout = setTimeout(breaking, _remainMin * 60 * 1000);
    workCountdownInterval = setInterval(countdown, 1000);
};

function breaking() {
    clearInterval(workCountdownInterval);
    statusText.textContent = 'Take a break now. zZ';
    mdui.setColorScheme('#2196F3');
    _remainMin = parseInt(breakInput.value);
    _remainSec = 0;
    breakTimeout = setTimeout(working, _remainMin * 60 * 1000);
    breakCountdownInterval = setInterval(countdown, 1000);
};


statusToggleFab.onclick = () => {
    switch (_status) {
        case 'stopped':
            if (workInput.checkValidity() && breakInput.checkValidity()) {
                if (workInput.value > 0 && breakInput.value > 0) {
                    statusToggleFab.textContent = 'Stop';
                    statusToggleFab.icon = 'stop';
                    workInput.disabled = true;
                    breakInput.disabled = true;
                    dotStatic.style.display = 'none';
                    dot.style.display = 'block';
                    working();
                } else {
                    mdui.snackbar({message: 'value out of range.',});
                };
            };
            break;
        case 'working':
            _status ='stopped';
            clearInterval(workCountdownInterval);
            clearInterval(breakCountdownInterval);
            clearTimeout(workTimeout);
            clearTimeout(breakTimeout);
            statusToggleFab.textContent = 'Start';
            statusToggleFab.icon = 'play_arrow';
            workInput.disabled = false;
            breakInput.disabled = false;
            statusText.textContent = 'Ready to start.';
            dotStatic.style.display = 'block';
            dot.style.display = 'none';
            mdui.removeColorScheme();
            break;
    };
};

addTodoBtn.onclick = () => {
    mdui.prompt({
        headline: 'Add a New Item',
        description: 'What task would you like to focus on today?',
        textFieldOptions: {
            variant: 'outlined',
        },
    }).then((value) => {
        newLstItem = document.createElement('mdui-list-item');
        newLstItem.textContent = value;
        newLstItem.nonclickable = true;
        newLstItemCheckbox = document.createElement('mdui-checkbox');
        newLstItemCheckbox.slot = 'icon';
        newLstItem.appendChild(newLstItemCheckbox);
        todoItemsLst.appendChild(newLstItem);
    });
};

clearTodosBtn.onclick = () => {
    while (todoItemsLst.firstChild) {
        todoItemsLst.removeChild(todoItemsLst.firstChild);
    };
};