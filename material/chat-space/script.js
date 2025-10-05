mdui.setColorScheme('#EF9A9A');
const chatText = document.querySelector('div.chat-text');
const isFirstChat = !localStorage.isNotFirstChat;

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
let messageUpdated = true;
const holidayEndMonths = [10, 7, 5];
const holidayEndDays = {10: 8, 5: 5, 1: 2};


const CommonMessages = {
    general: [
        "今天天气怎样？",
        "你写作业了吗？",
        "你明天几点起床？",
        "你好。感觉今天适合干点大事。",
        "作业做完了吗？",
        "听说明天会下雨。",
        "你喜欢晴天还是雨天？",
        "明天是晴天吗？",
        "zzzZZZzzz",
        "你知道这些消息只会随机地重复出现吧？但希望你写了作业",
        "作业写完了吗？",
        "为什么你不喜欢写作业呢？"
    ],
    holiday: [
        "正在享受假期？",
        "你最好已经写完了作业。^_^",
        "又放假了？我建议先内卷再说。",
        "事已至此，先写作业吧！",
        "放假第一晚写完作业，遥遥领先所有人。",
        "想想你的同学现在在做什么？",
        "我记得你说过让我监督你写作业来着？",
        "你真的不去写作业吗？",
        "别看了，去写作业吧！！",
        "写完作业再玩就轻松多了！",
        "你不会告诉我你要把作业推到最后一天晚上吧？",
        "所以你还不想写作业？",
        "你每天起床后写作业的原动力是什么？"
    ],
};

const SpecialMessages = {
    holiday_time: {
        countdown: "假期只剩 {holiday_days_left} 天了，快去写作业！",
        day: "看看现在都 {hour} 点了，再不去写作业我妈不会放过你的。",
        day_left: "现在已经 {hour} 点了，今天又只剩不到 {day_left_hour} 小时了，你至少动动笔吧？"
    },
};

function getRawMessage() {
    switch (random(['common', 'special'])) {
        case 'common':
            return random(CommonMessages[random(Object.keys(CommonMessages))]);
        case 'special':
            const messageType = SpecialMessages[random(Object.keys(SpecialMessages))];
            return messageType[random(Object.keys(messageType))];
    };
};


function getComposedMessage() {
    const now = new Date();
    const rawMessage = getRawMessage();
    let composedMessage = rawMessage.replace('{hour}', now.getHours()).replace('{day_left_hour}', 24 - now.getHours())
    if (holidayEndMonths.includes(now.getMonth() + 1)) {
        composedMessage = composedMessage.replace('{holiday_days_left}', holidayEndDays[now.getMonth() + 1] - now.getDate());
    } else {
        composedMessage = composedMessage.replace('{holiday_days_left}', '不知道多少');
    };
    return composedMessage;
};

function updateMessageText() {
    if (messageUpdated) {
        messageUpdated = false;
        chatText.style.opacity = .4;
        setTimeout(() => {
            chatText.innerHTML = getComposedMessage();
            chatText.style.opacity = 1;
            messageUpdated = true;
        }, 400);
    };
};

chatText.innerHTML = isFirstChat ? '你好，欢迎来到这个专属于你我的聊天角落。点击继续。' : '欢迎回来，又见面了。';
setTimeout(() => {
    chatText.style.visibility = 'visible';
    chatText.style.opacity = 1;
}, 500);

chatText.onclick = updateMessageText;

if (isFirstChat) {
    localStorage.isNotFirstChat = true;
};