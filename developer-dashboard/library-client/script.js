mdui.setColorScheme('#263238');

const $ = (query) => mdui.$(query)[0];
const addBtn = $('.add__btn');
const tbody = $('table tbody');
const keys = ["书名", "作者", "ISBN", "出版社", "定价"];

function addBookLine() {
    const tr = document.createElement('tr');
    for (let i = 0; i < 5; i++) {
        const td = document.createElement('td');
        const textfield = document.createElement('mdui-text-field');
        textfield.classList.add('table__input');
        textfield.variant = 'outlined';
        textfield.placeholder = keys[i];
        td.appendChild(textfield);
        tr.appendChild(td);
        
        if (i === 0) {
            setTimeout(() => {
                textfield.focus();
            }, 0);
        };
    };
    tbody.appendChild(tr);
};

addBtn.addEventListener('click', addBookLine);
window.onload = addBookLine;