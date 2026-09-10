/**
 * Configuration template for Chinese Pronunciation Trainer.
 * 
 * Copy this file to config.js and fill in your credentials:
 *   cp js/config.example.js js/config.js
 * 
 * Get free Azure Speech API key at:
 *   https://portal.azure.com/ → Create "Speech services" resource (F0 Free Tier)
 */
(() => {
window.ChineseApp = window.ChineseApp || {};

window.ChineseApp.config = {
    // Azure TTS credentials (free tier: 500K chars/month)
    azureKey: 'YOUR_AZURE_API_KEY_HERE',
    azureRegion: 'eastus',

    // Default TTS engine: 'azure' or 'web'
    defaultEngine: 'azure',

    // Default voice: 'female' (Xiaoxiao) or 'male' (Yunxi)
    defaultVoice: 'female',

    // Default delay between items (seconds)
    defaultDelay: 2.5,

    // Loop mode enabled by default
    defaultLoop: false,

    // Default UI language: 'ru' or 'en'
    defaultLang: 'ru'
};

})();

