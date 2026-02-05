mdui.setColorScheme('#EF9A9A');

const $ = (query) => mdui.$(query)[0];
const xhr = new XMLHttpRequest();

xhr.onerror = () => {
    mdui.snackbar({ message: '请检查网络连接。' });
    switchStatus({ status: 'failure', text: '无法连接至服务器' });
};

const endpoint = 'https://gitee.com/api/v5/repos/popfortress/dev-data/contents/moments.json';
const access_token = localStorage.developer_access_token;


let moment = {
    text: '',
    location: '',
    time: '',
};

const loadingModal = $('.loading__dialog');
const textInputField = $('.text__text_field');
const publishBtn = $('.publish__btn');
const picturesAddBtn = $('.pictures__add_btn');
const picturesStepOne = $('.pictures__step_one');
const picturesStepTwo = $('.pictures__step_two');
const picturesNextStepBtn = $('.pirctures__next_step_btn');
const picturesUrlInput = $('.pictures__url_input');
const picturesDoneBtn = $('.pictures__done_btn');
const picturesPreviewBtn = $('.pictures__preview_btn');
const previewDialog = $('.preview__dialog');
const previewImage = $('.preview__image');
const previewLoading = $('.preview__loading');
const previewErrorWrapper = $('.preview__error_wrapper');

const locationsAddBtn = $('.locations__add_btn');
const locationsMethodSelect = $('.locations__method_select');
const locationsInputWrapper = $('.locations__input_wrapper');
const locationsManuallyInputBtn = $('.locations__manually_input_btn');
const locationsAutoDetectionBtn = $('.locations__auto_detection_btn');
const locationsInput = $('.locations__input');
const locationsDoneBtn = $('.locations__done_btn');
const locationsRemoveBtn = $('.locations__remove_btn');

const statusIndicator = $('.status__indicator');
const statusText = $('.status__text');
const statusLoading = $('.status__loading');
const statusIcon = $('.status__icon');
const statusContainer = $('.status__container');

loadingModal.showModal();


/**
 * Switch status
 * @param {object} options { status: 'success' | 'failure' | 'loading' | 'none', text: string}
 */
function switchStatus(options) {
    const status = options.status;
    const text = options.text;
    statusText.innerText = text;
    switch (status) {
        case 'success':
            statusIndicator.style.display = 'block';
            statusLoading.style.display = 'none';
            statusIcon.name = 'done';
            statusContainer.style.color = '#009688';
            setTimeout(() => {
                switchStatus({ status: 'none', text: '' });
            }, 3000);
            break;
        case 'failure':
            statusIndicator.style.display = 'block';
            statusLoading.style.display = 'none';
            statusIcon.name = 'close';
            statusContainer.style.color = '#B71C1C';
            setTimeout(() => {
                switchStatus({ status: 'none', text: '' });
            }, 3000);
            break;
        case 'loading':
            statusIndicator.style.display = 'block';
            statusLoading.style.display = 'block';
            statusIcon.name = '';
            statusContainer.style.color = '#FBC02D';
            break;
        case 'none':
            statusIndicator.style.display = 'none';
            statusLoading.style.display = 'none';
            statusIcon.name = '';
            statusContainer.style.color = 'inherit';
            break;
        default:
            break;
    };
};


window.onload = () => {
    loadingModal.close();
    textInputField.focus();
};

textInputField.oninput = textInputField.onchange = (e) => {
    if (e.target.value.trim()) {
        publishBtn.style.display = 'block';
        setTimeout(() => {
            publishBtn.style.opacity = 1;
        }, 0);
    } else {
        publishBtn.style.opacity = 0;
        setTimeout(() => {
            publishBtn.style.display = 'none';
        }, 300);
    };
};

function resetPicturesFrame() {
    picturesStepOne.style.display = 'none';
    picturesStepTwo.style.display = 'none';
    picturesAddBtn.textContent = '添加图片';
    picturesAddBtn.icon = 'add_a_photo--outlined';
    locationsAddBtn.style.display = 'block';
};

picturesAddBtn.onclick = () => {
    if (picturesStepOne.style.display !== 'flex') {
        if (picturesStepTwo.style.display === 'flex') {
            resetPicturesFrame();
            return;
        };
        picturesStepOne.style.display = 'flex';
        picturesAddBtn.textContent = '取消';
        picturesAddBtn.icon = 'close';
        locationsAddBtn.style.display = 'none';
    } else {
       resetPicturesFrame();
    };
};

picturesNextStepBtn.onclick = () => {
    picturesStepOne.style.display = 'none';
    picturesStepTwo.style.display = 'flex';
    picturesUrlInput.value = '';
    picturesUrlInput.focus();
    picturesPreviewBtn.style.display = picturesDoneBtn.style.display = 'none';
};

picturesUrlInput.oninput = picturesUrlInput.onchange = (e) => {
    if (e.target.value.trim()) {
        picturesPreviewBtn.style.display = picturesDoneBtn.style.display = 'block';
    } else {
        picturesPreviewBtn.style.display = picturesDoneBtn.style.display = 'none';
    };
};

picturesPreviewBtn.onclick = () => {
    previewErrorWrapper.style.display = 'none';
    previewImage.style.display = 'inline';
    previewLoading.style.display = 'block';
    previewDialog.open = true;
    previewImage.src = picturesUrlInput.value.trim();
};

previewImage.onload = () => {
    previewLoading.style.display = 'none';
};

previewImage.onerror = () => {
    previewLoading.style.display = previewImage.style.display = 'none';
    previewErrorWrapper.style.display = 'flex';
};

picturesDoneBtn.onclick = () => {
    textInputField.value += `\n<img src='${picturesUrlInput.value.trim()}'>`;
    resetPicturesFrame();
    publishBtn.style.display = 'block';
    setTimeout(() => {
        publishBtn.style.opacity = 1;
    }, 0);
};

function resetLocationsFrame() {
    locationsMethodSelect.style.display = 'none';
    locationsInputWrapper.style.display = 'none';
    if (!moment.location) {
        locationsAddBtn.textContent = '添加位置';
        locationsAddBtn.icon = 'add_location_alt--outlined';
    } else {
        locationsAddBtn.textContent = moment.location;
        locationsAddBtn.icon = 'location_on--outlined';
    };
    picturesAddBtn.style.display = 'block';
};


locationsAddBtn.onclick = () => {
    if (locationsMethodSelect.style.display !== 'flex') {
        if (locationsInputWrapper.style.display === 'flex') {
            resetLocationsFrame();
            return;
        };
        locationsMethodSelect.style.display = 'flex';
        locationsAddBtn.textContent = '取消';
        locationsAddBtn.icon = 'close';
        picturesAddBtn.style.display = 'none';
    } else {
       resetLocationsFrame();
    };
};

locationsManuallyInputBtn.onclick = () => {
    locationsMethodSelect.style.display = 'none';
    locationsInputWrapper.style.display = 'flex';
    locationsInput.focus();
    if (moment.location) {
        locationsInput.value = moment.location;
    } else {
        locationsInput.value = '';
        locationsDoneBtn.style.display = 'none';
    };
};

locationsInput.oninput = locationsInput.onchange = (e) => {
    if (e.target.value.trim()) {
        locationsDoneBtn.style.display = 'block';
    } else {
        locationsDoneBtn.style.display = 'none';
    };
};

locationsDoneBtn.onclick = () => {
    moment.location = locationsInput.value.trim();
    resetLocationsFrame();
    locationsAddBtn.textContent = moment.location;
    locationsAddBtn.icon = 'location_on--outlined';
};

locationsRemoveBtn.onclick = () => {
    moment.location = '';
    resetLocationsFrame();
    locationsAddBtn.textContent = '添加位置';
    locationsAddBtn.icon = 'add_location_alt--outlined';
};

locationsAutoDetectionBtn.onclick = () => {

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        switchStatus({ status: 'loading', text: `正在获取位置信息…（纬度：${latitude} °，经度：${longitude} °）`});
        searchForPlace(latitude, longitude);
    };

    function error() {
        switchStatus({ status: 'failure', text: '无法获取您的位置信息' });
    };

    if (!navigator.geolocation) {
        switchStatus({ status: 'failure', text: '此应用不支持地理位置' });
    } else {
        switchStatus({ status: 'loading', text: '定位中…'});
        navigator.geolocation.getCurrentPosition(success, error);
    };
};

function searchForPlace(latitude, longitude) {
    xhr.open('POST', 'https://www.mapchaxun.cn/api/getMapRegeo');
    const location = `{"location":"${latitude.toFixed(6)},${longitude.toFixed(6)}"}`;
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(location);
    xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        const result = data.result;
        const address = `${result.address_component.province}${result.address_component.city}${result.address}`;
        moment.location = address;
        resetLocationsFrame();
        locationsAddBtn.textContent = moment.location;
        locationsAddBtn.icon = 'location_on--outlined';
        switchStatus({ status: 'success', text: '位置信息已添加' });
    };
};


function base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
};

function bytesToBase64(bytes) {
    const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte),
    ).join("");
    return btoa(binString);
};

// publish logic
publishBtn.onclick = () => {
    const now = new Date();
    switchStatus({ status: 'loading', text: '正在验证访问令牌…' });
    if (!access_token) {
        switchStatus({ status: 'failure', text: '您尚未配置访问令牌。' });
        return;
    };
    switchStatus({ status: 'loading', text: '正在从源获取元数据…' });

    xhr.open('GET', endpoint);
    xhr.send();
    xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        switchStatus({ status: 'loading', text: '正在处理文件…' });
        const original_content = new TextDecoder().decode(base64ToBytes(data.content.replaceAll("\n", "")));
        const sha = data.sha;

        moment.text =  textInputField.value.trim().replaceAll("\n", "<br>");
        moment.time = `${now.getFullYear()}.${now.getMonth()+1}.${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
        if (!moment.location) {
            delete moment.location;
        };
        const temp_content = original_content.split(']')[0].concat(`,${JSON.stringify(moment)}]`);

        const modified_content = bytesToBase64(new TextEncoder().encode(temp_content));
        switchStatus({ status: 'loading', text: '正在推送更改…' });

        const body = new FormData();
        body.append('content', modified_content);
        body.append('message', 'moment update')
        body.append('sha', sha);
        body.append('access_token', access_token);

        xhr.open('PUT', endpoint);
        // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(body);
        xhr.onload = () => {
            if (xhr.status === 401) {
                switchStatus({ status: 'failure', text: '访问令牌无效或已过期。' });
            } else if (xhr.status === 200) {
                switchStatus({ status: 'success', text: '发布成功！'});
            } else {
                switchStatus({ status: 'failure', text: '当前无法完成更改。' });
            };
            publishBtn.style.opacity = 0;
            setTimeout(() => {
                publishBtn.style.display = 'none';
            }, 300);
        };
    };
};