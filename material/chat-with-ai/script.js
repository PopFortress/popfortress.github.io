mdui.setColorScheme('#EF9A9A');

const $ = (query) => mdui.$(query)[0];

const inputBox = $('#input-box');
const sendBtn = $('#send-btn');
const stopBtn = $('#stop-btn');
const chatPlace = $('.chat-place');

inputBox.onfocus = () => {
    sendBtn.classList.add('focused');
};

inputBox.onblur = () => {
    sendBtn.classList.remove('focused');
};

const xhr = new XMLHttpRequest();

sendBtn.onclick = sendMessage;
inputBox.onkeydown = (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    };
};

let remoteURLs;
let remoteURLObj;
async function fetchURLs() {
    const res = await fetch('./remoteURLs.json');
    remoteURLs = await res.json();
    remoteURLObj = remoteURLs.glm;
};
fetchURLs();



function sendMessage() {
    const message = inputBox.value.trim();
    if (message) {
        createMessageCard('user', message);
        setTimeout(() => {
            createMessageCard('ai', '<mdui-circular-progress></mdui-circular-progress> Thinking...');
            xhr.open('GET', remoteURLObj.url + message);
            xhr.send();
        }, 200);

        inputBox.readonly = true;
        sendBtn.style.display = 'none';
        stopBtn.style.display = 'block';
    };
};

xhr.onload = () => {
    const data = JSON.parse(xhr.responseText);
    chatPlace.lastChild.remove();
    createMessageCard('ai', eval(`data.${remoteURLObj.path}`));

    inputBox.readonly = false;
    inputBox.value = '';
    stopBtn.style.display = 'none';
    sendBtn.style.display = 'block';
};

xhr.onerror = () => {
    chatPlace.lastChild.remove();
    createMessageCard('ai', 'Something went wrong, please try again later.');

    inputBox.readonly = false;
    stopBtn.style.display = 'none';
    sendBtn.style.display = 'block';
};

stopBtn.onclick = () => {
    xhr.abort();
    chatPlace.lastChild.remove();

    inputBox.readonly = false;
    inputBox.value = '';
    stopBtn.style.display = 'none';
    sendBtn.style.display = 'block';
};

function createMessageCard(sender, message) {
    const messageWrapper = document.createElement('div');
    const label = document.createElement('div');
    const icon = document.createElement('mdui-icon');
    const name = document.createElement('div');
    const card = document.createElement('mdui-card');

    label.className = 'name-label';
    name.className = 'name-label-text';
    icon.className = 'name-label-icon';
    card.className = 'message-card';
    messageWrapper.className = 'message-wrapper';
    if (sender === 'user') {
        icon.name = 'person';
        name.innerText = 'You';
    } else {
        icon.name = 'smart_toy';
        name.innerText = 'AI';
    };
    card.variant = 'filled';
    card.innerHTML = message;
    
    label.append(icon, name);
    messageWrapper.append(label, card);
    chatPlace.append(messageWrapper);

    setTimeout(() => {
        chatPlace.scrollTo({top: chatPlace.scrollHeight, left: 0, behavior: 'smooth'});
    }, 100);
};