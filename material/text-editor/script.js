mdui.setColorScheme('#EF9A9A');

const $ = (query) => mdui.$(query)[0];

const editor = $('#editor');
const menuBtn = $('#menu-btn');
const fileOpenBtn = $('#file-open-btn');
const fileSaveBtn = $('#file-save-btn');
const newTabBtn = $('#new-tab-btn');
const newFileMenuItem = $('#new-file-menu-item');
const fileOpenMenuItem = $('#file-open-menu-item');
const rencentFilesMenuItem = $('#recent-files-menu-item');
const renameMenuItem = $('#rename-menu-item');
const fileSaveMenuItem = $('#file-save-menu-item');
const fileSaveAsBtn = $('#file-save-as-btn');
const findBtn = $('#find-btn');
const findReplaceBtn = $('#find-replace-btn');
const toggleFullscreen = $('#toggle-fullscreen');
const printBtn = $('#print-btn');
const settingsBtn = $('#settings-btn');

const fileTabs = $('#file-tabs');


const fileInput = $('#file-input');

const renameDialog = {
    dialog: $('#rename-dialog'),
    confirm: $('#rename-dlg-confirm'),
    cancel: $('#rename-dlg-cancel'),
    input: $('#rename-input'),
};

let newTabID = 1;

function setTabTitle(title) {
    $('.focused-tab .tab-title').innerText = title;
};
function getTabTitle() {
    return $('.focused-tab .tab-title').innerText;
};


mdui.loadLocale((locale) => import(`https://unpkg.com/mdui@2/locales/${locale}.js`));
mdui.setLocale('zh-cn');

function updateUIScale() {
    editor.rows = Math.floor((window.innerHeight - 72) / 24);
    editor.style.height = window.innerHeight - 40 + 'px';
};

window.addEventListener('resize', updateUIScale);
updateUIScale();

renameMenuItem.onclick = () => {
    renameDialog.dialog.open = true;
    renameDialog.input.value = $('.focused-tab .tab-title').innerText;
    setTimeout(() => {
        renameDialog.input.setSelectionRange(0, renameDialog.input.value.split('.').shift().length);
        renameDialog.input.focus();
    }, 100);
};

renameDialog.confirm.onclick = () => {
    const value = renameDialog.input.value.trim()
    if (value) {
        renameDialog.dialog.open = false;
        $('.focused-tab').value = $('.focused-tab .tab-title').innerText = value;
    };
};
renameDialog.cancel.onclick = () => {
    renameDialog.dialog.open = false;
};

renameDialog.input.onkeydown  = (e) => {
    if (e.key === 'Enter') {
        renameDialog.confirm.click();
    };
};

fileOpenMenuItem.onclick = fileOpenBtn.onclick = () => {
    fileInput.click();
}

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            if ($('.focused-tab').id === 'initial-tab') {
                editor.value = reader.result;
                setTabTitle(file.name);
            };
        };
        reader.readAsText(file);
    };
    fileInput.value = '';
});

fileSaveBtn.onclick = fileSaveMenuItem.onclick = () => {
    const content = editor.value;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getTabTitle();
    a.click();
};

newFileMenuItem.onclick = newTabBtn.onclick = () => {
    $('.focused-tab').classList.remove('focused-tab');

    const tab = document.createElement('mdui-tab');
    tab.value = `新建文本文档${newTabID++}.txt`;
    fileTabs.value = tab.value;
    const titleWrapper = document.createElement('div');
    titleWrapper.slot = 'custom';
    const tabTitle = document.createElement('div');
    tabTitle.className = 'tab-title';
    const close = document.createElement('mdui-button-icon');
    close.icon = 'close';
    close.className = 'close-tab';
    tab.classList.add('focused-tab');
    titleWrapper.append(tabTitle, close);
    tab.append(titleWrapper);

    newTabBtn.before(tab);
    setTabTitle(tab.value);
};