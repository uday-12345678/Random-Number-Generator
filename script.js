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
        // remove any leftover confetti
        const existing = document.querySelectorAll('.confetti-container');
        existing.forEach(n => n.remove());
        console.log('New secret (dev):', secret);
}

// CELEBRATION: confetti DOM and a short hurrah sound via WebAudio
function celebrate() {
    try {
        createConfetti();
        playHurrah();
    } catch (e) {
        // fail silently if audio/DOM blocked
        console.warn('Celebrate failed', e);
    }
}

function createConfetti() {
    const container = document.querySelector('.container') || document.body;
    const confettiRoot = document.createElement('div');
    confettiRoot.className = 'confetti-container';
    // create many pieces with random colors/positions
    const colors = ['#f97316','#f43f5e','#10b981','#60a5fa','#a78bfa','#f59e0b'];
    const count = 40;
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        const w = 6 + Math.floor(Math.random() * 10);
        el.style.width = w + 'px';
        el.style.height = (w * 1.6) + 'px';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.transform = `translateY(-10vh) rotate(${Math.random() * 360}deg)`;
        // random delay so pieces start at slightly different times
        el.style.animationDelay = (Math.random() * 300) + 'ms';
        confettiRoot.appendChild(el);
    }
    // append and auto-remove
    container.appendChild(confettiRoot);
    setTimeout(() => {
        confettiRoot.classList.add('confetti-fade');
        setTimeout(() => confettiRoot.remove(), 2000);
    }, 1800);
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
