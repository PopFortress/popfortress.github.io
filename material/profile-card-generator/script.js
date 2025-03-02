const avatarInput = document.querySelector('#avatar-input');
const avatarBox = document.querySelector('.avatar-box');
const ageSlider = document.querySelector('.age-slider');
const ageLabel = document.querySelector('.age-value');
const heightSlide = document.querySelector('.height-slider');
const heightLabel = document.querySelector('.height-value');
const nameField = document.querySelector('.name-field');
const genderRadios = document.querySelector('.gender-radio-group');
const weightField = document.querySelector('.weight-field');
const birthdayField = document.querySelector('.birthday-field');
const locationRadios = document.querySelector('.location-radio-group');
const applyBtn = document.querySelector('.apply-btn');
const prvAvatar = document.querySelector('.prv-avatar');
const prvName = document.querySelector('.prv-name');
const prvSecondaryInfo = document.querySelector('.prv-secondary');
const prvThirdInfo = document.querySelector('.prv-third');
const prvBirthday = document.querySelector('.prv-birthday');
const prvLocation = document.querySelector('.prv-location');

avatarInput.onchange = function () {
    const reader = new FileReader();
    reader.onload = function (e) {
        avatarBox.src = e.target.result;
    };
    reader.readAsDataURL(this.files[0]);
};

ageSlider.oninput = () => {
    ageLabel.textContent = ageSlider.value;
};
heightSlide.oninput = () => {
    heightLabel.textContent = `${heightSlide.value} cm`;
};

applyBtn.onclick = () => {
    prvAvatar.src = avatarBox.src;
    prvName.textContent = nameField.value;
    prvSecondaryInfo.textContent = `${ageSlider.value} 岁　/　${genderRadios.value}`;
    prvThirdInfo.textContent = `身高: ${heightSlide.value} cm　/　体重: ${weightField.value} kg`;
    prvBirthday.textContent = birthdayField.value;
    prvLocation.textContent = locationRadios.value;
    window.scrollTo({top: 0, behavior:'smooth'});
};