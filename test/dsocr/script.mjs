
const doms = {
    apiKeyInput: document.getElementById('api_key_input'),
    apiKeySubmitBtn: document.getElementById('api_key_submit'),
}
let APIKEY = 'default';

if (localStorage.ds_api_key) {
    doms.apiKeyInput.value = localStorage.ds_api_key;
};

doms.apiKeySubmitBtn.addEventListener('click', () => {
    APIKEY = doms.apiKeyInput.value;
    doms.apiKeyInput.disabled = true;
});