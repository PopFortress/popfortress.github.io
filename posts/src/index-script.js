function addListItemIcon() {
    const listItems = document.querySelectorAll('.content mdui-list-item');
    listItems.forEach(element => {
        element.endIcon = 'arrow_forward';
    });
}

addListItemIcon();