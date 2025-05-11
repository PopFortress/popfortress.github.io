const checkboxWrapper = document.querySelector('.checkboxes');
const tipsWrapper = document.querySelector('.tips-wrapper');
const tips = document.querySelector('.tips');
const resetBtn = document.querySelector('.reset-btn');
mdui.setColorScheme('#2196F3');
var checkboxes;
var checkbox
var startTime;
var endTime;
var deltaTime;
var currentIndex = 0;

for (let i = 0; i < 100; i++) {
    checkbox = document.createElement('mdui-checkbox');
    if (i === 0) {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                startGame();
                e.target.disabled = true;
            };
        });
    } else if (i === 99) {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                endGame();
                e.target.disabled = true;
            };
        });
        checkbox.disabled = true;
    } else {
        checkbox.disabled = true;
    };
    checkboxWrapper.appendChild(checkbox);
    checkboxes = checkboxWrapper.querySelectorAll('mdui-checkbox');
};

checkboxes.forEach(element => {
    element.onchange = (e) => {
        currentIndex++;
        e.target.nextElementSibling.disabled = false;
        e.target.nextElementSibling.style.transform = `translateY(${randomPosOrNeg(5 + currentIndex)}px)`;
        if (e.target.checked) {
            checkboxWrapper.style.transform = `translateX(${-40 * currentIndex}px)`;
        } else {
            currentIndex--;
            checkboxWrapper.style.transform = `translateX(${-40 * (currentIndex - 2)}px)`;
        };
    };
});

function randomPosOrNeg(number) {
    const posOrNeg = Math.random() < 0.5 ? -1 : 1;
    return Math.min(Math.random() * number, window.innerHeight - 10) * posOrNeg;
};

function startGame() {
    tipsWrapper.style.opacity = 0;
    tipsWrapper.style.pointerEvents = 'none';
    startTime = Date.now();
};

function endGame() {
    endTime = Date.now();
    deltaTime = endTime - startTime;
    tipsWrapper.style.opacity = 1;
    tipsWrapper.style.pointerEvents = 'auto';
    resetBtn.style.display = 'inline-flex';
    tips.innerHTML = `Your time was ${deltaTime / 1000} seconds.`;
};

checkboxWrapper.scrollTo({x: 0, y: 0, behavior: 'smooth'});

resetBtn.onclick = () => {
    location.reload();
};