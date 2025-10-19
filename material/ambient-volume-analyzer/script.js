mdui.setColorScheme('#EF9A9A');
const $ = (query) => mdui.$(query)[0];

const ele = {
    audio: $('audio'),
    cvs: document.querySelector('canvas'),
    volume: $('.volume'),
    level: $('.level'),
};

const ctx = ele.cvs.getContext('2d');

let dataArray, analyser;
let db = 0;
const REFERENCE = 0.00002;
let microphone;
let audioCtx;
let lastDecibelValue = 35;
let smoothedDecibel = 35;
let bufferLength;

function requestMicrophone() {
    navigator.mediaDevices.getUserMedia({ 
        audio: {
            autoGainControl: false,
            noiseSuppression: false,
            echoCancellation: false
        }})
        .then(stream => {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            microphone = audioCtx.createMediaStreamSource(stream);
    
            audioCtx.onstatechange = function() {
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume();
                };
            };
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
    
            microphone.connect(analyser);

            processAudio();
        })
        .catch(err => {
            console.error('Microphone Permission Declined.' + err);
            mdui.snackbar({ message: 'Microphone Permission Declined.' });
        }
    );
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

function processAudio() {

    const update = () => {
        analyser.getByteTimeDomainData(dataArray);
        // 计算RMS（均方根）值作为音频振幅的衡量
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            // 将值归一化到-1到1
            const value = (dataArray[i] - 128) / 128;
            sum += value * value; // 平方求和
        }
        
        const rms = Math.sqrt(sum / bufferLength); // 计算均方根
        let db = 20 * Math.log10(rms); // 转换成分贝值
        db = Math.max(0, db + 60); // 调整范围到0-120dB
        
        // 平滑处理分贝值 - 解决值变换过快问题
        const smoothingFactor = 0.2; // 平滑系数
        smoothedDecibel = smoothingFactor * db + (1 - smoothingFactor) * smoothedDecibel;
        
        // 限制最大分贝值
        lastDecibelValue = Math.min(130, smoothedDecibel);
        lastDecibelValue += 20;
        
        updateWaveform();

        requestAnimationFrame(update);
    };

    update();

    setInterval(() => {
        updateDisplay(lastDecibelValue);
    }, 500);
};

function updateWaveform() {
    const width = ele.cvs.clientWidth;
    const height = ele.cvs.clientHeight;
    const timeData = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(timeData);
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


function updateDisplay(db) {
    ele.volume.textContent = db.toFixed(1);
    ele.level.textContent = calcLevel(db);
};

window.onload = () => {
    requestMicrophone();
    updateDisplay(smoothedDecibel);
};