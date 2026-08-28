// CDP-driven end-to-end test of snake.html in real headless Chrome.
// Verifies: no JS exceptions, canvas auto-sized, game animates on its own after start,
// keyboard input works, pause/resume works.
'use strict';

const CDP_PORT = 9222;
const PAGE_URL = 'http://127.0.0.1:8123/snake.html';

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ FAIL: ' + name); }
}

// ---------- CDP client ----------
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.events = []; }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    const c = new CDP(ws);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && c.pending.has(msg.id)) {
        const { resolve, reject } = c.pending.get(msg.id);
        c.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        c.events.push(msg);
      }
    };
    return c;
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  close() { try { this.ws.close(); } catch (e) {} }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // 1. create a new tab pointing at the page
  const target = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(PAGE_URL)}`, { method: 'PUT' }).then((r) => r.json());
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);

  const exceptions = [];
  cdp.send('Runtime.enable');
  cdp.send('Page.enable');
  cdp.onRuntimeEvent = (ev) => {
    if (ev.method === 'Runtime.exceptionThrown') exceptions.push(ev.params.exceptionDetails.text);
    if (ev.method === 'Runtime.consoleAPICalled' && ev.params.type === 'error')
      exceptions.push(ev.params.args.map((a) => a.value || a.description || '').join(' '));
  };
  const origPush = cdp.events.push.bind(cdp.events);
  cdp.events.push = (ev) => { cdp.onRuntimeEvent && cdp.onRuntimeEvent(ev); return origPush(ev); };

  // 2. wait for the page to finish loading and mdui custom elements to upgrade
  await sleep(2500);

  const evalJS = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('eval exception: ' + JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };

  console.log('T1: 页面加载与画布尺寸');
  const init = await evalJS(`(() => {
    const board = document.getElementById('board');
    const cv = document.getElementById('game');
    return {
      clientWidth: board.clientWidth,
      canvasW: cv.width, canvasH: cv.height,
      dpr: window.devicePixelRatio,
      overlayHidden: document.getElementById('overlay').classList.contains('hidden'),
      score: document.getElementById('score').textContent,
      mduiDefined: !!customElements.get('mdui-top-app-bar'),
    };
  })()`);
  check('MDUI 组件已定义', init.mduiDefined === true);
  check('棋盘布局宽度 > 0', init.clientWidth > 0);
  check('画布尺寸自动设置 (width = board * dpr)', init.canvasW === Math.round(init.clientWidth * init.dpr) && init.canvasH === Math.round(init.clientWidth * init.dpr));
  check('初始为就绪遮罩（未开始）', init.overlayHidden === false);
  check('初始得分 0', init.score === '0');

  console.log('T2: 点击开始后无需任何操作，游戏自动持续运行');
  await evalJS(`document.getElementById('overlay').click()`);
  await sleep(300);
  const running = await evalJS(`(() => ({
    overlayHidden: document.getElementById('overlay').classList.contains('hidden'),
    toggleIcon: document.getElementById('btn-toggle').getAttribute('icon'),
    img1: document.getElementById('game').toDataURL(),
  }))()`);
  check('点击开始后遮罩隐藏', running.overlayHidden === true);
  check('播放按钮变为暂停图标', running.toggleIcon === 'pause');
  await sleep(450); // 再等几个 tick
  const img2 = await evalJS(`document.getElementById('game').toDataURL()`);
  check('无任何操作时画面持续变化（游戏在动）', running.img1 !== img2);

  console.log('T3: 键盘方向键输入');
  await evalJS(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))`);
  await sleep(450);
  const img3 = await evalJS(`document.getElementById('game').toDataURL()`);
  check('方向键后画面继续变化', img3 !== img2);

  console.log('T4: 暂停 / 继续');
  await evalJS(`window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))`);
  await sleep(250);
  const pausedImg = await evalJS(`document.getElementById('game').toDataURL()`);
  await sleep(500);
  const pausedImg2 = await evalJS(`document.getElementById('game').toDataURL()`);
  check('空格暂停后画面静止', pausedImg === pausedImg2);
  const pausedOverlay = await evalJS(`document.getElementById('overlay').classList.contains('hidden')`);
  check('暂停后遮罩显示', pausedOverlay === false);
  await evalJS(`document.getElementById('overlay').click()`);
  await sleep(450);
  const img4 = await evalJS(`document.getElementById('game').toDataURL()`);
  check('继续后画面恢复变化', img4 !== pausedImg2);

  console.log('T5: 无 JS 异常（回归 IndexSizeError）');
  check('运行期间无未捕获异常', exceptions.length === 0);
  if (exceptions.length) console.log('  捕获到: ' + exceptions.join(' | '));

  cdp.close();
  console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('E2E 脚本错误:', e); process.exit(1); });
