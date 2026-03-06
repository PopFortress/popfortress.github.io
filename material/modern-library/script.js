mdui.setColorScheme('#263238');
const $ = (query) => mdui.$(query)[0];

let data = {
    book_count: 0,
    fetched_books: false,
};

let settings = {
    theme: 'auto',
};

const subtitle = $('.subtitle');
const settingsBtn = $('#settings-btn');
const settingsBtnIcon = $('#settings-btn-icon');
const searchInput = $('#search-input');
const searchFab = $('#search-fab');
const expandAllBtn = $('#expand-all-btn');
const loading = $('.loading');
const booksTable = $('#books-table');
const booksList = $('#books-list');
const optionsDialog = $('.options-dialog');
const authorToggle = $('#author-toggle');
const isbnToggle = $('#isbn-toggle');
const publisherToggle = $('#publisher-toggle');
const priceToggle = $('#price-toggle');
const closeDlgBtn = $('.close-dlg-btn');
const theadAuthor = $('#thead-author');
const theadIsbn = $('#thead-isbn');
const theadPrice = $('#thead-price');
const theadPublisher = $('#thead-publisher');
const tableContainer = $('.table__container');

const dictSettings = localStorage.dictionary_remote_settings;
const token = localStorage.developer_access_token;
const xhr = new XMLHttpRequest();
const baseURL = 'https://gitee.com/api/v5/repos/popfortress/dev-data/contents/library.json';
let remoteURL;
if (dictSettings) {
    const access_token = JSON.parse(dictSettings)['accessToken'];
    remoteURL = `${baseURL}?access_token=${access_token}`;
} else if (token) {
    const access_token = token;
    remoteURL = `${baseURL}?access_token=${access_token}`;
} else {
    remoteURL = baseURL;
};

xhr.onerror = () => {
    loading.style.display = 'none';
    mdui.snackbar({ message: '无法连接至服务器。'});
};

function base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
};

function updateText() {
    subtitle.innerHTML = `现有藏书 ${data.book_count} 册`;
};

updateText();

searchInput.oninput = () => {
    if (searchInput.value.trim()) {
        searchFab.style.display = 'block';
        setTimeout(() => {
            searchFab.style.opacity = 1;
        }, 100);
    } else {
        searchFab.style.opacity = 0;
        setTimeout(() => {
            searchFab.style.display = 'none';
        }, 500);
        const books = booksList.querySelectorAll('tr');
        books.forEach(book => {
            book.style.display = 'table-row';
        });
    };
};

searchFab.onmouseenter = () => {
    searchFab.extended = true;
};

searchFab.onmouseleave = () => {
    searchFab.extended = false;
};

async function fetchBooks() {
    xhr.open('GET', remoteURL);
    xhr.send();
    xhr.onload = () => {
        const base64 = JSON.parse(xhr.responseText);
        const rawBooks = JSON.parse(new TextDecoder().decode(base64ToBytes(base64.content)));
        const books = [...rawBooks].reverse();
        data.fetched_books = true;
        data.book_count = books.length;
        updateText();
        books.forEach(book => {
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            const td3 = document.createElement('td');
            const td4 = document.createElement('td');
            const td5 = document.createElement('td');
            td1.innerText = book[0];
            td2.innerHTML = book[1];
            td3.innerHTML = book[2];
            td4.innerHTML = book[3];
            td5.innerHTML = book[4] || '-';
            td1.className = 'name';
            td2.className = 'author';
            td3.className = 'isbn';
            td4.className = 'publisher';
            td5.className = 'price';
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
            booksList.appendChild(tr);
        });
        loading.style.display = 'none';
    };
};

expandAllBtn.onclick = async () => {
    expandAllBtn.disabled = true;
    setTimeout(() => {
        expandAllBtn.style.display = 'none';
        tableContainer.style.display = 'block';
    }, 1000);
};


loading.style.display = 'flex';
fetchBooks();

function searchBooks(keyword) {
    if (!booksTable.style.display) {
        expandAllBtn.style.display = 'none';
        booksTable.style.display = 'table';
    };
    loading.style.display = 'flex';
    const books = booksList.querySelectorAll('tr');
    let matched;
    books.forEach(book => {
        matched = false;
        book.childNodes.forEach(field => {
            if (field.innerText.toLowerCase().includes(keyword)) {
                book.style.display = 'table-row';
                matched = true;
            } else {
                if (!matched) {
                    book.style.display = 'none';
                };
            };
        });
    });
    loading.style.display = 'none';
};

searchFab.onclick = () => { searchBooks(searchInput.value.trim().toLowerCase()); };
searchInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        searchBooks(searchInput.value.trim().toLowerCase());
    };
};

settingsBtn.onclick = settingsBtnIcon.onclick = () => {
    optionsDialog.open = true;
};

closeDlgBtn.onclick = () => {
    optionsDialog.open = false;
};

authorToggle.onchange = () => {
    theadAuthor.style.display = authorToggle.checked ? 'table-cell' : 'none';
    booksList.childNodes.forEach(tr => {
        tr.childNodes.forEach(td => {
            if (td.className === 'author') {
                td.style.display = authorToggle.checked ? 'table-cell' : 'none';
            };
        });
    });
};

isbnToggle.onchange = () => {
    theadIsbn.style.display = isbnToggle.checked ? 'table-cell' : 'none';
    booksList.childNodes.forEach(tr => {
        tr.childNodes.forEach(td => {
            if (td.className === 'isbn') {
                td.style.display = isbnToggle.checked ? 'table-cell' : 'none';
            };
        });
    });
};

publisherToggle.onchange = () => {
    theadPublisher.style.display = publisherToggle.checked ? 'table-cell' : 'none';
    booksList.childNodes.forEach(tr => {
        tr.childNodes.forEach(td => {
            if (td.className === 'publisher') {
                td.style.display = publisherToggle.checked ? 'table-cell' : 'none';
            };
        });
    });
};

priceToggle.onchange = () => {
    theadPrice.style.display = priceToggle.checked ? 'table-cell' : 'none';
    booksList.childNodes.forEach(tr => {
        tr.childNodes.forEach(td => {
            if (td.className === 'price') {
                td.style.display = priceToggle.checked ? 'table-cell' : 'none';
            };
        });
    });
};