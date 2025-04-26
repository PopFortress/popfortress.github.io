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
const focusingTimeText = $('.stats-focusing-time');
const completedTasksText = $('.stats-completed-tasks');
const tabs = $('mdui-tabs');
const resetStatsBtn = $('.reset-stats-btn');
var _status = 'stopped';
var _remainMin = 0;
var _remainSec = 0;
var workCountdownInterval;
var breakCountdownInterval;
var workTimeout;
var breakTimeout;
var newLstItem;
var newLstItemCheckbox;
if (!localStorage.totalFocusingTime) {
    localStorage.totalFocusingTime = 0;
};
if (!localStorage.completedTasks) {
    localStorage.completedTasks = 0;
};

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
    _status = 'working';
    statusText.textContent = 'Focusing.';
    mdui.setColorScheme('#66BB6A');
    _remainMin = parseInt(workInput.value);
    _remainSec = 0;
    workTimeout = setTimeout(() => {
        clearInterval(workCountdownInterval);
        localStorage.setItem('totalFocusingTime', parseInt(localStorage.totalFocusingTime) + parseInt(workInput.value));
        mdui.dialog({
            headline: 'Time\'s up!',
            description: 'Working finished, what would you like to do next?',
            actions: [
                {text: 'End session', onClick: stopPomodoro},
                {text: 'Start break', onClick: breaking},
            ]
        });
    }, _remainMin * 60 * 1000);
    workCountdownInterval = setInterval(countdown, 1000);
};

function breaking() {
    statusText.textContent = 'Take a break now. zZ';
    mdui.setColorScheme('#2196F3');
    _remainMin = parseInt(breakInput.value);
    _remainSec = 0;
    breakTimeout = setTimeout(() => {
        clearInterval(breakCountdownInterval);
        mdui.dialog({
            headline: 'Time\'s up!',
            description: 'Break finished, what would you like to do next?',
            actions: [
                {text: 'End session', onClick: stopPomodoro},
                {text: 'Start working', onClick: working},
            ]
        });
    }, _remainMin * 60 * 1000);
    breakCountdownInterval = setInterval(countdown, 1000);
};

function stopPomodoro() {
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
            stopPomodoro();
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
        newLstItemCheckbox.onchange = (e) => {
            if (e.target.checked) {
                localStorage.completedTasks++; 
            } else {
                localStorage.completedTasks--;
            };
        };
    });
};

clearTodosBtn.onclick = () => {
    while (todoItemsLst.firstChild) {
        todoItemsLst.removeChild(todoItemsLst.firstChild);
    };
};

tabs.onchange = (e) => {
    if (e.target.value === 'statistics') {
        focusingTimeText.textContent = Math.floor(parseInt(localStorage.totalFocusingTime) / 60) + 'h ' + localStorage.totalFocusingTime % 60 + 'm';
        completedTasksText.textContent = localStorage.completedTasks;
    };
};

resetStatsBtn.onclick = () => {
    mdui.confirm({
        headline: 'Reset Statistics',
        description: 'All your statistcs will be reset. Are you sure?',
        confirmText: 'Proceed',
    }).then(() => {
        localStorage.totalFocusingTime = 0;
        localStorage.completedTasks = 0;
        focusingTimeText.textContent = '0h 0m';
        completedTasksText.textContent = '0';
    });
};