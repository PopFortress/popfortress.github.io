// Snake game smoke test: run snake.html's inline script in a stubbed DOM with a fake clock.
'use strict';
const fs = require('fs');
const html = fs.readFileSync('snake.html', 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)[1];

// ---------- minimal DOM stubs ----------
function makeEl(id) {
  const handlers = {};
  const el = {
    id, clientWidth: 460,
    classList: { add() {}, remove() {}, contains() { return false; } },
    addEventListener(ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); },
    textContent: '',
    icon: '',
    value: '5',
    open: false,
    setAttribute() {},
    style: {},
    _handlers: handlers,
  };
  if (id === 'game') {
    el.getContext = () => new Proxy({}, { get: (t, p) => {
      if (typeof p === 'string') return () => {};
      return t[p];
    }});
  }
  return el;
}
const ids = ['board','game','overlay','overlay-icon','overlay-text','score','best',
  'btn-toggle','btn-restart','speed','speed-value','final-score','final-best',
  'over-dialog','dlg-restart','d-up','d-down','d-left','d-right','d-restart'];
const els = {};
for (const id of ids) els[id] = makeEl(id);

const winHandlers = {};
global.document = {
  getElementById: (id) => els[id],
  documentElement: {},
  addEventListener() {},
};
global.window = {
  addEventListener(ev, fn) { (winHandlers[ev] = winHandlers[ev] || []).push(fn); },
  devicePixelRatio: 2,
  matchMedia: () => ({ addEventListener() {} }),
};
global.localStorage = (() => { const s = {}; return {
  getItem: (k) => (k in s ? s[k] : null),
  setItem: (k, v) => { s[k] = String(v); },
};})();
global.matchMedia = () => ({ addEventListener() {} });
global.getComputedStyle = () => ({ getPropertyValue: () => '103,80,164' });
global.mdui = { snackbar() {} };
global.AudioContext = class { constructor(){ this.currentTime = 0; }
  createOscillator(){ return { type:'', frequency:{value:0}, connect(){ return this; }, start(){}, stop(){} }; }
  createGain(){ return { gain:{ setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){ return this; } }; }
  destination = {}; };

// ---------- fake clock ----------
let now = 0, seq = 0, pending = [];
global.setTimeout = (fn, ms) => { const t = { fn, at: now + ms, id: ++seq, alive: true }; pending.push(t); return t.id; };
global.clearTimeout = (id) => { for (const t of pending) if (t.id === id) t.alive = false; };
function step(ms) {
  now += ms;
  const due = pending.filter((t) => t.alive && t.at <= now);
  pending = pending.filter((t) => !t.alive || t.at > now);
  for (const t of due) t.fn();
}

// ---------- run page script + expose internals ----------
// 注入到 IIFE 内部，以便访问闭包变量
const idx = script.lastIndexOf('})();');
if (idx < 0) { console.error('IIFE end not found'); process.exit(1); }
const hooked = script.slice(0, idx) +
  '\n;globalThis.__S = { get state(){return state}, get snake(){return snake}, get dir(){return dir}, get score(){return score}, get high(){return high}, setFood(f){food=f}, reset, startGame, pauseGame, toggleGame, setDir, tick };' +
  script.slice(idx);
eval(hooked);

// ---------- helpers ----------
let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ FAIL: ' + name); }
}
function key(k) { for (const fn of winHandlers.keydown) fn({ key: k, preventDefault() {} }); }
function fire(id, ev) { for (const fn of els[id]._handlers[ev] || []) fn({}); }
function fireSlider(ev) { for (const fn of els['speed']._handlers[ev] || []) fn({}); }

// ---------- test flow ----------
console.log('T1: 初始化');
check('state = ready', __S.state === 'ready');
check('蛇初始长度 4', __S.snake.length === 4);
check('蛇头在中心 (10,10)', __S.snake[0].x === 10 && __S.snake[0].y === 10);
check('初始分数 0', __S.score === 0);
check('棋盘渲染尺寸 = 460', els['game'].width === 920 && els['game'].height === 920); // 460 * dpr(2)

console.log('T2: 开始游戏并移动');
fire('overlay', 'click'); // 点击遮罩开始
check('state = running', __S.state === 'running');
const d0 = __S.dir;
step(200); // 第一拍
check('蛇向右移动一格', __S.snake[0].x === 11 && __S.snake[0].y === 10);
check('未吃到食物时长度不变', __S.snake.length === 4);

console.log('T3: 方向控制与禁止掉头');
key('ArrowUp');
step(200);
check('按上后蛇向上移动', __S.snake[0].y === 9 && __S.snake[0].x === 11);
key('ArrowDown'); // 当前向上，直接向下 = 掉头，应被忽略
step(200);
check('禁止直接掉头（仍向上）', __S.snake[0].y === 8);

console.log('T4: 吃到食物加分并增长');
__S.setFood({ x: 11, y: 7 }); // 放在蛇前进路径上
step(300);
check('吃到食物后分数 +1', __S.score === 1);
check('吃到食物后长度 +1', __S.snake.length === 5);

console.log('T5: 速度调节');
els['speed'].value = '9';
fireSlider('change');
check('速度标签更新', els['speed-value'].textContent === '速度 9');

console.log('T6: 暂停/继续');
key(' ');
check('空格暂停', __S.state === 'paused');
key(' ');
check('空格继续', __S.state === 'running');

console.log('T7: 撞墙游戏结束');
// 向右撞墙：先转向右，然后一直走
key('ArrowRight');
for (let i = 0; i < 40 && __S.state !== 'over'; i++) step(200);
const finalScore = __S.score; // 路径上可能随机吃到食物，以实际分数为准
check('撞墙后 state = over', __S.state === 'over');
check('结束对话框已打开', els['over-dialog'].open === true);
check('最终得分显示在对话框', String(els['final-score'].textContent) === String(finalScore));
check('最高分已持久化 (localStorage)', global.localStorage.getItem('mdui-snake-best') === String(__S.high));

console.log('T8: 再来一局');
fire('dlg-restart', 'click');
check('重开后 state = running', __S.state === 'running');
check('重开后分数归零', __S.score === 0);
check('重开后蛇长度 4', __S.snake.length === 4);

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
