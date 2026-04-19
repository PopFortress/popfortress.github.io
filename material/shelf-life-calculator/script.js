mdui.setColorScheme('#1E88E5');

const $ = (query) => mdui.$(query)[0];

const productionDateInput = $('.input__production_date');
const shelfLifeInput = $('.input__shelf_life');
const shelfLifeUnitSelect = $('.shelf_life__unit_select');
const calculationBtn = $('.calculation__btn');
const statusText = $('.status__text');
const expirationDateText = $('.expiration_date');
const resultWrapper = $('.result__wrapper');
const daysRemainText = $('.days_remain');

productionDateInput.value = new Date().toISOString().split('T')[0];

calculationBtn.onclick = () => {
    if (shelfLifeInput.checkValidity() && shelfLifeInput.value && shelfLifeUnitSelect.value && productionDateInput.checkValidity() && productionDateInput.value) {
        calculateShelfLife();
    } else {
        mdui.snackbar( { message: '请填写所有信息并确保信息有效性。', closeOnOutsideClick: true} );
    };
};

function calculateShelfLife() {
    const productionDate = new Date(productionDateInput.value);
    const shelfLife = shelfLifeInput.valueAsNumber;
    const shelfLifeUnit = shelfLifeUnitSelect.value;

    let expirationDate = new Date(productionDate);

    switch (shelfLifeUnit) {
        case 'day':
            expirationDate.setDate(expirationDate.getDate() + shelfLife);
            break;
        case 'week':
            expirationDate.setDate(expirationDate.getDate() + shelfLife * 7);
            break;
        case 'month':
            expirationDate.setMonth(expirationDate.getMonth() + shelfLife);
            break;
        case 'year':
            expirationDate.setFullYear(expirationDate.getFullYear() + shelfLife);
            break;
        default:
            break;
    };

    resultWrapper.style.display = 'block';
    if (expirationDate > new Date()) {
        statusText.innerText = '未过期';
        statusText.style.color = '#009688';
    } else {
        statusText.innerText = '已过期';
        statusText.style.color = '#F44336';
    };
    expirationDateText.innerText = `保质日期至：${expirationDate.toISOString().split('T')[0]}`;
    daysRemainText.innerText = `剩余天数：${Math.floor((expirationDate - new Date()) / (1000 * 60 * 60 * 24)) + 1}`;
};