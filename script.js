// DOM-based number guessing game (replaces prompt/alert UI)
const min = 0;
const max = 100;
let secret = randomBetween(min, max);
let attempts = 0;
let history = [];

// Elements
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const restartBtn = document.getElementById('restartBtn');
const spinner = document.getElementById('spinner');
const themeToggle = document.getElementById('themeToggle');
const messageEl = document.getElementById('message');
const attemptsEl = document.getElementById('attempts');
const historyEl = document.getElementById('history');
const minEl = document.getElementById('min');
const maxEl = document.getElementById('max');

minEl.textContent = String(min);
maxEl.textContent = String(max);

function randomBetween(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function setMessage(msg, kind = '') {
    messageEl.textContent = msg;
    messageEl.className = 'message ' + kind;
}

function updateMeta() {
    attemptsEl.textContent = String(attempts);
    historyEl.textContent = history.length ? history.join(', ') : '—';
}

function disableInput(state) {
    guessInput.disabled = state;
    guessBtn.disabled = state;
}

function checkGuess() {
    const val = Number(guessInput.value);
    if (Number.isNaN(val)) {
        setMessage('Please enter a valid number.', 'error');
        return;
    }
    if (val < min || val > max) {
        setMessage(`Please enter a number between ${min} and ${max}.`, 'error');
        return;
    }

    attempts += 1;
    history.push(val);
    updateMeta();

    const diff = Math.abs(val - secret);

    if (diff === 0) {
        setMessage(`Congratulations! You guessed ${secret} in ${attempts} attempts.`, 'success');
        disableInput(true);
        // celebration: confetti + sound
        celebrate();
        return;
    }

    // proximity-based feedback (more granular and fun)
    if (diff <= 2) {
        // extremely close
        if (val < secret) setMessage('Extremely close — just a little higher!', 'close');
        else setMessage('Extremely close — just a little lower!', 'close');
        return;
    }
    if (diff <= 5) {
        // very close
        if (val < secret) setMessage('Very close — try a bit higher!', 'close');
        else setMessage('Very close — try a bit lower!', 'close');
        return;
    }
    if (diff <= 10) {
        // close
        if (val < secret) setMessage('Close — you are within 10. Go higher!', 'close');
        else setMessage('Close — you are within 10. Go lower!', 'close');
        return;
    }

    // fallback directional hints when not close
    if (val < secret) setMessage('Too low — try a higher number.', 'low');
    else setMessage('Too high — try a lower number.', 'high');
}

function restart() {
    secret = randomBetween(min, max);
    attempts = 0;
    history = [];
    guessInput.value = '';
    setMessage('Game restarted. Make a guess!', '');
    updateMeta();
    disableInput(false);
    guessInput.focus();
    // remove any leftover confetti or overlays
    const existing = document.querySelectorAll('.confetti-container, .hurrah-overlay');
    existing.forEach(n => n.remove());
    console.log('New secret (dev):', secret);
}

// CELEBRATION: confetti DOM and a short hurrah sound via WebAudio
function celebrate() {
    try {
        console.log('celebrate: start');
        const root = createConfetti();
        showHurrahOverlay();
        playHurrah();
        console.log('celebrate: confetti created', !!root);
    } catch (e) {
        // fail silently if audio/DOM blocked
        console.warn('Celebrate failed', e);
    }
}

function createConfetti() {
    // create a full-viewport fixed container so confetti falls from top across the page
    const confettiRoot = document.createElement('div');
    confettiRoot.className = 'confetti-container';
    // ensure full-viewport overlay
    confettiRoot.style.position = 'fixed';
    confettiRoot.style.inset = '0';
    confettiRoot.style.pointerEvents = 'none';
    confettiRoot.style.zIndex = '9999';
    // create many pieces with random colors/positions
    const colors = ['#f97316','#f43f5e','#10b981','#60a5fa','#a78bfa','#f59e0b'];
    const count = 80; // slightly more pieces for visibility
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        const w = 6 + Math.floor(Math.random() * 12);
        el.style.width = w + 'px';
        el.style.height = (w * 1.6) + 'px';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        // spread across the full viewport width
        el.style.left = (Math.random() * 100) + '%';
        // start slightly above the viewport (use px to avoid vh quirks)
        el.style.top = (-50 - Math.random() * 150) + 'px';
        el.style.transform = `rotate(${Math.random() * 360}deg)`;
        // random delay so pieces start at slightly different times
        const delay = (Math.random() * 300) + 'ms';
        el.style.animationDelay = delay;
        // hint to browser for smoother animation
        el.style.willChange = 'transform, opacity';
        // ensure animation runs even if stylesheet loads later
        el.style.animation = `confetti-fall 1.8s cubic-bezier(.2,.7,.2,1) ${delay} forwards, confetti-spin 1.2s linear ${delay} infinite`;
        confettiRoot.appendChild(el);
    }
    // append to body so it covers the whole page
    document.body.appendChild(confettiRoot);
    console.log('createConfetti: created', confettiRoot.children.length, 'pieces');
    // debug: log first few pieces computed styles to verify animations are applied
    for (let i = 0; i < Math.min(4, confettiRoot.children.length); i++) {
        const c = confettiRoot.children[i];
        const cs = window.getComputedStyle(c);
        console.log(`piece[${i}] left=${c.style.left} top=${c.style.top} anim=${cs.animation}`);
    }
    // fade and remove after the animation
    setTimeout(() => {
        confettiRoot.classList.add('confetti-fade');
        setTimeout(() => confettiRoot.remove(), 2200);
    }, 1800);
    // return container so callers can inspect/remove it if needed
    return confettiRoot;
}

function showHurrahOverlay() {
    // big centered overlay to make celebration obvious
    const overlay = document.createElement('div');
    overlay.className = 'hurrah-overlay';
    overlay.innerHTML = '<div class="hurrah">HURRAH!</div>';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('visible'), 20);
    // remove later
    setTimeout(() => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 700);
    }, 1800);
    return overlay;
}

function playHurrah() {
    // short sequence using WebAudio
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    // create three oscillators for a short chord
    const freqs = [520, 660, 780];
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    gain.connect(ctx.destination);
    freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = i === 0 ? 'sawtooth' : 'triangle';
        o.frequency.setValueAtTime(f, now);
        g.gain.setValueAtTime(0.6 / (i + 1), now);
        o.connect(g);
        g.connect(gain);
        o.start(now);
        o.stop(now + 1.0 + Math.random() * 0.3);
    });
}

// Rolling animation: play animation then evaluate
function handleCheck() {
    // simple UX: require a non-empty input
    if (guessInput.value.trim() === '') {
        setMessage('Type a number before checking.', 'error');
        return;
    }

    // start spinner animation
    if (spinner) spinner.classList.add('spinning');
    disableInput(true);

    const duration = 900; // ms (matches CSS)
    setTimeout(() => {
        if (spinner) spinner.classList.remove('spinning');
        disableInput(false);
        checkGuess();
    }, duration);
}

// theme toggle
function applyTheme(theme) {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('rn_theme', next);
}

// wire up events
guessBtn.addEventListener('click', handleCheck);
restartBtn.addEventListener('click', restart);
themeToggle.addEventListener('click', toggleTheme);

// allow Enter key to submit
guessInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleCheck();
    }
});

// init
setMessage('Enter a number and press Check.', '');
updateMeta();
console.log('Secret (dev):', secret);

// apply saved theme
const savedTheme = localStorage.getItem('rn_theme') || 'light';
applyTheme(savedTheme);
