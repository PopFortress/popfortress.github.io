const sendBtn = document.querySelector('.send-btn');
const methodSelect = document.querySelector('.methods-select');
const urlInput = document.querySelector('.url-input');
const responseBodyText = document.querySelector('.response-body');
const loadingDlg = document.querySelector('.modal-loading-dlg');
const statusCodeLabel = document.querySelector('.status-code');
const uaInput = document.querySelector('.ua-input');
const payloadInput = document.querySelector('.payload-input');
const decodeBtn = document.querySelector('.decode-btn');
const corsSwitch = document.querySelector('.cors-proxy-switch');
const cancelReqBtn = document.querySelector('.cancel-req-btn');
var response;
var res;
var request = new XMLHttpRequest();
var timer;


methodSelect.addEventListener('change', (e) => {
    switch (e.target.value) {
        case '':
            e.target.value = 'get';
            payloadInput.style.display = 'none';
            break;
        case 'post':
            payloadInput.style.display = 'block';
            break;
        default:
            payloadInput.style.display = 'none';
            break;
    };
});

function handleRequest(url, method, payload) {
    if (corsSwitch.checked) {
        url = 'https://seep.eu.org/' + url;
    };
    request.open(method, url, true);
    if (method === 'post') {
        request.send(payload);
    } else {
        request.send();
    };
};

function cancelRequest() {
    request.abort();
    mdui.snackbar({
        message: 'Request has been cancelled.',
        autoCloseDelay: 1000,
        closeOnOutsideClick: true
    });
    loadingDlg.close();
};

function sendRequest() {
    loadingDlg.showModal();
    cancelReqBtn.style.display = 'none';
    timer = setTimeout(() => {
        cancelReqBtn.style.display = 'block';
    }, 2000);
    handleRequest(urlInput.value, methodSelect.value, payloadInput.value);
};

request.onload = () => {
    responseBodyText.value = request.responseText;
    statusCodeLabel.textContent = `Status: ${request.status}`;
    loadingDlg.close();
};

request.onerror = () => {
    responseBodyText.value = 'Something went wrong while sending the request.';
    statusCodeLabel.textContent = 'Status: -1';
    loadingDlg.close();
};

sendBtn.onclick = sendRequest;
urlInput.onkeyup = (e) => {
    if (e.key === 'Enter') {
        sendRequest();
    };
};

decodeBtn.onclick = () => {
    responseBodyText.value = JSON.stringify(JSON.parse(responseBodyText.value), null, 2);
};

uaInput.value = navigator.userAgent;
loadingDlg.oncancel = cancelRequest;
cancelReqBtn.onclick = cancelRequest;
loadingDlg.onclose = () => {
    clearTimeout(timer);
};