(() => {
// TTS module (Azure + Web Speech API fallback)

window.ChineseApp = window.ChineseApp || {};

class TTSController {
    constructor() {
        this.azureSynthesizer = null;
        this.fallbackSynth = window.speechSynthesis;
        this.isSpeaking = false;
        this.onComplete = null;
    }

    async speak(text, engine, voice, azureKey, azureRegion) {
        this.stop(); // Stop any ongoing speech
        return new Promise(async (resolve, reject) => {
            this.isSpeaking = true;
            this.onComplete = resolve;

            if (engine === 'azure' && window.SpeechSDK && azureKey && azureRegion) {
                try {
                    const speechConfig = window.SpeechSDK.SpeechConfig.fromSubscription(azureKey, azureRegion);
                    speechConfig.speechSynthesisLanguage = "zh-CN";
                    speechConfig.speechSynthesisVoiceName = voice === 'male' ? 'zh-CN-YunxiNeural' : 'zh-CN-XiaoxiaoNeural';
                    
                    this.azureSynthesizer = new window.SpeechSDK.SpeechSynthesizer(speechConfig);
                    
                    this.azureSynthesizer.speakTextAsync(
                        text,
                        result => {
                            if (result.reason === window.SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                                if (this.isSpeaking) resolve();
                            } else {
                                console.error("Azure speech error.");
                                this.speakFallback(text).then(() => {
                                    if(this.isSpeaking) resolve();
                                }).catch(reject);
                            }
                            if (this.azureSynthesizer) {
                                this.azureSynthesizer.close();
                                this.azureSynthesizer = null;
                            }
                        },
                        error => {
                            console.error(error);
                            this.speakFallback(text).then(() => {
                                if(this.isSpeaking) resolve();
                            }).catch(reject);
                            if (this.azureSynthesizer) {
                                this.azureSynthesizer.close();
                                this.azureSynthesizer = null;
                            }
                        });
                } catch (e) {
                    console.error("Azure error, falling back:", e);
                    this.speakFallback(text).then(() => {
                        if(this.isSpeaking) resolve();
                    }).catch(reject);
                }
            } else {
                this.speakFallback(text).then(() => {
                    if(this.isSpeaking) resolve();
                }).catch(reject);
            }
        });
    }

    speakFallback(text) {
        return new Promise((resolve, reject) => {
            if (!this.fallbackSynth) {
                reject("Web Speech API not available.");
                return;
            }
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "zh-CN";
            
            // Try to find a Chinese voice
            const voices = this.fallbackSynth.getVoices();
            const zhVoice = voices.find(v => v.lang.startsWith('zh'));
            if (zhVoice) {
                utterance.voice = zhVoice;
            }
            
            utterance.onend = () => resolve();
            utterance.onerror = (e) => reject(e);
            
            this.fallbackSynth.speak(utterance);
        });
    }
    
    stop() {
        this.isSpeaking = false;
        if (this.fallbackSynth) {
            this.fallbackSynth.cancel();
        }
        if (this.azureSynthesizer) {
            try {
                this.azureSynthesizer.close();
            } catch (e) {}
            this.azureSynthesizer = null;
        }
        this.onComplete = null;
    }
}

window.ChineseApp.TTSController = TTSController;

})();
