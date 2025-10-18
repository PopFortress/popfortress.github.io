mdui.setColorScheme('#EF9A9A');
const $ = (query) => mdui.$(query)[0];

const ele = {
    audio: $('audio'),
    cvs: document.querySelector('canvas'),
    volume: $('.volume'),
    level: $('.level'),
};

const ctx = ele.cvs.getContext('2d');

// function initCanvas() {
//     ele.cvs.width = 320 * devicePixelRatio;
//     ele.cvs.height = 120 * devicePixelRatio;
// };

// initCanvas();
let isInit = false;
let dataArray, analyser;
let db = 0;
const REFERENCE = 0.00002;
let instantDb = 0;
let microphone;

navigator.mediaDevices.getUserMedia({ 
    audio: {
        autoGainControl: false,
        noiseSuppression: false,
        echoCancellation: false
    }})
    .then(stream => {
        if (isInit) {
            return;
        };

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        audioCtx.onstatechange = function() {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            };
        };
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        microphone = audioCtx.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.connect(audioCtx.destination);

        isInit = true;
    })
    .catch(err => {
        console.error('Microphone Permission Declined.' + err);
        mdui.snackBar({ message: 'Microphone Permission Declined.' });
    });

function drawSpectrum() {
    requestAnimationFrame(drawSpectrum);
    const { width, height } = ele.cvs;
    ctx.clearRect(0, 0, width, height);
    if (!isInit) {
        return;
    };
    analyser.getByteFrequencyData(dataArray);

    const len = dataArray.length / 2.5;
    const barWidth = width / len / 2;
    ctx.fillStyle = '#fff';
    for (let i = 0; i < len; i++) {
        const data = dataArray[i];
        const barHeight = data / 255 * height;
        const x1 = i * barWidth + width / 2;
        const x2 = width / 2 - (i + 1) * barWidth;
        const y = height - barHeight;
        ctx.fillRect(x1, y, barWidth, barHeight);
        ctx.fillRect(x2, y, barWidth, barHeight);
    };
};

function calcLevel(db) {
    if (db <= 40) {
        return '理想的安静环境';
    } else if (db <= 50) {
        return '适合工作、学习与休息';
    } else if (db <= 70) {
        return '中等噪音，适合交通和商业区';
    } else if (db <= 90) {
        return '噪音较大，可能影响交谈和工作';
    } else if (db <= 120) {
        return '噪音非常大，听力将会受到影响';
    } else {
        return '危险噪音，请立即采取防护措施';
    };
};

function drawWaveform() {
    requestAnimationFrame(drawWaveform);
    if (!isInit) {
        return;
    };
    const width = ele.cvs.clientWidth;
    const height = ele.cvs.clientHeight;
    const timeData = new Uint8Array(analyser.frequencyBinCount);
    const floatDataArray = new Float32Array(analyser.fftSize);
    analyser.getByteTimeDomainData(timeData);
    analyser.getFloatTimeDomainData(floatDataArray);
    
    db = instantDb = 0;
    

    let sumSquares = 0.0;
    for (let i = 0; i < floatDataArray.length; i++) {
        sumSquares += floatDataArray[i] * floatDataArray[i];
    }
    const rms = Math.sqrt(sumSquares / floatDataArray.length);
    
    // 计算分贝值（绝对）
    let rawDbValue = 20 * Math.log10(rms / REFERENCE);
    
    // 处理负值问题
    if (rawDbValue < 0) {
        rawDbValue = 0;
    };
    
    
    // 修复：使用更智能的平滑算法
    // 当噪音稳定时减少平滑，当噪音变化大时增加平滑
    const dbChange = Math.abs(rawDbValue - instantDb);
    const smoothingFactor = Math.min(0.9, Math.max(0.1, 0.8 - dbChange / 10));
    
    // 更新即时值（使用智能平滑）
    instantDb = smoothingFactor * instantDb + (1 - smoothingFactor) * rawDbValue;
    db = 0.7 * db + 0.3 * instantDb + 25;
    const noiseLevel = calcLevel(db);
    ele.volume.textContent = Math.round(db);
    ele.level.textContent = noiseLevel;

    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff64';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    const sliceWidth = width / timeData.length;
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#ffffffcd' : '#000000cd';
    ctx.beginPath();
    
    for (let i = 0; i < timeData.length; i++) {
        const v = (timeData[i] - 128) / 128.0;
        const y = (v * height) / 2 + height / 2;
        
        if (i === 0) {
            ctx.moveTo(0, y);
        } else {
            ctx.lineTo(i * sliceWidth, y);
        };
    };
    
    ctx.stroke();
};

drawWaveform();