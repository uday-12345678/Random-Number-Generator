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
    console.log('New secret (dev):', secret);
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