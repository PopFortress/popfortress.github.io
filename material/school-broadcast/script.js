mdui.setColorScheme('#EF9A9A');

let broadcast_status = false;
let timers = [];
let schedule;
const no_sleep = new NoSleep();
no_sleep.enable();

const $ = (query) => mdui.$(query)[0];
const statusSwitch = $('#status-switch');
if (!navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)) {
    statusSwitch.onmouseenter = () => {
        statusSwitch.extended = true;
    }
    statusSwitch.onmouseleave = () => {
        statusSwitch.extended = false;
    };
};
const fileserver_name = 'https://files.zohopublic.com.cn';
const filerserver = `${fileserver_name}/public/workdrive-public/download/`;
const filenames = [
    'yjkvsc8b36f6f646c4adab47c15cfc9302868?x-cli-msg=%7B%22linkId%22%3A%221HCuFcqiQRf-36sAc%22%2C%22isFileOwner%22%3Afalse%2C%22version%22%3A%221.0%22%2C%22isWDSupport%22%3Afalse%7D', // pre
    'yjkvscbfb44befc2c4e4b830eac33d9649197?x-cli-msg=%7B%22linkId%22%3A%221HCuFcqiQRe-36sAc%22%2C%22isFileOwner%22%3Afalse%2C%22version%22%3A%221.0%22%2C%22isWDSupport%22%3Afalse%7D', // begin
    'yjkvsf4fe0dcb66464c2b857a45bfd10879b8?x-cli-msg=%7B%22linkId%22%3A%221HCuFcqiQRg-36sAc%22%2C%22isFileOwner%22%3Afalse%2C%22version%22%3A%221.0%22%2C%22isWDSupport%22%3Afalse%7D', // end
    'yjkvs79f73b03d0934840ac51f6d4e066c605?x-cli-msg=%7B%22linkId%22%3A%221HCuFcqiTIB-36sAc%22%2C%22isFileOwner%22%3Afalse%2C%22version%22%3A%221.0%22%2C%22isWDSupport%22%3Afalse%7D' // school song
];

const loadWrapper = $('.load-wrapper');
const scheduleText = $('#schedule-text');
const fileserverCheckIcon = $('#file-server-check-icon');
const fileserverCheck = $('#file-server-check');
const loadingDialog = $('.loading-dialog');
const broadcastStatusIcon = $('#broadcast-status-icon');
const broadcastStatusText = $('#broadcast-status-text');
const broadcastStatus = $('.broadcast-status');

const audioEle = $('#broadcast-audio');

async function fetch_resources() {
    const res = await fetch('./schedule.txt');
    const data = await res.text();

    const schedule_res = await fetch('./schedule.json');
    schedule = await schedule_res.json();

    loadWrapper.style.display = 'none';
    scheduleText.innerHTML = data.split('\n').join('<br>');
};

async function check_server_connectivity() {
    const timeout = setTimeout(() => {
        fileserverCheckIcon.innerHTML = `<mdui-icon name="close" class="check-icon"></mdui-icon>`;
        fileserverCheck.style.color = 'rgb(var(--mdui-color-primary)';
    }, 10000);
    const res = await fetch(`https://seep.eu.org/${fileserver_name}`);
    if (res.status === 200) {
        fileserverCheckIcon.innerHTML = `<mdui-icon name="check" class="check-icon"></mdui-icon>`;
        fileserverCheck.style.color = 'rgb(var(--mdui-color-primary)';
        clearTimeout(timeout);
    };
};

window.onload = () => {
    fetch_resources();
    check_server_connectivity();
};

statusSwitch.onclick = () => {
    loadingDialog.open = true;
    setTimeout(() => {
        if (broadcast_status) {
            timers.forEach(timer => {
                clearTimeout(timer);
            });
            timers = [];
            broadcast_status = false;
            statusSwitch.icon = 'play_arrow';
            statusSwitch.textContent = '开始广播';
            broadcastStatus.style.color = 'inherit';
            broadcastStatusText.innerHTML = '广播已禁用';
            broadcastStatusText.style.fontWeight = 'inherit';
            broadcastStatus.style.opacity = '.7';
            audioEle.pause();
        } else {
            const dt = new Date();
            if (schedule) {
                schedule.forEach(item => {
                    if (dt.getHours() <= item[0]) {
                        if (dt.getHours() === item[0]) {
                            if (dt.getMinutes() >= item[1]) {
                                return;
                            };
                        };
                        timers.push(setTimeout(() => {
                            audioEle.src = `${filerserver}${filenames[item[2]]}`;
                            audioEle.play();
                        }, new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), item[0], item[1]) - dt));
                    };
                });
                if (timers.length <= 0) {
                    mdui.snackbar({ message: '当前时间段未广播。'});
                    loadingDialog.open = false;
                    return;
                };
            } else {
                mdui.snackbar({ message: '请重试。'});
                loadingDialog.open = false;
                return;
            };
            broadcast_status = true;
            statusSwitch.icon = 'stop';
            statusSwitch.textContent = '停止广播';
            broadcastStatus.style.color = 'rgb(var(--mdui-color-primary)';
            broadcastStatusText.innerHTML = '正在广播中';
            broadcastStatusText.style.fontWeight = '600';
            broadcastStatus.style.opacity = '1';
        };
        loadingDialog.open = false;
    }, 0);
};