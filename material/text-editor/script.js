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


mdui.loadLocale((locale) => import(`https://unpkg.com/mdui@2/locales/${locale}.js`));
mdui.setLocale('zh-cn');

function updateUIScale() {
    editor.rows = Math.floor((window.innerHeight - 72) / 24);
    editor.style.height = window.innerHeight - 40 + 'px';
};

window.addEventListener('resize', updateUIScale);
updateUIScale();

renameMenuItem.onclick = () => {
    mdui.prompt({
        headline: '重命名',
        textFieldOptions: { variant: 'outlined' }
    });
};