const $ = (s) => mdui.$(s)[0];

/* ================= 工具函数 ================= */

function snackbar(message, action, onAction) {
    const opts = { message, timeout: 3500 };
    if (action) {
        opts.action = action;
        if (onAction) opts.onActionClick = onAction;
    }
    mdui.snackbar(opts);
}

function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const PUNCT_CHARS = '，。！？；：、,.!?;:…—·～~「」『』“”‘’"\'()（）《》〈〉【】[]{}｛｝';
const isPunct = (ch) => PUNCT_CHARS.includes(ch);
const isSpace = (ch) => /\s/.test(ch);

/* 最长公共子序列（LCS）对齐：返回匹配长度及两侧匹配位置集合 */
function lcsAlign(a, b) {
    const n = a.length, m = b.length;
    const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
    }
    const matchA = new Set(), matchB = new Set();
    let i = 0, j = 0;
    while (i < n && j < m) {
        if (a[i] === b[j]) {
            matchA.add(i);
            matchB.add(j);
            i++;
            j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            i++;
        } else {
            j++;
        }
    }
    return { len: dp[0][0], matchA, matchB };
}

function gradeOf(score) {
    if (score >= 0.98) return { label: '完美', cls: 'g-green' };
    if (score >= 0.9) return { label: '优秀', cls: 'g-green' };
    if (score >= 0.75) return { label: '良好', cls: 'g-lime' };
    if (score >= 0.6) return { label: '一般', cls: 'g-orange' };
    return { label: '需复习', cls: 'g-red' };
}
const GRADE_ORDER = ['完美', '优秀', '良好', '一般', '需复习'];

/* 逐字比对一句：忽略标点与空白，用 LCS 计算准确率并生成彩色比对 HTML */
function compareLine(target, answer) {
    const tChars = [...target], aChars = [...answer];
    const isContent = (ch) => !isPunct(ch) && !isSpace(ch);
    const tContent = [];
    tChars.forEach((ch) => { if (isContent(ch)) tContent.push(ch); });
    const aContent = aChars.filter(isContent);

    const { len, matchA, matchB } = lcsAlign(tContent, aContent);
    const totalCount = tContent.length;
    const score = totalCount ? len / totalCount : 1;

    let html = '', cIdx = 0;
    for (let i = 0; i < tChars.length; i++) {
        const ch = tChars[i];
        if (isPunct(ch) || isSpace(ch)) {
            html += `<span class="diff-punct">${escapeHtml(ch)}</span>`;
        } else {
            html += `<span class="diff-char ${matchA.has(cIdx) ? 'diff-correct' : 'diff-wrong'}">${escapeHtml(ch)}</span>`;
            cIdx++;
        }
    }

    const extras = [];
    aContent.forEach((ch, j) => { if (!matchB.has(j)) extras.push(ch); });

    return {
        score,
        correctCount: len,
        totalCount,
        extraCount: extras.length,
        extras: extras.join(''),
        diffHtml: html,
    };
}

function normalizePoem(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('不是有效的 JSON 对象');
    let lines = [];
    if (Array.isArray(data.lines)) lines = data.lines;
    else if (Array.isArray(data.content)) lines = data.content;
    else if (typeof data.content === 'string') lines = data.content.split(/\r?\n/);
    lines = lines.map((s) => String(s).trim()).filter(Boolean);
    if (!lines.length) throw new Error('JSON 中缺少 lines 字段（应为字符串数组）');
    return { title: data.title || '未命名', author: data.author || '', lines };
}

function deriveTitle(file) {
    return String(file).replace(/\.json$/i, '').replace(/[-_]/g, '·');
}

/* ================= DOM ================= */

const topLoading = $('.top-loading');
const pageSelect = $('#page-select');
const pageRecite = $('#page-recite');
const pageResult = $('#page-result');

const poemList = $('#poem-list');
const poemTitle = $('#poem-title');
const poemAuthor = $('#poem-author');
const poemMode = $('#poem-mode');
const lineProgress = $('#line-progress');
const lineInfo = $('#line-info');
const hintPattern = $('#hint-pattern');
const hintMeta = $('#hint-meta');
const originLine = $('#origin-line');
const showOriginBtn = $('#show-origin-btn');
const speakBtn = $('#speak-btn');

const chipVoice = $('#chip-voice');
const chipText = $('#chip-text');
const textMode = $('#text-mode');
const voiceMode = $('#voice-mode');

const answerInput = $('#answer-input');
const checkTextBtn = $('#check-text-btn');
const checkVoiceBtn = $('#check-voice-btn');
const micBtn = $('#mic-btn');
const voiceStatus = $('#voice-status');
const voiceTranscript = $('#voice-transcript');

const feedback = $('#feedback');
const feedbackScore = $('#feedback-score');
const feedbackVerdict = $('#feedback-verdict');
const feedbackStats = $('#feedback-stats');
const diffEl = $('#diff');
const diffExtras = $('#diff-extras');
const retryBtn = $('#retry-btn');
const nextBtn = $('#next-btn');

const restartBtn = $('#restart-btn');
const backListBtn = $('#back-list-btn');

const resultScore = $('#result-score');
const resultTitle = $('#result-title');
const statPass = $('#stat-pass');
const statReview = $('#stat-review');
const statSkip = $('#stat-skip');
const statBest = $('#stat-best');
const gradeRow = $('#grade-row');
const weakPanel = $('#weak-panel');
const weakList = $('#weak-list');
const reviewBtn = $('#review-btn');
const redoBtn = $('#redo-btn');
const resultBackBtn = $('#result-back-btn');

const audioTestBtn = $('#audio-test');

/* ================= 状态 ================= */

let currentPoem = null;   // { title, author, lines, file }
let sessionIndices = [];  // 本轮要背诵的句子下标（复习模式为错句下标）
let results = [];         // 与 sessionIndices 对齐
let pos = 0;
let currentLine = '';
let lastResult = null;
let currentMode = 'voice';
let reviewMode = false;

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let listening = false;
let finalTranscript = '';
let interimTranscript = '';
let recEvaluated = false;
let recFailed = false;

/* ================= 页面切换 ================= */

function switchPage(to) {
    [pageSelect, pageRecite, pageResult].forEach((p) => p.classList.add('hidden'));
    to.classList.remove('hidden');
    window.scrollTo(0, 0);
}

/* ================= 诗歌列表 ================= */

async function discoverPoems() {
    // 1) 优先读取 manifest.json（静态托管如 GitHub Pages 没有目录列表）
    try {
        const res = await fetch('poems/manifest.json', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            const arr = Array.isArray(data) ? data : data.poems;
            if (Array.isArray(arr) && arr.length) {
                return arr.map((e) => (typeof e === 'string' ? { file: e } : e)).filter((e) => e && e.file);
            }
        }
    } catch (e) { /* 忽略，继续尝试 */ }
    // 2) 尝试目录列表（nginx / python http.server 等会返回 HTML 索引）
    try {
        const res = await fetch('poems/', { cache: 'no-store' });
        if (res.ok) {
            const html = await res.text();
            const names = [];
            const re = /href=["']([^"']+\.json)["']/gi;
            let m;
            while ((m = re.exec(html)) !== null) {
                let name = decodeURIComponent(m[1].split('/').pop()).split('?')[0];
                if (name && !/^manifest\.json$/i.test(name) && !names.includes(name)) names.push(name);
            }
            if (names.length) return names.map((file) => ({ file }));
        }
    } catch (e) { /* 忽略 */ }
    // 3) 兜底：内置已知文件
    return [{ file: '沁园春-雪.json', title: '沁园春·雪', author: '毛泽东（近现代）' }];
}

function renderPoemList(list) {
    poemList.innerHTML = '';
    list.forEach((entry) => {
        const item = document.createElement('mdui-list-item');
        item.icon = 'menu_book';
        item.classList.add('poem-item');
        const wrap = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'poem-item-title';
        title.textContent = entry.title || deriveTitle(entry.file);
        const sub = document.createElement('div');
        sub.className = 'poem-item-sub';
        sub.textContent = [entry.author, '点击开始背诵'].filter(Boolean).join(' · ');
        wrap.appendChild(title);
        wrap.appendChild(sub);
        item.appendChild(wrap);
        item.addEventListener('click', () => {
            // 用户点击选诗（属于用户手势）：主动请求麦克风权限，避免开始背诵后才弹授权框
            if (currentMode === 'voice') requestMicPermission().then(applyMicPermission);
            loadPoem(entry);
        });
        poemList.appendChild(item);
    });
}

async function loadPoem(entry) {
    topLoading.style.display = 'block';
    try {
        const res = await fetch('poems/' + encodeURIComponent(entry.file), { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const poem = normalizePoem(data);
        poem.file = entry.file;
        poem.title = data.title || entry.title || deriveTitle(entry.file);
        poem.author = data.author || entry.author || '';
        currentPoem = poem;
        startSession(poem.lines.map((_, i) => i), false);
    } catch (err) {
        topLoading.style.display = 'none';
        mdui.alert({
            headline: '加载失败',
            description: `无法读取 poems/${entry.file || ''}：${err.message}。可直接粘贴 JSON 导入。`,
            confirmText: '导入 JSON',
        }).then(() => openImportDialog()).catch(() => {});
    }
    topLoading.style.display = 'none';
}

/* ================= 背诵流程 ================= */

function startSession(indices, review) {
    sessionIndices = indices.slice();
    results = new Array(sessionIndices.length).fill(null);
    pos = 0;
    reviewMode = !!review;
    switchPage(pageRecite);
    setupLine();
}

function setupLine() {
    stopRecognition();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    currentLine = currentPoem.lines[sessionIndices[pos]];
    lastResult = null;

    poemTitle.textContent = currentPoem.title;
    poemAuthor.textContent = currentPoem.author;
    poemMode.textContent = reviewMode ? '复习模式' : (currentMode === 'voice' ? '语音背诵' : '文本输入');

    const total = sessionIndices.length;
    lineProgress.value = total ? pos / total : 0;
    lineInfo.textContent = `第 ${pos + 1} 句 / 共 ${total} 句${reviewMode ? '（复习错句）' : ''}`;

    renderHint();

    feedback.classList.add('hidden');
    originLine.classList.add('hidden');
    showOriginBtn.textContent = '查看原文';
    answerInput.value = '';
    checkTextBtn.disabled = false;
    checkVoiceBtn.disabled = true;
    voiceTranscript.textContent = '';
    voiceTranscript.classList.add('hidden');
    voiceStatus.classList.remove('listening');

    nextBtn.textContent = pos === total - 1 ? '查看结果' : '下一句';
    resetMicUI();
    setMode(currentMode);
    checkMicPermissionState();
}

function resetMicUI() {
    micBtn.icon = 'mic';
    micBtn.textContent = '开始录音';
    micBtn.classList.remove('listening');
    micBtn.disabled = false;
}

function renderHint() {
    const chars = [...currentLine];
    const content = chars.filter((ch) => !isPunct(ch) && !isSpace(ch));
    const punctSeq = chars.filter((ch) => isPunct(ch));
    const uniquePunct = [...new Set(punctSeq)];

    hintPattern.innerHTML = '';
    chars.forEach((ch) => {
        if (isPunct(ch)) {
            const span = document.createElement('span');
            span.className = 'hint-punct';
            span.textContent = ch;
            hintPattern.appendChild(span);
        } else if (isSpace(ch)) {
            hintPattern.appendChild(document.createTextNode(' '));
        } else {
            const span = document.createElement('span');
            span.className = 'hint-blank';
            span.textContent = '＿';
            hintPattern.appendChild(span);
        }
    });
    hintMeta.textContent = `字数 ${content.length} 字 · 标点 ${uniquePunct.length ? uniquePunct.join(' ') : '无'}`;
}

function setMode(mode) {
    currentMode = mode;
    chipVoice.selected = mode === 'voice';
    chipText.selected = mode === 'text';
    textMode.classList.toggle('hidden', mode !== 'text');
    voiceMode.classList.toggle('hidden', mode !== 'voice');
    poemMode.textContent = reviewMode ? '复习模式' : (mode === 'voice' ? '语音背诵' : '文本输入');
    if (mode !== 'voice') stopRecognition();
    if (mode === 'voice') {
        if (!SR) {
            voiceStatus.textContent = '当前浏览器不支持语音识别，请使用 Chrome / Edge 访问（需 HTTPS 或 localhost），或切换到文本输入模式';
            voiceStatus.classList.remove('listening');
            checkVoiceBtn.disabled = true;
        } else {
            micBtn.disabled = false;
            if (!listening && !lastResult) {
                voiceStatus.textContent = '点击开始，然后朗读本句';
                voiceStatus.classList.remove('listening');
            }
        }
    } else if (mode === 'text') {
        answerInput.focus();
    }
}

/* ---------- 检查与反馈 ---------- */

function runCheck(rawAnswer) {
    const answer = String(rawAnswer).trim();
    if (!answer) {
        snackbar('请先输入或朗读本句');
        return;
    }
    const r = compareLine(currentLine, answer);
    lastResult = r;
    checkTextBtn.disabled = true;
    checkVoiceBtn.disabled = true;

    const g = gradeOf(r.score);
    feedbackScore.textContent = Math.round(r.score * 100) + '%';
    feedbackScore.classList.toggle('score-good', r.score >= 0.75);
    feedbackScore.classList.toggle('score-bad', r.score < 0.75);
    feedbackVerdict.textContent = g.label;
    feedbackVerdict.className = 'feedback-verdict ' + g.cls;

    const stats = [`正确 ${r.correctCount}/${r.totalCount} 字`];
    if (r.extraCount > 0) stats.push(`多出 ${r.extraCount} 字`);
    stats.push('标点不参与计分');
    feedbackStats.textContent = stats.join(' · ');

    diffEl.innerHTML = r.diffHtml;
    if (r.extraCount > 0) {
        diffExtras.textContent = '多出：' + r.extras;
        diffExtras.classList.remove('hidden');
    } else {
        diffExtras.classList.add('hidden');
    }

    feedback.classList.remove('hidden');
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    answerInput.blur();
}

function nextLine() {
    if (!lastResult) {
        snackbar('请先检查本句');
        return;
    }
    results[pos] = lastResult;
    pos++;
    if (pos >= sessionIndices.length) {
        showResultPage();
        return;
    }
    setupLine();
}

function retryLine() {
    stopRecognition();
    lastResult = null;
    feedback.classList.add('hidden');
    checkTextBtn.disabled = false;
    checkVoiceBtn.disabled = true;
    answerInput.value = '';
    voiceTranscript.textContent = '';
    voiceTranscript.classList.add('hidden');
    voiceStatus.classList.remove('listening');
    resetMicUI();
    setMode(currentMode);
}

function skipLine() {
    if (lastResult) {
        results[pos] = lastResult;
    } else {
        results[pos] = { skipped: true, score: 0, correctCount: 0, totalCount: 0 };
    }
    pos++;
    if (pos >= sessionIndices.length) {
        showResultPage();
        return;
    }
    setupLine();
}

/* ================= 语音识别（Web Speech API） ================= */

/* 开始录音时的提示音 */
const START_SOUND_URL = 'https://files.zohopublic.com.cn/public/workdrive-public/download/mdxkr350896bbcdf0485585fd34c5399320a6?x-cli-msg=%7B%22linkId%22%3A%221HCuFcqjjdf-36sAc%22%2C%22isFileOwner%22%3Afalse%2C%22version%22%3A%221.0%22%2C%22isWDSupport%22%3Afalse%7D';
let startSound = null;

function playStartSound() {
    try {
        if (!startSound) {
            startSound = new Audio(START_SOUND_URL);
            startSound.preload = 'auto';
        }
        startSound.currentTime = 0;
        startSound.play().catch((e) => { mdui.snackbar({ message: `${e}`}) });
    } catch (e) { /* 忽略 */ }
}

function startListening() {
    if (!SR) return;
    try {
        recognition = new SR();
        recognition.lang = 'zh-CN';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 3;
        finalTranscript = '';
        interimTranscript = '';
        recEvaluated = false;
        recFailed = false;

        recognition.onresult = (e) => {
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const t = e.results[i][0].transcript;
                if (e.results[i].isFinal) finalTranscript += t;
                else interim += t;
            }
            interimTranscript = interim;
            updateTranscriptUI();
        };

        recognition.onerror = (e) => {
            recFailed = true;
            voiceStatus.classList.remove('listening');
            if (e.error === 'not-allowed') {
                voiceStatus.textContent = '无法使用麦克风：请点击地址栏左侧的图标，将「麦克风」设为允许后重试';
            } else if (e.error === 'service-not-allowed') {
                voiceStatus.textContent = '当前环境不允许语音识别（需 HTTPS 或 localhost）';
                micBtn.disabled = true;
            } else if (e.error === 'no-speech') {
                voiceStatus.textContent = '未检测到语音，请重试';
            } else if (e.error === 'audio-capture') {
                voiceStatus.textContent = '未找到麦克风设备';
            } else if (e.error === 'network') {
                voiceStatus.textContent = '语音识别网络错误，请重试';
            } else {
                voiceStatus.textContent = '语音识别出错（' + e.error + '）';
            }
        };

        recognition.onend = () => {
            listening = false;
            micBtn.icon = 'mic';
            micBtn.textContent = '重新录音';
            micBtn.classList.remove('listening');
            voiceStatus.classList.remove('listening');
            if (recEvaluated) return;
            const combined = (finalTranscript + interimTranscript).trim();
            if (finalTranscript.trim() && !recFailed) {
                recEvaluated = true;
                runCheck(combined);
            } else if (combined) {
                checkVoiceBtn.disabled = false;
                voiceStatus.textContent = '识别已结束，可点击「用识别结果检查」提交，或重新录音';
            } else if (!recFailed) {
                voiceStatus.textContent = '未检测到语音，请重试';
            }
        };

        recognition.start();
        playStartSound();
        listening = true;
        micBtn.icon = 'stop';
        micBtn.textContent = '停止录音';
        micBtn.classList.add('listening');
        voiceStatus.textContent = '正在聆听…请朗读本句';
        voiceStatus.classList.add('listening');
        updateTranscriptUI();
    } catch (err) {
        voiceStatus.textContent = '无法启动语音识别：' + err.message;
    }
}

function stopRecognition() {
    if (recognition && listening) {
        try { recognition.stop(); } catch (e) { /* 忽略 */ }
    }
}

function updateTranscriptUI() {
    const text = (finalTranscript + interimTranscript).trim();
    if (text) {
        voiceTranscript.textContent = text;
        voiceTranscript.classList.remove('hidden');
        checkVoiceBtn.disabled = false;
    } else {
        voiceTranscript.classList.add('hidden');
        checkVoiceBtn.disabled = true;
    }
}

/* ---------- 麦克风权限 ---------- */

const MIC_STATUS_TEXT = {
    granted: '麦克风权限已就绪，点击「开始录音」朗读本句',
    denied: '麦克风权限被拒绝：请点击地址栏左侧的图标，将「麦克风」设为允许后重试',
    nodevice: '未检测到麦克风设备，请检查耳机或麦克风连接',
    busy: '麦克风正被其他应用占用，请关闭占用程序后重试',
    unsupported: '当前环境无法获取麦克风（需 HTTPS 或 localhost）',
};

/* 主动请求麦克风权限（浏览器要求必须在用户点击等手势中调用才会弹出授权框） */
async function requestMicPermission() {
    const md = navigator.mediaDevices;
    if (!md || !md.getUserMedia) return { ok: false, state: 'unsupported' };
    try {
        const stream = await md.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        return { ok: true, state: 'granted' };
    } catch (err) {
        const name = err && err.name;
        if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return { ok: false, state: 'nodevice' };
        if (name === 'NotReadableError' || name === 'TrackStartError') return { ok: false, state: 'busy' };
        return { ok: false, state: 'denied' };
    }
}

function applyMicPermission(perm) {
    if (currentMode !== 'voice' || listening || lastResult) return;
    voiceStatus.textContent = MIC_STATUS_TEXT[perm.state] || '点击开始，然后朗读本句';
    voiceStatus.classList.remove('listening');
}

/* 读取已保存的权限状态（不需要用户手势），用于进入背诵页时即时提示 */
async function checkMicPermissionState() {
    if (currentMode !== 'voice' || listening || lastResult) return;
    if (!SR || !navigator.permissions || !navigator.permissions.query) return;
    try {
        const { state } = await navigator.permissions.query({ name: 'microphone' });
        if (listening || lastResult || currentMode !== 'voice') return;
        if (state === 'granted') voiceStatus.textContent = MIC_STATUS_TEXT.granted;
        else if (state === 'denied') voiceStatus.textContent = MIC_STATUS_TEXT.denied;
    } catch (e) { /* 忽略，保持默认提示 */ }
}

/* ================= 结果页 ================= */

function showResultPage() {
    stopRecognition();
    if ('speechSynthesis' in window) speechSynthesis.cancel();

    const answered = [];
    const skipped = [];
    results.forEach((r, i) => {
        if (!r) return;
        if (r.skipped) skipped.push({ idx: sessionIndices[i], score: 0, skipped: true });
        else answered.push({ idx: sessionIndices[i], score: r.score, skipped: false });
    });

    const avg = answered.length ? answered.reduce((s, r) => s + r.score, 0) / answered.length : 0;
    const passCount = answered.filter((r) => r.score >= 0.75).length;
    const reviewList = answered.filter((r) => r.score < 0.6).concat(skipped);

    const counts = {};
    GRADE_ORDER.forEach((g) => (counts[g] = 0));
    answered.forEach((r) => counts[gradeOf(r.score).label]++);
    skipped.forEach(() => counts['需复习']++);

    // 历史最佳（localStorage）
    const bestKey = 'poem-memorizer-best-' + (currentPoem.file || currentPoem.title);
    let prevBest = parseFloat(localStorage.getItem(bestKey));
    if (answered.length && (!isFinite(prevBest) || avg > prevBest)) {
        prevBest = avg;
        localStorage.setItem(bestKey, String(avg));
    }

    resultScore.textContent = answered.length ? Math.round(avg * 100) + '%' : '--';
    resultTitle.textContent = `《${currentPoem.title}》${reviewMode ? '（复习）' : ''} · 共 ${sessionIndices.length} 句`;
    statPass.textContent = passCount;
    statReview.textContent = answered.length - passCount + skipped.length;
    statSkip.textContent = skipped.length;
    statBest.textContent = isFinite(prevBest) ? Math.round(prevBest * 100) + '%' : '--';

    gradeRow.innerHTML = '';
    GRADE_ORDER.forEach((g) => {
        if (!counts[g]) return;
        const pill = document.createElement('div');
        pill.className = 'grade-pill';
        const dot = document.createElement('span');
        dot.className = 'grade-dot ' + gradeOf(g === '需复习' ? 0 : g === '一般' ? 0.6 : g === '良好' ? 0.8 : g === '优秀' ? 0.95 : 1).cls;
        pill.appendChild(dot);
        pill.appendChild(document.createTextNode(`${g} × ${counts[g]}`));
        gradeRow.appendChild(pill);
    });

    if (reviewList.length) {
        weakPanel.classList.remove('hidden');
        weakList.innerHTML = '';
        reviewList.forEach((r) => {
            const item = document.createElement('div');
            item.className = 'weak-item';
            const index = document.createElement('span');
            index.className = 'weak-index';
            index.textContent = `第 ${r.idx + 1} 句`;
            const text = document.createElement('span');
            text.className = 'weak-text';
            text.textContent = currentPoem.lines[r.idx];
            const scoreEl = document.createElement('span');
            scoreEl.className = 'weak-score ' + (r.skipped ? 'g-orange' : gradeOf(r.score).cls);
            scoreEl.textContent = r.skipped ? '跳过' : Math.round(r.score * 100) + '%';
            item.appendChild(index);
            item.appendChild(text);
            item.appendChild(scoreEl);
            weakList.appendChild(item);
        });
    } else {
        weakPanel.classList.add('hidden');
    }
    reviewBtn.disabled = reviewList.length === 0;
    switchPage(pageResult);
}

/* ================= 导入 JSON ================= */

function openImportDialog() {
    const body = document.createElement('mdui-text-field');
    body.label = '粘贴诗歌 JSON';
    body.autosize = true;
    body.placeholder = '{"title": "...", "author": "...", "lines": ["...", "..."]}';
    body.style.width = '100%';
    mdui.dialog({
        headline: '导入诗歌 JSON',
        description: '可直接粘贴 poems/ 目录下的 JSON 内容',
        body,
        actions: [
            { text: '取消' },
            {
                text: '导入',
                onClick: () => {
                    const text = body.value.trim();
                    if (!text) {
                        snackbar('请先粘贴 JSON 内容');
                        return false;
                    }
                    try {
                        const poem = normalizePoem(JSON.parse(text));
                        poem.file = poem.title;
                        currentPoem = poem;
                        startSession(poem.lines.map((_, i) => i), false);
                        return true;
                    } catch (e) {
                        snackbar('JSON 解析失败：' + e.message);
                        return false;
                    }
                },
            },
        ],
    });
}

/* ================= 事件绑定 ================= */

chipVoice.addEventListener('click', () => {
    setMode('voice');
    // 切换到语音模式（用户手势）：主动请求麦克风权限
    requestMicPermission().then(applyMicPermission);
});
chipText.addEventListener('click', () => setMode('text'));

checkTextBtn.addEventListener('click', () => runCheck(answerInput.value));
answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (lastResult) nextBtn.click();
        else checkTextBtn.click();
    }
});

micBtn.addEventListener('click', async () => {
    if (!SR) {
        snackbar('当前浏览器不支持语音识别，请使用 Chrome / Edge 访问（需 HTTPS 或 localhost），或切换到文本输入模式');
        return;
    }
    if (listening) {
        stopRecognition();
        return;
    }
    // 点击麦克风时先确保权限已授予，再启动识别
    const perm = await requestMicPermission();
    applyMicPermission(perm);
    if (perm.ok) {
        startListening();
    } else {
        snackbar(MIC_STATUS_TEXT[perm.state] || '无法使用麦克风');
    }
});

checkVoiceBtn.addEventListener('click', () => {
    stopRecognition();
    recEvaluated = true;
    const text = (finalTranscript + interimTranscript).trim();
    if (text) runCheck(text);
    else snackbar('尚未识别到内容，请先录音');
});

document.querySelectorAll('.skip-btn').forEach((btn) => btn.addEventListener('click', skipLine));

retryBtn.addEventListener('click', retryLine);
nextBtn.addEventListener('click', nextLine);

showOriginBtn.addEventListener('click', () => {
    if (originLine.classList.contains('hidden')) {
        originLine.textContent = currentLine;
        originLine.classList.remove('hidden');
        showOriginBtn.textContent = '隐藏原文';
    } else {
        originLine.classList.add('hidden');
        showOriginBtn.textContent = '查看原文';
    }
});

speakBtn.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
        snackbar('当前浏览器不支持朗读');
        return;
    }
    const u = new SpeechSynthesisUtterance(currentLine);
    u.lang = 'zh-CN';
    u.rate = 0.9;
    const voices = speechSynthesis.getVoices();
    const zh = voices.find((v) => /^zh/i.test(v.lang));
    if (zh) u.voice = zh;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
});

restartBtn.addEventListener('click', () => {
    stopRecognition();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    mdui.confirm({
        headline: '重新开始',
        description: `确定要重新背诵《${currentPoem.title}》吗？当前进度将丢失。`,
        confirmText: '重新开始',
        cancelText: '取消',
    }).then(() => {
        startSession(currentPoem.lines.map((_, i) => i), false);
    }).catch(() => {});
});

backListBtn.addEventListener('click', () => {
    stopRecognition();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    mdui.confirm({
        headline: '返回选诗',
        description: '退出后当前背诵进度将丢失。',
        confirmText: '返回',
        cancelText: '取消',
    }).then(() => {
        switchPage(pageSelect);
    }).catch(() => {});
});

$('#open-import-btn').addEventListener('click', openImportDialog);

reviewBtn.addEventListener('click', () => {
    const weak = [];
    results.forEach((r, i) => {
        if (!r) return;
        if (r.skipped || r.score < 0.6) weak.push(sessionIndices[i]);
    });
    if (weak.length) startSession(weak, true);
});

redoBtn.addEventListener('click', () => {
    startSession(currentPoem.lines.map((_, i) => i), false);
});

resultBackBtn.addEventListener('click', () => {
    switchPage(pageSelect);
});

/* ================= 初始化 ================= */

(async function init() {
    topLoading.style.display = 'block';
    const list = await discoverPoems();
    topLoading.style.display = 'none';
    if (!list.length) {
        mdui.alert({
            headline: '未找到诗歌',
            description: 'poems/ 目录下没有可用的 JSON 文件，可以手动导入。',
            confirmText: '导入 JSON',
        }).then(() => openImportDialog()).catch(() => openImportDialog());
    } else {
        renderPoemList(list);
    }
    setMode(currentMode);
})();