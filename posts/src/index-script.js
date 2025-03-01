const listItems = document.querySelectorAll('.content mdui-list-item');
const searchInput = document.querySelector('.search-bar');
const searchBtn = document.querySelector('.search-btn');
const subheaders = document.querySelectorAll('.content mdui-list-subheader');

function addListItemIcon() {
    listItems.forEach(element => {
        element.endIcon = 'arrow_forward';
    });
}

function searchPosts() {
    subheaders.forEach(element => {
        element.style.display = 'none';
    });
    const searchText = searchInput.value.toLowerCase();
    listItems.forEach(element => {
        const title = element.textContent.toLowerCase();
        if (title.includes(searchText)) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
    if (!searchText) {
        subheaders.forEach(element => {
            element.style.display = 'block';
        });
    };
};

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchPosts();
    };
});
searchBtn.addEventListener('click', searchPosts);
searchInput.addEventListener('clear', () => {
    subheaders.forEach(element => {
        element.style.display = 'block';
    });
    listItems.forEach(element => {
        element.style.display = 'block';
    });
});


addListItemIcon();