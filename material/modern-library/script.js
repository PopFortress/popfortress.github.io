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
const closeDlgBtn = $('.close-dlg-btn');
const theadAuthor = $('#thead-author');
const theadIsbn = $('#thead-isbn');
const theadPublisher = $('#thead-publisher');

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
    const response = await fetch('./library.json');
    const books = await response.json();
    data.fetched_books = true;
    data.book_count = books.length;
    updateText();
    books.forEach(book => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        const td4 = document.createElement('td');
        td1.innerText = book[0];
        td2.innerHTML = book[1];
        td3.innerHTML = book[2];
        td4.innerHTML = book[3];
        td1.className = 'name';
        td2.className = 'author';
        td3.className = 'isbn';
        td4.className = 'publisher';
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        booksList.appendChild(tr);
    });
};

expandAllBtn.onclick = async () => {
    expandAllBtn.disabled = true;
    setTimeout(() => {
        expandAllBtn.style.display = 'none';
        booksTable.style.display = 'table';
    }, 1000);
};


loading.style.display = 'flex';
fetchBooks();
loading.style.display = 'none';

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