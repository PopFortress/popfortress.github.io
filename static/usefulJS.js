// Hello, World!💖🧡💛💚💙💜🤎

const para = document.getElementById('msg');
const html = document.querySelector('html');
const datasetTestPara = document.getElementById('dataset-test');
const math = Math;
const titleEle = html.firstChild.childNodes[5];
const body = document.querySelector('body');
const box_to_add_element = document.querySelector('#box-to-add-element');
const new_img = document.createElement('img');
const ua_panel = document.querySelector('textarea');
 

function __showToastMsg(msg) {
    console.log('已显示 Toast 通知：' + '%c' + msg, 'font-weight: bold;');

    para.style.visibility = 'visible';
    para.style.opacity = 1;
    para.textContent = msg;
    setTimeout(() => {
        para.style.opacity = '0';
        setTimeout(() => {
            para.style.visibility = 'hidden';
            para.textContent = '';
        }, 400);
    }, 3500);
}

function copyToClipboard(text){
    navigator.clipboard.writeText(text);
    __showToastMsg('copied!');
}

function copyConnect(){
    const pre = document.querySelector('pre');
    copyText__Compatibility(pre.innerText);
    const para = document.querySelector('p')
    __showToastMsg('copied!');
}

function copyText__Compatibility(textToCopy) {
    const tempInput = document.createElement('textarea');
    tempInput.value = textToCopy;
      
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
      
    console.log('复制成功');
}

function getUserConfirm() {
    usr = confirm('是否确认？')
    __showToastMsg(usr);
}

function changeTitle() {
    var title = prompt('请输入标题 (留空表示随机浮点数)');
    if (title) {
        titleEle.textContent = title;
        __showToastMsg(title)
    } else {
        if (title == '') {
            var randomTitle = math.random();
            titleEle.textContent = randomTitle;
            __showToastMsg(randomTitle);
        };
    };
}

function addDataset() {
    datasetTestPara.dataset.text = 'Hello, World!';
}

function rmDataset() {
    delete datasetTestPara.dataset.text;
}

function readDataset() {
    __showToastMsg(datasetTestPara.dataset.text);
}

function addCustomDataset() {
    var value = prompt('输入 dataset 的值');
    if (value) {
        datasetTestPara.dataset.text = value;
    }
}

function setContentDataset() {
    datasetTestPara.textContent = datasetTestPara.dataset.text;
}

function getPlatformInfo() {
    __showToastMsg(navigator.platform + '  ' + navigator.language);
}

function addElement() {
    new_img.src = '../static/ico-bitmap-done.png';
    new_img.width = 32;
    new_img.height = 32;
    box_to_add_element.appendChild(new_img);
}

function rmElement() {
    if (box_to_add_element.children.length == 4) {
        box_to_add_element.removeChild(new_img);
    } else {
        __showToastMsg('无法移除此 Node 对象');
    };
}

function getPageAddress() {
    __showToastMsg(location.protocol + '//' + location.hostname.split('/')[0] + ':' + location.port + location.pathname);
}

function getUA() {
    ua_panel.value = navigator.userAgent;
}

function copyUA() {
    ua_panel.select();
    document.execCommand('copy');
    __showToastMsg('copied!');
    setTimeout(() => {
        ua_panel.setSelectionRange(0, 0);
    }, 500);
}

let permission = undefined;
async function notific_permission() {
    permission = await Notification.requestPermission();
    __showToastMsg(permission);
}

function notific1() {
    if (permission == 'granted') {
        const notification = new Notification('通知#1');
        notification.addEventListener('error', (event) => {
            __showToastMsg('发送通知失败，转到控制台以获取详情。')
            console.log(event);
        })
    } else {
        __showToastMsg('客户端无权限进行此操作');
    }
}


// 下面的函数是一个JS文档注释示例

/**
 * 为 Nfunc 函数注册更新事件
 * @author PopFortress <popfortress@163.com>
 * @license Apache-2.0
 * @param {Function} Nfunc 目标 Nfunc 函数
 * @param {number} [duration] 间隔时间 default: 1000
 * @param {number} [exec_delay] 延迟执行时间 unit：毫秒, default: 0
 * @return {Function} 处理过的函数
 */
function nfunc_updated(Nfunc, duration = 1000, exec_delay = 0) {
    // do something
    // e.g.
    console.log('nfunc_updated: JS文档注释示例');
    console.group('example');
    console.log(Nfunc);
    console.log(duration);
    console.log(exec_delay);
    console.groupEnd('example');
};

// 指针放到函数名上就能看到提示
nfunc_updated(() => {
    console.log('example');
}, 100, 2000);




document.getElementById('erase-clipboard').addEventListener('click', () => {
    // 样式和代码都写好了发现Clipboard API没有清空剪贴板的接口...
    __showToastMsg('清空失败');
})