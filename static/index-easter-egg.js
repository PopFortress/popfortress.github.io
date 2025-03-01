const invoker = document.querySelector('.easter-egg-entrance');
const container = document.querySelector('.suspage-hl-wrapper');

var counter = 0;
invoker.addEventListener('click', function() {
    counter++;
    if (counter === 8) {
        const suspage_hl = document.createElement('a');
        suspage_hl.className = 'suspage-hl';
        suspage_hl.href = 'info/suspage';
        suspage_hl.textContent = '可疑的页面';
        container.appendChild(suspage_hl);
        container.style.marginTop = '50vh';
    };
});
