
const __menuDrawers = document.querySelectorAll('fs-mdui-menu-drawer');
const __headers = document.querySelectorAll('fs-mdui-menu-drawer-header');
const __dialogs = document.querySelectorAll('dialog.fs-mdui-menu-drawer-dialog');

let __index = 0;
__headers.forEach(ele => {
    const dialog = __dialogs[__index];
    const drawer = __menuDrawers[__index++];

    const title = document.createElement('div');
    const closeBtn = document.createElement('mdui-button-icon');
    const divider = document.createElement('mdui-divider');

    if (drawer.dataset.icon) {
        const icon = document.createElement('mdui-icon');
        icon.className = 'fs-mdui-menu-drawer__icon';
        icon.name = drawer.dataset.icon;
        ele.appendChild(icon);
    };

    title.className = 'fs-mdui-menu-drawer__title';
    closeBtn.className = 'fs-mdui-menu-drawer__close';
    divider.style.height = '2px';
    
    title.innerHTML = drawer.dataset.title;
    closeBtn.icon = 'close';

    ele.appendChild(title);
    ele.appendChild(closeBtn);
    ele.after(divider);

    dialog.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            menudrawer.close(dialog);
        };
    });
    closeBtn.addEventListener('click', () => {
        menudrawer.close(dialog);
    });
});

class MenuDrawer {
    constructor () {
        this.version = '1.0.0';
    };
    open (dialog) {
        dialog.showModal();
        dialog.children[0].classList.add('fs-mdui-menu-drawer--open');
        dialog.classList.add('fs-mdui-menu-drawer-dialog--open');
        document.body.style.overflow = 'hidden';
    };
    close (dialog) {
        const drawer = dialog.children[0];
        drawer.classList.add('fs-mdui-menu-drawer--onclose');
        dialog.classList.add('fs-mdui-menu-drawer-dialog--onclose');
        setTimeout(() => {
            drawer.classList.remove('fs-mdui-menu-drawer--onclose');
            dialog.classList.remove('fs-mdui-menu-drawer-dialog--onclose');
            drawer.classList.remove('fs-mdui-menu-drawer--open');
            document.body.style.overflow = 'auto';
            dialog.close();
        }, 100);
    };
};

const menudrawer = new MenuDrawer();
