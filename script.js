// [COLOR_DB remains the same as your previous version]
const COLOR_DB = [["000000","Black"],["000080","Navy"],["00008B","Dark Blue"],["0000CD","Medium Blue"],["0000FF","Blue"],["006400","Dark Green"],["008000","Green"],["008080","Teal"],["008B8B","Dark Cyan"],["00BFFF","Deep Sky Blue"],["00CED1","Dark Turquoise"],["00FA9A","Medium Spring Green"],["00FF00","Lime"],["00FF7F","Spring Green"],["00FFFF","Aqua"],["191970","Midnight Blue"],["1E90FF","Dodger Blue"],["20B2AA","Light Sea Green"],["228B22","Forest Green"],["2E8B57","Sea Green"],["2F4F4F","Dark Slate Gray"],["32CD32","Lime Green"],["3CB371","Medium Sea Green"],["40E0D0","Turquoise"],["4169E1","Royal Blue"],["4682B4","Steel Blue"],["483D8B","Dark Slate Blue"],["48D1CC","Medium Turquoise"],["4B0082","Indigo"],["556B2F","Dark Olive Green"],["5F9EA0","Cadet Blue"],["6495ED","Cornflower Blue"],["66CDAA","Medium Aquamarine"],["696969","Dim Gray"],["6A5ACD","Slate Blue"],["6B8E23","Olive Drab"],["708090","Slate Gray"],["778899","Light Slate Gray"],["7B68EE","Medium Slate Blue"],["7CFC00","Lawn Green"],["7FFF00","Chartreuse"],["7FFFD4","Aquamarine"],["800000","Maroon"],["800080","Purple"],["808000","Olive"],["808080","Gray"],["8A2BE2","Blue Violet"],["8B0000","Dark Red"],["8B008B","Dark Magenta"],["8B4513","Saddle Brown"],["8FBC8F","Dark Sea Green"],["90EE90","Light Green"],["9370DB","Medium Purple"],["9400D3","Dark Violet"],["98FB98","Pale Green"],["9932CC","Dark Orchid"],["9ACD32","Yellow Green"],["A0522D","Sienna"],["A52A2A","Brown"],["A9A9A9","Dark Gray"],["ADD8E6","Light Blue"],["ADFF2F","Green Yellow"],["AFEEEE","Pale Turquoise"],["B0C4DE","Light Steel Blue"],["B0E0E6","Powder Blue"],["B22222","Fire Brick"],["B8860B","Dark Goldenrod"],["BA55D3","Medium Orchid"],["BC8F8F","Rosy Brown"],["BDB76B","Dark Khaki"],["C0C0C0","Silver"],["C71585","Medium Violet Red"],["CD5C5C","Indian Red"],["CD853F","Peru"],["D2691E","Chocolate"],["D2B48C","Tan"],["D3D3D3","Light Gray"],["D8BFD8","Thistle"],["DA70D6","Orchid"],["DAA520","Goldenrod"],["DB7093","Pale Violet Red"],["DC143C","Crimson"],["DCDCDC","Gainsboro"],["DDA0DD","Plum"],["DEB887","Burly Wood"],["E0FFFF","Light Cyan"],["E6E6FA","Lavender"],["E9967A","Dark Salmon"],["EE82EE","Violet"],["EEE8AA","Pale Goldenrod"],["F08080","Light Coral"],["F0E68C","Khaki"],["F0F8FF","Alice Blue"],["F0FFF0","Honeydew"],["F0FFFF","Azure"],["F4A460","Sandy Brown"],["F5DEB3","Wheat"],["F5F5DC","Beige"],["F5F5F5","White Smoke"],["F5FFFA","Mint Cream"],["F8F8FF","Ghost White"],["FA8072","Salmon"],["FAEBD7","Antique White"],["FAF0E6","Linen"],["FAFAD2","Light Goldenrod Yellow"],["FDF5E6","Old Lace"],["FF0000","Red"],["FF00FF","Fuchsia"],["FF1493","Deep Pink"],["FF4500","Orange Red"],["FF6347","Tomato"],["FF69B4","Hot Pink"],["FF7F50","Coral"],["FF8C00","Dark Orange"],["FFA07A","Light Salmon"],["FFA500","Orange"],["FFB6C1","Light Pink"],["FFC0CB","Pink"],["FFD700","Gold"],["FFDAB9","Peach Puff"],["FFDEAD","Navajo White"],["FFE4B5","Moccasin"],["FFE4C4","Bisque"],["FFE4E1","Misty Rose"],["FFEBCD","Blanched Almond"],["FFEFD5","Papaya Whip"],["FFF0F5","Lavender Blush"],["FFF5EE","Sea Shell"],["FFF8DC","Cornsilk"],["FFFACD","Lemon Chiffon"],["FFFAF0","Floral White"],["FFFF00","Yellow"],["FFFFE0","Light Yellow"],["FFFFF0","Ivory"],["FFFFFF","White"]];

let audioCtx, oscillator, analyser, gainNode, filter, bassEQ, trebleEQ;
let settings = { vol: 0.05, cutoff: 1500, bass: 0, treble: 0, muted: false, flashDisabled: false };
let currentTextColor = "#fff";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.onresize = resize;
resize();

function initAudio() {
    if (audioCtx) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return;
    }
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    oscillator = audioCtx.createOscillator();
    oscillator.type = 'triangle';

    filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = settings.cutoff;

    bassEQ = audioCtx.createBiquadFilter();
    bassEQ.type = 'lowshelf';
    bassEQ.frequency.value = 200;
    
    trebleEQ = audioCtx.createBiquadFilter();
    trebleEQ.type = 'highshelf';
    trebleEQ.frequency.value = 3000;

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    oscillator.connect(filter);
    filter.connect(bassEQ);
    bassEQ.connect(trebleEQ);
    trebleEQ.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    oscillator.start();
    drawWave();
}

function drawWave() {
    requestAnimationFrame(drawWave);
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.strokeStyle = currentTextColor;
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function updatePitch(idx) {
    if (!oscillator) return;
    const freq = 80 + (idx / 15625) * 520;
    oscillator.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.08);
    const targetVol = settings.muted ? 0 : settings.vol;
    gainNode.gain.setTargetAtTime(targetVol, audioCtx.currentTime, 0.02);
    
    clearTimeout(window.audioTimeout);
    window.audioTimeout = setTimeout(() => {
        gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.2);
    }, 150);
}

// --- HOME SCREEN LOGIC ---
document.getElementById('enter-btn').onclick = () => {
    initAudio(); // Permission granted
    document.getElementById('home-screen').classList.add('fade-out');
    apply(0); // Set initial state
};

// --- UI BUTTONS ---
document.getElementById('mute-btn').onclick = (e) => {
    settings.muted = !settings.muted;
    e.target.textContent = `Mute: ${settings.muted ? 'ON' : 'OFF'}`;
};

document.getElementById('flash-btn').onclick = (e) => {
    settings.flashDisabled = !settings.flashDisabled;
    e.target.textContent = settings.flashDisabled ? 'Enable Flashes' : 'Disable Flashes';
    document.getElementById('sticky').classList.toggle('no-flash', settings.flashDisabled);
};

document.getElementById('vol-slider').oninput = (e) => settings.vol = parseFloat(e.target.value);
document.getElementById('cutoff-slider').oninput = (e) => {
    settings.cutoff = parseFloat(e.target.value);
    if(filter) filter.frequency.setTargetAtTime(settings.cutoff, audioCtx.currentTime, 0.1);
};

const STEPS = 25, TOTAL = 15625;
const sc = document.getElementById('sc'), sticky = document.getElementById('sticky'), nameEl = document.getElementById('color-name'), hx = document.getElementById('hx'), rg = document.getElementById('rg'), fill = document.getElementById('progress-fill'), stepLabel = document.getElementById('step-label'), btn = document.getElementById('random-btn');

function getOfficialName(r, g, b) {
    let minD = Infinity, name = "";
    COLOR_DB.forEach(c => {
        const r2 = parseInt(c[0].substring(0,2), 16), g2 = parseInt(c[0].substring(2,4), 16), b2 = parseInt(c[0].substring(4,6), 16);
        const rMean = (r + r2) / 2;
        const dr = r - r2, dg = g - g2, db = b - b2;
        const d = Math.sqrt((2 + rMean/256) * dr*dr + 4 * dg*dg + (2 + (255-rMean)/256) * db*db);
        if(d < minD) { minD = d; name = c[1]; }
    });
    return name;
}

function apply(idx){
    updatePitch(idx);
    const rIdx = Math.floor(idx / (STEPS * STEPS)), gIdx = Math.floor((idx / STEPS) % STEPS), bIdx = idx % STEPS;
    const r = Math.round((rIdx / (STEPS - 1)) * 255), g = Math.round((gIdx / (STEPS - 1)) * 255), b = Math.round((bIdx / (STEPS - 1)) * 255);
    const bg = `rgb(${r},${g},${b})`;
    
    sticky.style.backgroundColor = bg;
    
    const lum = (r*299+g*587+b*114)/1000;
    const tc = lum > 128 ? '#000' : '#fff';
    currentTextColor = tc;
    const tca = lum > 128 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
    
    nameEl.style.color = tc; nameEl.textContent = getOfficialName(r, g, b);
    hx.style.color = tc; hx.style.borderColor = tc; 
    const hex = `#${r.toString(16).padStart(2,'0').toUpperCase()}${g.toString(16).padStart(2,'0').toUpperCase()}${b.toString(16).padStart(2,'0').toUpperCase()}`;
    hx.textContent = hex;
    hx.dataset.value = hex;
    rg.style.color = tc; rg.style.borderColor = tc; rg.textContent = `RGB(${r}, ${g}, ${b})`;
    stepLabel.style.color = tca; stepLabel.textContent = `SHADE ${idx + 1} / ${TOTAL}`;
    fill.style.background = tc; fill.style.width = `${(idx/(TOTAL-1))*100}%`;
    
    document.querySelectorAll('.menu-btn').forEach(b => {
        b.style.color = tc;
        b.style.borderColor = tc;
    });
    document.querySelectorAll('.ctrl label').forEach(l => l.style.color = tc);
}

sc.addEventListener('scroll', ()=>{
    const t = sc.scrollTop / (sc.scrollHeight - sc.clientHeight);
    apply(Math.floor(t * (TOTAL - 1)));
});

btn.addEventListener('click', ()=>{
    const start = sc.scrollTop, end = Math.random() * (sc.scrollHeight - sc.clientHeight), duration = 1200, startTime = performance.now();
    function anim(now){
        const t = Math.min((now - startTime)/duration, 1), e = t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
        sc.scrollTop = start + (end - start) * e;
        if(t < 1) requestAnimationFrame(anim);
    }
    requestAnimationFrame(anim);
});