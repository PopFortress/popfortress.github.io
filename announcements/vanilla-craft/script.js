const $ = (query, all = false) => all ? mdui.$(query) : mdui.$(query)[0];

const showBalance = $('.show-balance');
const rechargeBtn = $('.recharge');
const balanceNum = $('.balance-num');
const passcodeDialog = new mdui.Dialog('#passcode-dialog');
const loadingDialog = new mdui.Dialog('#loading-dialog', { modal: true, closeOnEsc: false, history: false });
const accountInput = $('#account-input');
const submitRecharge = $('#submit-recharge');
const nameserver = { nameserver: 'https://seep.eu.org/https://api.minecraftservices.com/users/profiles/minecraft/',
    avatar_server: 'https://api.mineatar.io/face/',
};
let balance = localStorage.store_balance ? +localStorage.store_balance : 0;
const pageTitle = document.title;
let rechargeAmount;
const accountAvatar = $('.account-avatar');
const accountName = $('.account-name');
const loginBtn = $('.login');
let passcodeDialogFor = 'login';
const logoutBtn = $('.logout');
const servicesContainer = $('.services-container');
const searchBtn = $('.search-btn');
const searchInput = $('.search-input');
let listItems;

if (localStorage.store_auth_username) {
    handleAuth(localStorage.store_auth_username);
};

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
                passcodeDialogFor = 'purchase';
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

submitRecharge.onclick = () => { handleAuth(accountInput.value); };

function updateBalance() {
    localStorage.store_balance = balance;
    balanceNum.innerHTML = `Tokens: ${balance}`;
};

async function handleAuth(username) {
    loadingDialog.open();
    const resp = await fetch(`${nameserver.nameserver}${username}`);
    const data = await resp.json();
    loadingDialog.close();
    if (data.id) {
        if (passcodeDialogFor === 'purchase') {
            mdui.confirm(`You're purchasing ${rechargeAmount} tokens for account <br> UUID: ${data.id} <br> Name: ${data.name} <br> Would you like to proceed?`,
                'Confirm Purchase',
                async () => {
                    balance += rechargeAmount;
                    updateBalance();
                    loadingDialog.open();
                    await fetch(`${nameserver.nameserver}pizza`);
                    loadingDialog.close();
                    mdui.snackbar('Your purchase has been completed successfully.');
                },
            );
        } else {
            accountAvatar.src = `${nameserver.avatar_server}${data.id}`;
            accountName.innerHTML = data.name;
            mdui.snackbar(`Welcome back, ${data.name}!`);
            loginBtn.innerHTML = '切换帐户';
            logoutBtn.style.display = 'inline';
            localStorage.store_auth_username = username;
        };
    } else {
        mdui.alert(data.errorMessage);
    };
};

loginBtn.onclick = () => {
    passcodeDialog.open();
    passcodeDialogFor = 'login';
};

logoutBtn.onclick = () => {
    localStorage.removeItem('store_auth_username');
    location.reload();
};

function purchaseItem(title, price) {
    mdui.prompt('Enter purchasing amount.', 'Purchase for Service', 
        (value) => {
            if (value > 0 && value < 101 && Number.isInteger(+value)) {
                const priceTotal = +value * price;
                mdui.confirm(`You're purchasing ${value} amounts for service ${title}, which costs ${priceTotal} tokens. <br> Would you like to proceed?`,
                    'Confirm Purchase',
                    async () => {
                        if (priceTotal <= balance) {
                            balance -= priceTotal;
                            updateBalance();
                            loadingDialog.open();
                            await fetch(`${nameserver.nameserver}pizza`);
                            loadingDialog.close();
                            mdui.snackbar('Your purchase has been completed successfully.');
                        } else {
                            mdui.alert(`Insufficient balance. You need ${priceTotal - balance} tokens more.`);
                        };
                    },
                );
            } else {
                mdui.alert('Invalid input. Amount should be an integer between 1 and 100.');
            };
        },
        (_, dialog) => {dialog.close();},
        { confirmOnEnter: true, defaultValue: 1}
    );
};

async function fetchStoreItems() {
    const resp = await fetch('./store.json');
    const data = await resp.json();
    data.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'mdui-card';
        if (item.image) {
            itemCard.innerHTML += `<div class="mdui-card-media"><img src="${item.image}"/></div>`;
        };
        itemCard.innerHTML += 
        `<div class="mdui-card-primary">
            <div class="mdui-card-primary-title">${item.title}</div>
            <div class="mdui-card-primary-subtitle">Tokens Required: ${item.price}</div>
        </div>
        
        <div class="mdui-card-content">${item.description}</div>`;
        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'mdui-card-actions';
        const purchaseItemBtn = document.createElement('button');
        purchaseItemBtn.className = 'mdui-btn mdui-color-theme mdui-ripple buy-item-btn'
        purchaseItemBtn.onclick = () => { purchaseItem(item.title, item.price) };
        purchaseItemBtn.innerHTML = 'add to cart';
        actionsWrapper.appendChild(purchaseItemBtn);
        itemCard.appendChild(actionsWrapper);
        servicesContainer.appendChild(itemCard);
    });
    listItems = document.querySelectorAll('.services-container .mdui-card');
};

fetchStoreItems();


function searchItems() {
    const searchText = searchInput.value.toLowerCase();
    listItems.forEach(item => {
        const title = item.querySelector('.mdui-card-primary-title').textContent.toLowerCase();
        const desc = item.querySelector('.mdui-card-content').textContent.toLowerCase();
        if (title.includes(searchText) || desc.includes(searchText)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        };
    });
    if (!searchText) {
        listItems.forEach(element => {
            element.style.display = 'block';
        });
    };
};

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchItems();
    };
});

searchBtn.onclick = searchItems;