const $ = (query, all = false) => all ? mdui.$(query) : mdui.$(query)[0];

const showBalance = $('.show-balance');
const rechargeBtn = $('.recharge');
const balanceNum = $('.balance-num');
const passcodeDialog = new mdui.Dialog('#passcode-dialog');
const loadingDialog = new mdui.Dialog('#loading-dialog', { modal: true, closeOnEsc: false, });
const accountInput = $('#account-input');
const submitRecharge = $('#submit-recharge');
const nameserver = 'https://seep.eu.org/https://api.minecraftservices.com/users/profiles/minecraft/';
let balance = localStorage.store_balance ? +localStorage.store_balance : 0;
const pageTitle = document.title;
let rechargeAmount;

showBalance.onclick = () => {
    mdui.confirm(`Your balance is ${balance} <br> Avaliable credit: ${balance.toFixed(2)}`, 'Your Balance',
        purchase,
        (dialog) => {dialog.close();},
        {
            confirmText: 'purchase',
            cancelText: 'close',
        },
    );
};

function purchase() {
    mdui.prompt('Enter credit amount.', 'Purchase', 
        (value) => {
            if (value > 0 && Number.isSafeInteger(+value)) {
                passcodeDialog.open();
                rechargeAmount = +value;
            } else {
                mdui.alert('Invalid input.');
            };
        },
        (_, dialog) => {dialog.close();},
        { confirmOnEnter: true },
    );
};

balanceNum.innerHTML = `Tokens: ${balance}`;

document.onvisibilitychange = () => {
    if (document.hidden) {
        document.title = `(Hidden) ${pageTitle}`;
        mdui.snackbar('您已离开 Vanilla Craft 服务商店，请注意您的资金和财产安全。');
    } else {
        document.title = pageTitle;
    };
};

rechargeBtn.onclick = purchase;

submitRecharge.onclick = async () => {
    loadingDialog.open();
    const resp = await fetch(`${nameserver}${accountInput.value}`);
    const data = await resp.json();
    loadingDialog.close();
    if (data.id) {
        mdui.confirm(`You're purchasing ${rechargeAmount} tokens for account <br> UUID: ${data.id} <br> Name: ${data.name} <br> Would you like to proceed?`,
            'Confirm Purchase',
            () => {
                balance += rechargeAmount;
                updateBalance();
                mdui.snackbar('Your purchase has been completed successfully.');
            },
        );
    } else {
        mdui.alert(data.errorMessage);
    };
};

function updateBalance() {
    localStorage.store_balance = balance;
    balanceNum.innerHTML = `Tokens: ${balance}`;
};