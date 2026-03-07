mdui.setColorScheme('#263238');

const $ = (query) => mdui.$(query)[0];
const addBtn = $('.add__btn');
const tbody = $('table tbody');
const commitBtn = $('.commit__btn');
const keys = ["书名", "作者", "ISBN", "出版社", "定价", "操作"];

const access_token = localStorage.github_access_token;
const endpoint = `https://api.github.com/repos/popfortress/dev-data/contents/library.json`;
const xhr = new XMLHttpRequest();

xhr.onerror = () => {
    finishCommit('当前无法推送更改，请稍后再试');
};


function addBookLine() {
    const tr = document.createElement('tr');
    for (let i = 0; i < 6; i++) {
        const td = document.createElement('td');
        let textfield;
        if (i < 5) {
            textfield = document.createElement('mdui-text-field');
            textfield.classList.add('table__input');
            textfield.variant = 'outlined';
            textfield.placeholder = keys[i];
            textfield.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (i < 4) {
                        textfield.parentElement.nextElementSibling.children[0].focus();
                    } else {
                        addBookLine();
                    };
                };
            });
            td.appendChild(textfield);
        } else {
            const removeBtn = document.createElement('a');
            removeBtn.classList.add('table__remove_btn');
            removeBtn.innerText = '×'
            removeBtn.href = 'javascript:;';
            removeBtn.addEventListener('click', () => {
                tbody.removeChild(tr);
                if (!document.querySelector('table tbody tr')) {
                    commitBtn.disabled = true;
                };
            });
            td.appendChild(removeBtn);
        };
        tr.appendChild(td);
        
        if (i === 0) {
            setTimeout(() => {
                textfield.focus();
            }, 0);
        };
    };
    tbody.appendChild(tr);
    if (!commitBtn.loading) {
        commitBtn.disabled = false;
    };
};

addBtn.addEventListener('click', addBookLine);
window.onload = addBookLine;


function finishCommit(message) {
    mdui.snackbar({ message: message, autoCloseDelay: 2000 });
    commitBtn.disabled = commitBtn.loading = false;
};

function base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
};

function bytesToBase64(bytes) {
    const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte),
    ).join("");
    return btoa(binString);
};

commitBtn.addEventListener('click', () => {
    commitBtn.disabled = commitBtn.loading = true;

    if (!access_token) {
        finishCommit('您尚未配置访问令牌。');
        return;
    };

    let tableContents = [];
    document.querySelectorAll('table tbody tr').forEach((tr) => {
        const trContents = [];
        tr.childNodes.forEach((td) => {
            if (td.children[0].value !== undefined) {
                trContents.push(td.children[0].value);
            };
        });
        tableContents.push(trContents);
    });


    xhr.open('GET', endpoint);
    xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
    xhr.send();
    xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        const original_content = new TextDecoder().decode(base64ToBytes(data.content.replaceAll("\n", "")));
        const sha = data.sha;
        const temp_content = JSON.parse(original_content);

        tableContents.forEach(item => {
            temp_content.push(item);
        });
        const raw_content_modified = JSON.stringify(temp_content);
        const modified_content = bytesToBase64(new TextEncoder().encode(raw_content_modified));

        xhr.open('PUT', endpoint);
        xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        const body = JSON.stringify({
            content: modified_content,
            message: 'update library',
            sha: sha,
        });
        xhr.send(body);
        xhr.onload = () => {
            if (xhr.status === 401) {
                finishCommit('访问令牌无效或已过期。');
            } else if (xhr.status === 403) {
                finishCommit('当前已达 API 请求流量限制，请稍后重试。');
            } else if (xhr.status === 200) {
                finishCommit('更改已提交至远程仓库！');
            } else {
                finishCommit('当前无法完成更改。');
            };
        };
    };
});