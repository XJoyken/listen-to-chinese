(() => {
const dictionary = {
    ru: {
        title: "Тренировка произношения",
        inputPlaceholder: "Введите пиньинь или иероглифы (разделяйте пробелами, запятыми или новыми строками)",
        startBtn: "Старт (Перемешать)",
        playPauseBtn: "Пауза",
        resumeBtn: "Продолжить",
        repeatBtn: "Повторить",
        reshuffleBtn: "Перемешать заново",
        settingsTitle: "Настройки",
        ttsEngineLabel: "TTS Движок:",
        voiceLabel: "Голос:",
        engineAzure: "Azure TTS",
        engineWeb: "Web Speech API",
        voiceFemale: "Xiaoxiao (Женский)",
        voiceMale: "Yunxi (Мужской)",
        delayLabel: "Задержка (сек):",
        loopLabel: "Зациклить воспроизведение",
        languageLabel: "Язык:",
        progress: "Прогресс:",
        endMessage: "Завершено",
        errorEmptyInput: "Пожалуйста, введите текст",
        errorNoTts: "TTS недоступен",
        invalidItemsWarning: "Неверный формат:",
        startupMessage: "Введите текст и нажмите Старт",
        delayUnit: " с"
    },
    en: {
        title: "Pronunciation Training",
        inputPlaceholder: "Enter pinyin or characters (separated by spaces, commas, or newlines)",
        startBtn: "Start (Shuffle)",
        playPauseBtn: "Pause",
        resumeBtn: "Resume",
        repeatBtn: "Repeat",
        reshuffleBtn: "Reshuffle & Restart",
        settingsTitle: "Settings",
        ttsEngineLabel: "TTS Engine:",
        voiceLabel: "Voice:",
        engineAzure: "Azure TTS",
        engineWeb: "Web Speech API",
        voiceFemale: "Xiaoxiao (Female)",
        voiceMale: "Yunxi (Male)",
        delayLabel: "Delay (sec):",
        loopLabel: "Loop playback",
        languageLabel: "Language:",
        progress: "Progress:",
        endMessage: "Completed",
        errorEmptyInput: "Please enter some text",
        errorNoTts: "TTS unavailable",
        invalidItemsWarning: "Invalid format:",
        startupMessage: "Enter text and press Start",
        delayUnit: " s"
    }
};

window.ChineseApp = window.ChineseApp || {};

let currentLang = localStorage.getItem('appLang')
    || (window.ChineseApp && window.ChineseApp.config && window.ChineseApp.config.defaultLang)
    || 'ru';

function getLang() {
    return currentLang;
}

function setLang(lang) {
    if (dictionary[lang]) {
        currentLang = lang;
        localStorage.setItem('appLang', lang);
        updateUI();
    }
}

function t(key) {
    return dictionary[currentLang][key] || key;
}

function updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.tagName === 'INPUT' && el.type === 'button') {
            el.value = t(key);
        } else if (el.tagName === 'TEXTAREA') {
            el.placeholder = t(key);
        } else {
            el.textContent = t(key);
        }
    });
}

// Initial setup to run on load
function initI18n() {
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', (e) => setLang(e.target.value));
    }
    updateUI();
}

window.ChineseApp.getLang = getLang;
window.ChineseApp.setLang = setLang;
window.ChineseApp.t = t;
window.ChineseApp.initI18n = initI18n;

})();
