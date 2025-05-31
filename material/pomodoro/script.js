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
const overlayBtn = $('.toggle-overlay');
const todosTitle = $('.todos-title');
var _status = 'stopped';
var latestStatus;
var _remainMin = 0;
var _remainSec = 0;
var workCountdownInterval;
var breakCountdownInterval;
var workTimeout;
var breakTimeout;
var newLstItem;
var newLstItemCheckbox;
var notify = false;
var isOverlay = false;
var overlayWindow;
var tasksRemaining = 0;
var tempArray;
var tempItem;
const frame = document.createElement('iframe');
frame.src = location.href;
frame.style.resize = 'both';
frame.style.width = '100vw';
frame.style.height = '100vh';
if (!localStorage.totalFocusingTime) {
    localStorage.totalFocusingTime = 0;
};
if (!localStorage.completedTasks) {
    localStorage.completedTasks = 0;
};
if (!localStorage.todos) {
    localStorage.todos = '[]';
};
Notification.requestPermission((result) => {
    if (result === 'granted') {
        notify = true;
    };
});

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
    workTimeout = setTimeout(() => {
        clearInterval(workCountdownInterval);
        localStorage.setItem('totalFocusingTime', parseInt(localStorage.totalFocusingTime) + parseInt(workInput.value));
        _remainMin = parseInt(breakInput.value);
        _remainSec = 0;
        navigator.vibrate(1000);
        mdui.dialog({
            headline: 'Time\'s up!',
            description: 'Working finished, what would you like to do next?',
            actions: [
                {text: 'End session', onClick: stopPomodoro},
                {text: 'Start break', onClick: breaking},
            ]
        });
        if (notify) {
            new Notification('Pomodoro Timer', {body: 'Focusing time is up.'});
        };
    }, (_remainMin * 60 + _remainSec) * 1000);
    workCountdownInterval = setInterval(countdown, 1000);
};

function breaking() {
    _status = 'breaking';
    statusText.textContent = 'Take a break now. zZ';
    mdui.setColorScheme('#2196F3');
    breakTimeout = setTimeout(() => {
        clearInterval(breakCountdownInterval);
        _remainMin = parseInt(workInput.value);
        _remainSec = 0;
        navigator.vibrate(1000);
        mdui.dialog({
            headline: 'Time\'s up!',
            description: 'Break finished, what would you like to do next?',
            actions: [
                {text: 'End session', onClick: stopPomodoro},
                {text: 'Start working', onClick: working},
            ]
        });
        if (notify) {
            new Notification('Pomodoro Timer', {body: 'Breaking time is up.'});
        };
    }, (_remainMin * 60 + _remainSec) * 1000);
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

function pausePomodoro() {
    latestStatus = _status;
    _status = 'paused';
    clearInterval(workCountdownInterval);
    clearInterval(breakCountdownInterval);
    clearTimeout(workTimeout);
    clearTimeout(breakTimeout);
    statusToggleFab.textContent = 'Resume';
    statusToggleFab.icon = 'play_arrow';
    statusText.textContent = 'Paused.';
    dotStatic.style.display = 'block';
    dot.style.display = 'none';
};


statusToggleFab.onclick = () => {
    switch (_status) {
        case 'stopped':
            if (workInput.checkValidity() && breakInput.checkValidity()) {
                if (workInput.value > 0 && breakInput.value > 0) {
                    statusToggleFab.textContent = 'Pause';
                    statusToggleFab.icon = 'pause';
                    workInput.disabled = true;
                    breakInput.disabled = true;
                    dotStatic.style.display = 'none';
                    dot.style.display = 'block';
                    _remainMin = parseInt(workInput.value);
                    _remainSec = 0;
                    working();
                } else {
                    mdui.snackbar({message: 'value out of range.',});
                };
            };
            break;
        case 'working':
            pausePomodoro();
            break;
        case 'breaking':
            pausePomodoro();
            break;
        case 'paused':
            statusToggleFab.textContent = 'Pause';
            statusToggleFab.icon = 'pause';
            dotStatic.style.display = 'none';
            dot.style.display = 'block';
            switch (latestStatus) {
                case 'working':
                    working();
                    break;
                case 'breaking':
                    breaking();
                    break;
            };
    };
};

function addTodoItem(item) {
    newLstItem = document.createElement('mdui-list-item');
    newLstItem.textContent = item;
    newLstItem.nonclickable = true;
    newLstItemCheckbox = document.createElement('mdui-checkbox');
    newLstItemCheckbox.slot = 'icon';
    newLstItem.appendChild(newLstItemCheckbox);
    todoItemsLst.appendChild(newLstItem);
    newLstItemCheckbox.dataset.tempItem = item;
    newLstItemCheckbox.onchange = (e) => {
        if (e.target.checked) {
            localStorage.completedTasks++;
            tasksRemaining--;
            updateTodoTitle();
            tempArray.splice(tempArray.indexOf(e.target.dataset.tempItem), 1);
            updateTodos();
        } else {
            if (localStorage.completedTasks > 0) {
                localStorage.completedTasks--;
            };
            tasksRemaining++;
            updateTodoTitle();
            tempArray.push(e.target.dataset.tempItem);
            updateTodos();
        };
    };
    tasksRemaining++;
    updateTodoTitle();
};

addTodoBtn.onclick = () => {
    mdui.prompt({
        headline: 'Add a New Item',
        description: 'What task would you like to focus on today?',
        textFieldOptions: {
            variant: 'outlined',
        },
    }).then((value) => {
        addTodoItem(value);
        tempArray.push(value);
        updateTodos();
    });
};

function updateTodoTitle() {
    if (tasksRemaining < 1) {
        todosTitle.textContent = `To Do Items`;
    } else {
        todosTitle.textContent = `To Do Items (${tasksRemaining})`;
    };
};

function updateTodos() {
    localStorage.todos = JSON.stringify(tempArray);
};

clearTodosBtn.onclick = () => {
    while (todoItemsLst.firstChild) {
        todoItemsLst.removeChild(todoItemsLst.firstChild);
    };
    tasksRemaining = 0;
    updateTodoTitle();
    tempArray = [];
    updateTodos();
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
        description: 'All your statistics will be reset. Are you sure?',
        confirmText: 'Proceed',
    }).then(() => {
        localStorage.totalFocusingTime = 0;
        localStorage.completedTasks = 0;
        focusingTimeText.textContent = '0h 0m';
        completedTasksText.textContent = '0';
    });
};

window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (_status === 'working' || _status === 'breaking') {
            pausePomodoro();
        };
    };
});

overlayBtn.onclick = async () => {
    if (isOverlay) {
        isOverlay = false;
        overlayWindow.close();
    } else {
        isOverlay = true;
        overlayWindow = await window.documentPictureInPicture.requestWindow();
        overlayWindow.document.body.style.margin = '0';
        overlayWindow.document.body.style.overflow = 'hidden';
        overlayWindow.document.body.append(frame);
    };
};

tempArray = JSON.parse(localStorage.todos);
tempArray.forEach(addTodoItem);