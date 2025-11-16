mdui.setColorScheme('#EF9A9A');

const $ = (query) => mdui.$(query)[0];

const inputBox = $('#input-box');
const sendBtn = $('#send-btn');
const stopBtn = $('#stop-btn');
const chatPlace = $('.chat-place');
const latexViewer = $('.latex-viewer');
const latex = $('#latex');

const markdown = window.markdownit();

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
        createMessageCard({ sender: 'user', message: message, isMarkdown: false });
        setTimeout(() => {
            createMessageCard({
                sender: 'ai',
                message: '<mdui-circular-progress></mdui-circular-progress> Thinking...',
                isMarkdown: false
            });
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
    createMessageCard({
        sender: 'ai',
        message: eval(`data.${remoteURLObj.path}`),
        isMarkdown: true
    });

    inputBox.readonly = false;
    inputBox.value = '';
    stopBtn.style.display = 'none';
    sendBtn.style.display = 'block';
};

xhr.onerror = () => {
    chatPlace.lastChild.remove();
    createMessageCard({ sender: 'ai', message: 'Something went wrong, please try again later.', isMarkdown: false});

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


/**
 * creates message card.
 * @param {{sender, msg, isMarkdown}} options options
 */
function createMessageCard(options) {
    const dropdown = document.createElement('mdui-dropdown');
    const messageWrapper = document.createElement('div');
    const label = document.createElement('div');
    const icon = document.createElement('mdui-icon');
    const name = document.createElement('div');
    const card = document.createElement('mdui-card');
    const menu = document.createElement('mdui-menu');
    const renderAsLatex = document.createElement('mdui-menu-item');
    
    dropdown.className = 'message-dropdown';
    dropdown.trigger = 'contextmenu';
    dropdown.openOnPointer = true;
    menu.className = 'message-menu';
    menu.dense = true;
    renderAsLatex.icon = 'functions';
    renderAsLatex.innerText = 'Render as LaTeX';

    label.className = 'name-label';
    name.className = 'name-label-text';
    icon.className = 'name-label-icon';
    card.className = 'message-card';
    card.slot = 'trigger';
    messageWrapper.className = 'message-wrapper';
    if (options.sender === 'user') {
        icon.name = 'person';
        name.innerText = 'You';
        messageWrapper.className += ' user';
    } else {
        icon.name = 'smart_toy';
        name.innerText = 'AI';
    };
    card.variant = 'filled';
    card.innerHTML = options.isMarkdown? markdown.render(options.message) : options.message;
    
    label.append(icon, name);
    menu.append(renderAsLatex);
    dropdown.append(card, menu);
    messageWrapper.append(label, dropdown);
    chatPlace.append(messageWrapper);

    setTimeout(() => {
        chatPlace.scrollTo({top: chatPlace.scrollHeight, left: 0, behavior: 'smooth'});
    }, 100);

    renderAsLatex.onclick = () => {
        const rawtext = window.getSelection().toString();
        latexViewer.open = true;
        katex.render(rawtext, latex, {
            throwOnError: false
        });
    };
};