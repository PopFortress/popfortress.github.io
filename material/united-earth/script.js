mdui.setColorScheme('#1976D2');
const $ = (query) => mdui.$(query)[0];
const regionSelect = $('#region-select');
const genderRadioGroup = $('#gender-radio-group');
const form = $('form');
const app = $('.app');
const submitBtn = $('#submit-btn');
const nameInput = $('#name-input');
const ageInput = $('#age-input');
const langMenu = $('#lang-menu');
const labels = document.querySelectorAll('.label');
const maleRadio = $('#male');
const femaleRadio = $('#female');
let locale = 'zh';
let i;

langMenu.onchange = (e) => {
    locale = e.target.value;
    i = 0;
    if (locale == 'zh') {
        labels.forEach(label => {
            label.textContent = ['姓名', '年龄', '国家和地区', '性别'][i++];
        });
        maleRadio.textContent = '男性';
        femaleRadio.textContent = '女性';
        submitBtn.textContent = '提交';
        regionSelect.placeholder = '选择地区';
    } else {
        labels.forEach(label => {
            label.textContent = ['Name', 'Age', 'Region', 'Gender'][i++];
            maleRadio.textContent = 'Male';
            femaleRadio.textContent = 'Female';
            submitBtn.textContent = 'Submit';
            regionSelect.placeholder = 'Select Region';
        });
    };
};

async function fetchRegions() {
    let response = await fetch('https://163api.qijieya.cn/countries/code/list');
    let data = await response.json();
    data.data.forEach(type => {
        type.countryList.forEach(region => {
            let option = document.createElement('mdui-menu-item');
            option.textContent = `${region.zh}　${region.en}`;
            option.value = region.en;
            regionSelect.appendChild(option);
        });
    });
};

function submit() {
    if (checkForm()) {
        submitBtn.disabled = true;
        setTimeout(() => {
            if (locale == 'zh') {
                app.innerHTML = '已提交申请，正在等待审定结果。';
            } else {
                app.innerHTML = 'Your application has been submitted, please wait for the result.';
            };
            app.style.textAlign = 'center';
            app.style.justifyContent = 'center';
        }, 300);
    };
};

function checkForm() {
    if (regionSelect.value && genderRadioGroup.value && nameInput.value && ageInput.value) {
        submitBtn.disabled = false;
        return true;
    } else {
        submitBtn.disabled = true;
        return false;
    };
};

form.onsubmit = submit;
fetchRegions();
genderRadioGroup.onchange = checkForm;
nameInput.oninput = checkForm;
ageInput.oninput = checkForm;
regionSelect.onchange = checkForm;