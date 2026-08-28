// Snake game smoke test: run snake.html's inline script in a stubbed DOM with a fake clock.
// Covers the reported bug: layout not ready at script time (board.clientWidth = 0),
// canvas must size itself reactively, and the game loop must survive without a canvas size.
'use strict';
const fs = require('fs');
const html = fs.readFileSync('snake.html', 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)[1];

// ---------- minimal DOM stubs ----------
function makeEl(id) {
  const handlers = {};
  const el = {
    id, clientWidth: 0, // 模拟布局未就绪
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
// ResizeObserver 与 requestAnimationFrame 桩
let RO = null;
global.ResizeObserver = class {
  constructor(cb) { this.cb = cb; }
  observe(el) { RO = { cb: this.cb, el }; }
  disconnect() {}
};
const rAFQueue = [];
global.requestAnimationFrame = (fn) => { rAFQueue.push(fn); return rAFQueue.length; };

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
function flushRAF() { const q = rAFQueue.splice(0); for (const fn of q) fn(); }

// ---------- run page script + expose internals ----------
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
console.log('T1: 布局未就绪时的初始化（回归原 bug 场景）');
check('脚本无异常执行，state = ready', __S.state === 'ready');
check('蛇初始长度 4', __S.snake.length === 4);
check('画布尺寸延迟设置（未设置过）', !els['game'].width && !els['game'].height);
__S.setFood({ x: 2, y: 2 }); // 把随机食物停到蛇路径之外，保证后续断言确定性

console.log('T2: 画布为 0 尺寸时游戏循环仍持续运行');
fire('overlay', 'click');
check('state = running', __S.state === 'running');
for (let i = 0; i < 5; i++) step(200);
check('0 尺寸下蛇头仍持续前进', __S.snake[0].x === 15 && __S.snake[0].y === 10);
check('tick 循环未被 draw 异常中断（有下一拍计时器）', pending.length === 1);

console.log('T3: 逐帧兜底检测到布局就绪后自动设置画布');
els.board.clientWidth = 460; // 模拟布局完成
flushRAF(); // 触发 retrySize → resize
check('画布已按 460 * dpr(2) 设置', els['game'].width === 920 && els['game'].height === 920);
check('布局就绪后游戏仍在运行', __S.state === 'running');

console.log('T4: ResizeObserver 回调幂等');
if (!RO) { check('ResizeObserver 已注册', false); }
else { RO.cb([{ target: els.board }]); check('RO 回调后画布尺寸不变', els['game'].width === 920); }

console.log('T5: 方向控制与禁止掉头');
key('ArrowUp');
step(200);
check('按上后蛇向上移动', __S.snake[0].y === 9 && __S.snake[0].x === 15);
key('ArrowDown');
step(200);
check('禁止直接掉头（仍向上）', __S.snake[0].y === 8);

console.log('T6: 吃到食物加分并增长');
__S.setFood({ x: 15, y: 7 }); // 蛇头在 (15,8) 向上，下一拍即吃到
step(300);
check('吃到食物后分数 +1', __S.score === 1);
check('吃到食物后长度 +1', __S.snake.length === 5);

console.log('T7: 速度调节');
els['speed'].value = '9';
fireSlider('change');
check('速度标签更新', els['speed-value'].textContent === '速度 9');

console.log('T8: 暂停/继续');
key(' ');
check('空格暂停', __S.state === 'paused');
key(' ');
check('空格继续', __S.state === 'running');

console.log('T9: 撞墙游戏结束');
key('ArrowRight');
for (let i = 0; i < 40 && __S.state !== 'over'; i++) step(200);
const finalScore = __S.score;
check('撞墙后 state = over', __S.state === 'over');
check('结束对话框已打开', els['over-dialog'].open === true);
check('最终得分显示在对话框', String(els['final-score'].textContent) === String(finalScore));
check('最高分已持久化 (localStorage)', global.localStorage.getItem('mdui-snake-best') === String(__S.high));

console.log('T10: 再来一局');
fire('dlg-restart', 'click');
check('重开后 state = running', __S.state === 'running');
check('重开后分数归零', __S.score === 0);
check('重开后蛇长度 4', __S.snake.length === 4);

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
