// Audio and Speech Service for Hossein & Fatemeh App
import { audioCacheDB } from './audioCacheDB';

class AudioService {
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private recognition: any = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Synthesized UI Sound Effects
  playSuccessSound() {
    this.playCorrectSound();
  }

  playCorrectSound() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // First chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Second high chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now + 0.1); // D6
      gain2.gain.setValueAtTime(0.25, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.45);
    } catch {
      // AudioContext not allowed before user interaction
    }
  }

  playWrongSound() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.25);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // ignore
    }
  }

  playClickSound() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  playFanfareSound() {
    try {
      const ctx = this.getAudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.09;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {
      // ignore
    }
  }

  playStreakSound() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // ignore
    }
  }

  playHeartLossSound() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // ignore
    }
  }

  // Text-To-Speech with IndexedDB Offline Asset Lookup and Multi-tier Fallback
  speak(text: string, langCode: string = 'en-US', speed: number = 1.0, onEnd?: () => void) {
    if (!text || !text.trim()) {
      onEnd?.();
      return;
    }

    // Save audio phrase meta to IndexedDB cache in background for offline recall
    const cacheKey = audioCacheDB.generateKey(text, langCode, speed);
    audioCacheDB
      .setCachedAudio(cacheKey, {
        text,
        lang: langCode,
        contentType: 'audio/speech-meta',
      })
      .catch(() => {});

    // Stop any currently playing audio element
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }

    // Map language code to TTS locale & short code
    let locale = 'en-US';
    let shortLang = 'en';
    if (langCode.startsWith('de')) {
      locale = 'de-DE';
      shortLang = 'de';
    } else if (langCode.startsWith('fr')) {
      locale = 'fr-FR';
      shortLang = 'fr';
    } else if (langCode.startsWith('es')) {
      locale = 'es-ES';
      shortLang = 'es';
    } else if (langCode.startsWith('it')) {
      locale = 'it-IT';
      shortLang = 'it';
    } else if (langCode.startsWith('tr')) {
      locale = 'tr-TR';
      shortLang = 'tr';
    } else if (langCode.startsWith('ar')) {
      locale = 'ar-SA';
      shortLang = 'ar';
    } else if (langCode.startsWith('ja')) {
      locale = 'ja-JP';
      shortLang = 'ja';
    } else if (langCode.startsWith('ru')) {
      locale = 'ru-RU';
      shortLang = 'ru';
    } else if (langCode.startsWith('zh')) {
      locale = 'zh-CN';
      shortLang = 'zh';
    } else if (langCode.startsWith('fa')) {
      locale = 'fa-IR';
      shortLang = 'fa';
    } else if (langCode.startsWith('en')) {
      locale = 'en-US';
      shortLang = 'en';
    } else {
      locale = langCode;
      shortLang = langCode.slice(0, 2);
    }

    // Secondary fallback using server-side TTS proxy and upstream audio stream
    const playFallbackAudioStream = () => {
      try {
        const proxyTtsUrl = `/api/tts?lang=${encodeURIComponent(shortLang)}&text=${encodeURIComponent(text)}`;
        const directTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
          shortLang,
        )}&q=${encodeURIComponent(text)}`;

        const audio = new Audio(proxyTtsUrl);
        audio.playbackRate = Math.max(0.6, Math.min(1.6, speed));
        this.currentAudioElement = audio;

        let finished = false;
        const complete = () => {
          if (finished) return;
          finished = true;
          this.currentAudioElement = null;
          onEnd?.();
        };

        audio.onended = () => complete();

        audio.onerror = () => {
          // Fallback to direct client URL if server proxy has issue
          try {
            const fallbackAudio = new Audio(directTtsUrl);
            fallbackAudio.playbackRate = Math.max(0.6, Math.min(1.6, speed));
            this.currentAudioElement = fallbackAudio;
            fallbackAudio.onended = () => complete();
            fallbackAudio.onerror = () => complete();
            const p2 = fallbackAudio.play();
            if (p2 !== undefined) {
              p2.catch(() => complete());
            }
          } catch {
            complete();
          }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If autoplay policy or network blocked, attempt direct or complete
            audio.onerror?.(new Event('error'));
          });
        }
      } catch {
        onEnd?.();
      }
    };

    if (!('speechSynthesis' in window)) {
      playFallbackAudioStream();
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }

    const availableVoices =
      this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();

    const matchingVoice = availableVoices.find(
      (v) =>
        v.lang.toLowerCase().startsWith(locale.toLowerCase().slice(0, 2)) ||
        v.lang.toLowerCase().includes(shortLang) ||
        v.name.toLowerCase().includes(shortLang === 'fa' ? 'persian' : shortLang) ||
        v.name.toLowerCase().includes(shortLang === 'fa' ? 'farsi' : shortLang) ||
        (shortLang === 'fa' && (v.lang.toLowerCase().includes('fa-') || v.name.toLowerCase().includes('iran'))),
    );

    // If Persian is requested and no Persian voice exists on the client device, use high-fidelity server audio stream directly
    if (shortLang === 'fa' && !matchingVoice) {
      playFallbackAudioStream();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.rate = Math.max(0.4, Math.min(1.8, speed));
      utterance.pitch = 1.0;

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      let hasFinished = false;
      utterance.onend = () => {
        if (hasFinished) return;
        hasFinished = true;
        this.currentUtterance = null;
        onEnd?.();
      };

      utterance.onerror = () => {
        if (hasFinished) return;
        hasFinished = true;
        this.currentUtterance = null;
        // If Web Speech API fails, seamlessly invoke stream fallback
        playFallbackAudioStream();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      playFallbackAudioStream();
    }
  }

  // Dedicated Persian Voice Speech Function (تلفظ و خواندن صوتی متون و ترجمه‌های فارسی)
  speakPersian(text: string, speed: number = 0.95, onEnd?: () => void) {
    if (!text || !text.trim()) {
      onEnd?.();
      return;
    }
    this.playClickSound();
    this.speak(text, 'fa-IR', speed, onEnd);
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }
    this.currentUtterance = null;
  }

  // Speech Recognition (Web Speech API)
  isSpeechRecognitionSupported(): boolean {
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  startListening(
    langCode: string,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void,
  ): boolean {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError(new Error('Speech recognition not supported in this browser.'));
      return false;
    }

    try {
      this.stopListening();
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      let locale = 'en-US';
      if (langCode === 'de' || langCode.startsWith('de')) locale = 'de-DE';
      else if (langCode === 'fr' || langCode.startsWith('fr')) locale = 'fr-FR';
      else if (langCode === 'es' || langCode.startsWith('es')) locale = 'es-ES';
      else if (langCode === 'it' || langCode.startsWith('it')) locale = 'it-IT';
      else if (langCode === 'tr' || langCode.startsWith('tr')) locale = 'tr-TR';
      else if (langCode === 'ar' || langCode.startsWith('ar')) locale = 'ar-SA';
      else if (langCode === 'ja' || langCode.startsWith('ja')) locale = 'ja-JP';
      else if (langCode === 'ru' || langCode.startsWith('ru')) locale = 'ru-RU';
      else if (langCode === 'zh' || langCode.startsWith('zh')) locale = 'zh-CN';
      else if (langCode === 'fa' || langCode.startsWith('fa')) locale = 'fa-IR';
      else if (langCode === 'en' || langCode.startsWith('en')) locale = 'en-US';
      recognition.lang = locale;

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        onResult(final || interim, !!final);
      };

      recognition.onerror = (event: any) => {
        onError(event.error);
      };

      recognition.onend = () => {
        onEnd();
      };

      this.recognition = recognition;
      recognition.start();
      return true;
    } catch (e) {
      onError(e);
      return false;
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
  }

  // Pronunciation Match Scoring Algorithm (Levenshtein + token overlap + detailed feedback)
  evaluatePronunciation(spoken: string, target: string): {
    score: number;
    accuracy: 'perfect' | 'great' | 'good' | 'retry';
    feedbackFa: string;
    wordTokens: { word: string; isMatched: boolean; score: number }[];
  } {
    const cleanSpoken = spoken.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '').trim();
    const cleanTarget = target.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '').trim();

    if (!cleanSpoken) {
      const emptyWords = cleanTarget.split(/\s+/).filter(Boolean).map(w => ({ word: w, isMatched: false, score: 0 }));
      return { score: 0, accuracy: 'retry', feedbackFa: 'صدایی شنیده نشد، لطفاً بلندتر و واضح‌تر در میکروفون صحبت کنید.', wordTokens: emptyWords };
    }

    const spokenTokens = cleanSpoken.split(/\s+/).filter(Boolean);
    const targetTokens = cleanTarget.split(/\s+/).filter(Boolean);

    // Evaluate each word individually
    const wordTokens = targetTokens.map((tWord) => {
      let bestSim = 0;
      for (const sWord of spokenTokens) {
        if (sWord === tWord) {
          bestSim = 100;
          break;
        }
        const d = this.levenshtein(sWord, tWord);
        const maxL = Math.max(sWord.length, tWord.length);
        const sim = Math.max(0, Math.round((1 - d / maxL) * 100));
        if (sim > bestSim) bestSim = sim;
      }
      return {
        word: tWord,
        isMatched: bestSim >= 70,
        score: bestSim,
      };
    });

    if (cleanSpoken === cleanTarget) {
      return {
        score: 100,
        accuracy: 'perfect',
        feedbackFa: 'تلفظ فوق‌العاده، دقیق و ۱۰۰٪ شبیه گوینده بومی!',
        wordTokens,
      };
    }

    // Levenshtein overall distance
    const dist = this.levenshtein(cleanSpoken, cleanTarget);
    const maxLen = Math.max(cleanSpoken.length, cleanTarget.length);
    const similarity = Math.max(0, Math.round((1 - dist / maxLen) * 100));

    // Word token overlap
    const matchedTokensCount = wordTokens.filter(w => w.isMatched).length;
    const tokenScore = targetTokens.length > 0 ? Math.round((matchedTokensCount / targetTokens.length) * 100) : 0;

    const finalScore = Math.min(100, Math.max(0, Math.round(similarity * 0.55 + tokenScore * 0.45)));

    if (finalScore >= 88) {
      return {
        score: finalScore,
        accuracy: 'perfect',
        feedbackFa: 'عالی! ریتم، لحن و ادای کلمات بسیار شبیه گوینده بومی است.',
        wordTokens,
      };
    } else if (finalScore >= 70) {
      return {
        score: finalScore,
        accuracy: 'great',
        feedbackFa: 'بسیار خوب! پیام شما کاملاً قابل فهم و روان ادا شد.',
        wordTokens,
      };
    } else if (finalScore >= 50) {
      return {
        score: finalScore,
        accuracy: 'good',
        feedbackFa: 'خوب؛ به کلماتی که قرمز یا زرد هستند توجه کنید و دوباره تمرین نمایید.',
        wordTokens,
      };
    } else {
      return {
        score: finalScore,
        accuracy: 'retry',
        feedbackFa: 'تلفظ مفهوم نبود یا با جمله هدف تطابق نداشت؛ صوت نمونه را بشنوید و مجدد بخوانید.',
        wordTokens,
      };
    }
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}

export const audioService = new AudioService();
