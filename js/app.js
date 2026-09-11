(() => {
const { initI18n, t, getLang, parseInput, shuffle, TTSController, config } = window.ChineseApp;
const cfg = config || {};

let playlist = [];
let currentIndex = 0;
let isPlaying = false;
let isWaitingForDelay = false;
let timeoutId = null;
let tts = new TTSController();

// DOM Elements
const elements = {
    input: document.getElementById('inputText'),
    startBtn: document.getElementById('startBtn'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    reshuffleBtn: document.getElementById('reshuffleBtn'),
    
    displayArea: document.getElementById('displayArea'),
    displayText: document.getElementById('displayText'),
    progressText: document.getElementById('progressText'),
    historyArea: document.getElementById('historyArea'),
    
    settingsToggle: document.getElementById('settingsToggle'),
    settingsPanel: document.getElementById('settingsPanel'),
    
    engineSelect: document.getElementById('engineSelect'),
    voiceSelect: document.getElementById('voiceSelect'),
    delayRange: document.getElementById('delayRange'),
    delayValue: document.getElementById('delayValue'),
    loopToggle: document.getElementById('loopToggle'),
};

function loadSettings() {
    elements.engineSelect.value = localStorage.getItem('ttsEngine') || cfg.defaultEngine || 'web';
    elements.voiceSelect.value = localStorage.getItem('ttsVoice') || cfg.defaultVoice || 'female';
    elements.delayRange.value = localStorage.getItem('ttsDelay') || cfg.defaultDelay || '2.5';
    elements.delayValue.textContent = elements.delayRange.value + t('delayUnit');
    elements.loopToggle.checked = localStorage.getItem('ttsLoop') !== null
        ? localStorage.getItem('ttsLoop') === 'true'
        : (cfg.defaultLoop || false);
}

function saveSettings() {
    localStorage.setItem('ttsEngine', elements.engineSelect.value);
    localStorage.setItem('ttsVoice', elements.voiceSelect.value);
    localStorage.setItem('ttsDelay', elements.delayRange.value);
    localStorage.setItem('ttsLoop', elements.loopToggle.checked);
}

function updateDelayDisplay() {
    elements.delayValue.textContent = elements.delayRange.value + t('delayUnit');
    saveSettings();
}

function attachListeners() {
    elements.engineSelect.addEventListener('change', saveSettings);
    elements.voiceSelect.addEventListener('change', saveSettings);
    elements.delayRange.addEventListener('input', updateDelayDisplay);
    elements.loopToggle.addEventListener('change', saveSettings);
    
    elements.settingsToggle.addEventListener('click', () => {
        elements.settingsPanel.classList.toggle('hidden');
    });

    elements.startBtn.addEventListener('click', startSession);
    elements.playPauseBtn.addEventListener('click', togglePlayPause);
    elements.repeatBtn.addEventListener('click', repeatCurrent);
    elements.reshuffleBtn.addEventListener('click', reshuffleAndRestart);
    elements.langSelect = document.getElementById('langSelect');
    if (elements.langSelect) {
        elements.langSelect.addEventListener('change', () => {
            updateDelayDisplay();
            if (elements.displayText.hasAttribute('data-i18n')) {
                elements.displayText.textContent = t(elements.displayText.getAttribute('data-i18n'));
            }
            if (isPlaying || (!isPlaying && currentIndex > 0 && currentIndex < playlist.length)) {
                elements.progressText.textContent = `${t('progress')} ${currentIndex + 1} / ${playlist.length}`;
            }
        });
    }
    
    elements.input.addEventListener('input', validateInput);
}

function validateInput() {
    const text = elements.input.value;
    const parsed = parseInput(text);
    const invalidItems = parsed.filter(item => !item.isValid);
    const validationWarning = document.getElementById('validationWarning');
    if (invalidItems.length > 0) {
        const invalidTexts = invalidItems.map(i => i.text).join(', ');
        validationWarning.textContent = `${t('invalidItemsWarning')} ${invalidTexts}`;
        validationWarning.classList.remove('hidden');
    } else {
        validationWarning.classList.add('hidden');
    }
}

function appendToHistory(item) {
    const el = document.createElement('div');
    el.className = 'history-item';
    if (item.isChinese) el.classList.add('large-char');
    el.textContent = item.text;
    elements.historyArea.appendChild(el);
}

function startSession() {
    const text = elements.input.value;
    if (!text.trim()) {
        alert(t('errorEmptyInput'));
        return;
    }
    const parsed = parseInput(text);
    const validItems = parsed.filter(item => item.isValid);
    if (validItems.length === 0) return;
    
    playlist = shuffle(validItems);
    currentIndex = 0;
    isPlaying = true;
    isWaitingForDelay = false;
    elements.historyArea.innerHTML = '';
    
    elements.playPauseBtn.disabled = false;
    elements.repeatBtn.disabled = false;
    elements.reshuffleBtn.disabled = false;
    
    updateControlsState();
    playCurrentItem();
}

function reshuffleAndRestart() {
    if (playlist.length === 0) return;
    tts.stop();
    clearTimeout(timeoutId);
    isWaitingForDelay = false;
    
    playlist = shuffle([...playlist]);
    currentIndex = 0;
    isPlaying = true;
    elements.historyArea.innerHTML = '';
    
    elements.playPauseBtn.disabled = false;
    elements.repeatBtn.disabled = false;
    elements.reshuffleBtn.disabled = false;
    
    updateControlsState();
    playCurrentItem();
}

function togglePlayPause() {
    if (playlist.length === 0) return;
    
    if (isPlaying) {
        // Pause
        isPlaying = false;
        tts.stop();
        clearTimeout(timeoutId);
        elements.playPauseBtn.setAttribute('data-i18n', 'resumeBtn');
        elements.playPauseBtn.textContent = t('resumeBtn');
    } else {
        // Resume
        isPlaying = true;
        elements.playPauseBtn.setAttribute('data-i18n', 'playPauseBtn');
        elements.playPauseBtn.textContent = t('playPauseBtn');
        
        if (isWaitingForDelay) {
            isWaitingForDelay = false;
            appendToHistory(playlist[currentIndex]);
            currentIndex++;
        }
        playCurrentItem();
    }
}

function repeatCurrent() {
    if (playlist.length === 0 || currentIndex >= playlist.length) return;
    tts.stop();
    clearTimeout(timeoutId);
    isWaitingForDelay = false;
    if (!isPlaying) {
        isPlaying = true;
        updateControlsState();
    }
    playCurrentItem();
}

async function playCurrentItem() {
    isWaitingForDelay = false;
    if (currentIndex >= playlist.length) {
        if (elements.loopToggle.checked) {
            reshuffleAndRestart();
        } else {
            isPlaying = false;
            elements.displayText.textContent = t('endMessage');
            elements.displayText.setAttribute('data-i18n', 'endMessage');
            elements.progressText.textContent = "";
            elements.playPauseBtn.disabled = true;
            elements.repeatBtn.disabled = true;
            updateControlsState();
        }
        return;
    }
    
    const item = playlist[currentIndex];
    
    elements.displayText.classList.remove('fade-in');
    void elements.displayText.offsetWidth; // trigger reflow
    elements.displayText.classList.add('fade-in');
    elements.displayText.removeAttribute('data-i18n');
    elements.displayText.textContent = item.text;
    elements.displayText.addEventListener('animationend', () => {
        elements.displayText.classList.remove('fade-in');
    }, { once: true });
    if (item.isChinese) {
        elements.displayText.classList.add('large-char');
    } else {
        elements.displayText.classList.remove('large-char');
    }
    
    elements.progressText.textContent = `${t('progress')} ${currentIndex + 1} / ${playlist.length}`;
    
    try {
        await tts.speak(
            item.text,
            elements.engineSelect.value,
            elements.voiceSelect.value,
            cfg.azureKey,
            cfg.azureRegion
        );
    } catch (e) {
        console.error("TTS error:", e);
    }
    
    if (!isPlaying) return; // if paused during speech
    
    const delayMs = parseFloat(elements.delayRange.value) * 1000;
    
    isWaitingForDelay = true;
    timeoutId = setTimeout(() => {
        isWaitingForDelay = false;
        if (isPlaying) {
            appendToHistory(playlist[currentIndex]);
            currentIndex++;
            playCurrentItem();
        }
    }, delayMs);
}

function updateControlsState() {
    if (isPlaying) {
        elements.playPauseBtn.setAttribute('data-i18n', 'playPauseBtn');
        elements.playPauseBtn.textContent = t('playPauseBtn');
    } else {
        elements.playPauseBtn.setAttribute('data-i18n', 'resumeBtn');
        elements.playPauseBtn.textContent = t('resumeBtn');
    }
}

// Ensure speech voices are loaded for Web Speech API
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {};
}

window.addEventListener('DOMContentLoaded', () => {
    initI18n();
    loadSettings();
    attachListeners();
    elements.displayText.textContent = t('startupMessage');
    elements.displayText.setAttribute('data-i18n', 'startupMessage');
});

})();
