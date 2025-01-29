const listItems = document.querySelectorAll('.content mdui-list-item');
const searchInput = document.querySelector('.search-bar');
const searchBtn = document.querySelector('.search-btn');

function addListItemIcon() {
    listItems.forEach(element => {
        element.endIcon = 'arrow_forward';
    });
}

function searchPosts() {
    const searchText = searchInput.value.toLowerCase();
    listItems.forEach(element => {
        const title = element.textContent.toLowerCase();
        if (title.includes(searchText)) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
}

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchPosts();
    };
});
searchBtn.addEventListener('click', searchPosts);
searchInput.addEventListener('clear', () => {
    listItems.forEach(element => {
        element.style.display = 'block';
    });
});


addListItemIcon();