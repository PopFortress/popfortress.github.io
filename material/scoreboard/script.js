const nameScrnConfirmBtn = document.querySelector('.confirm-btn');
const p1Entry = document.querySelector('#p1');
const p2Entry = document.querySelector('#p2');
const increasementInput = document.querySelector('#increasement-input');
const decreasementInput = document.querySelector('#decreasement-input');
const pageCfg = document.querySelector('.page-profiles-cfg');
const pageScoreboard = document.querySelector('.page-scoreboard');
const p1Tag = document.querySelector('#p1-tag');
const p1Score = document.querySelector('#p1-score');
const p1AddFab = document.querySelector('#p1-add');
const p1RemoveFab = document.querySelector('#p1-remove');
const p2Tag = document.querySelector('#p2-tag');
const p2Score = document.querySelector('#p2-score');
const p2AddFab = document.querySelector('#p2-add');
const p2RemoveFab = document.querySelector('#p2-remove');
const p1Card = document.querySelector('#p1-card');
const p2Card = document.querySelector('#p2-card');
const p1Color = document.querySelector('#p1-color');
const p2Color = document.querySelector('#p2-color');
const backBtn = document.querySelector('.back-btn');
const rstScoresBtn = document.querySelector('.reset-scores-btn');

var player1;
var player2;
var scoreIncreasement;
var scoreDecreasement;
nameScrnConfirmBtn.onclick = () => {
    if (p1Entry.value && p2Entry.value && increasementInput.value && decreasementInput.value) {
        if (increasementInput.checkValidity() && decreasementInput.checkValidity()) {
            player1 = p1Entry.value;
            player2 = p2Entry.value;
            scoreIncreasement = parseInt(increasementInput.value);
            scoreDecreasement = parseInt(decreasementInput.value);
            pageCfg.style.display = 'none';
            pageScoreboard.style.display = 'flex';
            p1Tag.textContent = player1;
            p2Tag.textContent = player2;
            p1Card.style.background = p1Color.value;
            p2Card.style.background = p2Color.value;
            backBtn.style.display = 'block';
        };
    } else {
        mdui.snackbar({
            message: 'Please fill in all fields.',
            autoCloseDelay: 1000
        });
    };
};

backBtn.onclick = () => {
    pageScoreboard.style.display = 'none';
    pageCfg.style.display = 'block';
    backBtn.style.display = 'none';
};

p1AddFab.onclick = () => {
    p1Score.textContent = parseInt(p1Score.textContent) + scoreIncreasement;
};

p1RemoveFab.onclick = () => {
    p1Score.textContent = parseInt(p1Score.textContent) - scoreDecreasement;
};

p2AddFab.onclick = () => {
    p2Score.textContent = parseInt(p2Score.textContent) + scoreIncreasement;
};

p2RemoveFab.onclick = () => {
    p2Score.textContent = parseInt(p2Score.textContent) - scoreDecreasement;
};

rstScoresBtn.onclick = () => {
    p1Score.textContent = 0;
    p2Score.textContent = 0;
};