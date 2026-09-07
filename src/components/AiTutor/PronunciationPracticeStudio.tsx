import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  Award,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Flame,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  BookOpen,
  Send,
  Zap,
  Info,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';
import { SUPPORTED_LANGUAGES } from '../../data/curriculumData';
import { TargetLanguageCode } from '../../types';

interface WordAnalysis {
  word: string;
  phonetic: string;
  score: number;
  status: 'perfect' | 'good' | 'needs_work' | 'missed';
  feedbackFa: string;
  tip: string;
}

interface PronunciationResult {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  recognizedText: string;
  phoneticIPA: string;
  wordsAnalysis: WordAnalysis[];
  detailedFeedbackFa: string;
  intonationAndRhythmTip: string;
  followUpPracticePhrase?: string;
  xpEarned: number;
}

interface PracticePhrasePreset {
  id: string;
  phrase: string;
  translationFa: string;
  phonetic: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: 'daily' | 'travel' | 'food' | 'business' | 'phonetics';
}

const DEFAULT_PHRASES: Record<TargetLanguageCode, PracticePhrasePreset[]> = {
  en: [
    {
      id: 'en_1',
      phrase: 'Good morning, how are you doing today?',
      translationFa: 'صبح بخیر، امروز چطور هستید؟',
      phonetic: '/ɡʊd ˈmɔːrnɪŋ haʊ ɑːr juː ˈduːɪŋ təˈdeɪ/',
      level: 'A1',
      category: 'daily',
    },
    {
      id: 'en_2',
      phrase: 'Could you please tell me the way to the train station?',
      translationFa: 'می‌شود لطفاً راه ایستگاه قطار را به من نشان دهید؟',
      phonetic: '/kʊd juː pliːz tɛl miː ðə weɪ tuː ðə treɪn ˈsteɪʃən/',
      level: 'A2',
      category: 'travel',
    },
    {
      id: 'en_3',
      phrase: 'I would like to order a black coffee and a croissant, please.',
      translationFa: 'می‌خواهم یک قهوه تلخ و یک کروسان سفارش دهم، لطفاً.',
      phonetic: '/aɪ wʊd laɪk tuː ˈɔːrdər ə blæk ˈkɒfi ænd ə kwɑːˈsɒ̃ pliːz/',
      level: 'A2',
      category: 'food',
    },
    {
      id: 'en_4',
      phrase: 'Consistent daily practice is the secret to mastering fluent speech.',
      translationFa: 'تمرین مداوم روزانه، راز تسلط بر گفتار روان است.',
      phonetic: '/kənˈsɪstənt ˈdeɪli ˈpræktɪs ɪz ðə ˈsiːkrət tuː ˈmæstərɪŋ ˈfluːənt spiːtʃ/',
      level: 'B1',
      category: 'phonetics',
    },
    {
      id: 'en_5',
      phrase: 'We look forward to discussing the collaboration opportunities with your team.',
      translationFa: 'مشتاقانه منتظر گفتگو درباره فرصت‌های همکاری با تیم شما هستیم.',
      phonetic: '/wiː lʊk ˈfɔːrwərd tuː dɪˈskʌsɪŋ ðə kəˌlæbəˈreɪʃən ˌɒpərˈtuːnətiz wɪð jɔːr tiːm/',
      level: 'B2',
      category: 'business',
    },
    {
      id: 'en_6',
      phrase: 'She sells seashells by the seashore with rhythmic clarity.',
      translationFa: 'او صدف‌های دریایی را در ساحل با وضوح ریتمیک می‌فروشد (تمرین تلفظ s و sh).',
      phonetic: '/ʃiː sɛlz ˈsiːʃɛlz baɪ ðə ˈsiːʃɔːr wɪð ˈrɪðmɪk ˈklærɪti/',
      level: 'C1',
      category: 'phonetics',
    },
  ],
  de: [
    {
      id: 'de_1',
      phrase: 'Guten Tag, wie geht es Ihnen heute?',
      translationFa: 'روز بخیر، امروز حال شما چطور است؟',
      phonetic: '/ˈɡuːtn̩ taːk viː ɡeːt ɛs ˈiːnən ˈhɔɪ̯tə/',
      level: 'A1',
      category: 'daily',
    },
    {
      id: 'de_2',
      phrase: 'Entschuldigung, wo ist der nächste Bahnhof?',
      translationFa: 'ببخشید، نزدیک‌ترین ایستگاه قطار کجاست؟',
      phonetic: '/ɛntˈʃʊldɪɡʊŋ voː ɪst deːɐ̯ ˈnɛːçstə ˈbaːnhoːf/',
      level: 'A2',
      category: 'travel',
    },
    {
      id: 'de_3',
      phrase: 'Übung macht den Meister beim Deutschlernen.',
      translationFa: 'کار نیکو کردن از پر کردن است (تمرین باعث استادی می‌شود).',
      phonetic: '/ˈyːbʊŋ maxt deːn ˈmaɪ̯stɐ baɪ̯m ˈdɔɪ̯t͡ʃˌlɛʁnən/',
      level: 'B1',
      category: 'phonetics',
    },
  ],
  fr: [
    {
      id: 'fr_1',
      phrase: 'Bonjour, comment allez-vous aujourd’hui ?',
      translationFa: 'سلام، امروز چطور هستید؟',
      phonetic: '/bɔ̃ʒuʁ kɔmɑ̃ tale vu oʒuʁdɥi/',
      level: 'A1',
      category: 'daily',
    },
    {
      id: 'fr_2',
      phrase: 'Je voudrais réserver une table pour deux personnes.',
      translationFa: 'می‌خواهم یک میز برای دو نفر رزرو کنم.',
      phonetic: '/ʒə vudʁɛ ʁezɛʁve yn tablə puʁ dø pɛʁsɔn/',
      level: 'A2',
      category: 'food',
    },
    {
      id: 'fr_3',
      phrase: 'La pratique régulière permet d’améliorer la prononciation.',
      translationFa: 'تمرین منظم باعث بهبود تلفظ می‌شود.',
      phonetic: '/la pʁatik ʁeɡyljɛʁ pɛʁmɛ dameljoʁe la pʁonɔ̃sjasjɔ̃/',
      level: 'B1',
      category: 'phonetics',
    },
  ],
  es: [
    {
      id: 'es_1',
      phrase: '¡Hola! ¿Cómo estás hoy? Mucho gusto en conocerte.',
      translationFa: 'سلام! امروز چطوری؟ از آشنایی با شما خیلی خوشحالم.',
      phonetic: '/ˈola ˈkomo esˈtas oj ˈmutʃo ˈɣusto en konoˈseɾte/',
      level: 'A1',
      category: 'daily',
    },
    {
      id: 'es_2',
      phrase: 'Quisiera pedir un café con leche y una tostada, por favor.',
      translationFa: 'یک قهوه با شیر و یک نان تست می‌خواهم، لطفاً.',
      phonetic: '/kiˈsjeɾa peˈðiɾ un kaˈfe kon ˈletʃe i ˈuna tosˈtaða poɾ faˈβoɾ/',
      level: 'A2',
      category: 'food',
    },
  ],
  tr: [
    {
      id: 'tr_1',
      phrase: 'Merhaba, nasılsınız? Bugün hava çok güzel.',
      translationFa: 'سلام، چطورید؟ امروز هوا بسیار زیباست.',
      phonetic: '/mæɾhɑˈbɑ nɑsɯɫsɯˈnɯz byˈɟyn hɑˈvɑ tʃok ɟyˈzæl/',
      level: 'A1',
      category: 'daily',
    },
    {
      id: 'tr_2',
      phrase: 'Lütfen bana en yakın metro istasyonunu gösterir misiniz?',
      translationFa: 'لطفاً نزدیک‌ترین ایستگاه مترو را به من نشان می‌دهید؟',
      phonetic: '/lytˈfæn bɑˈnɑ æn jɑˈkɯn ˈmætɾo istɑsjonuˈnu ɟœstæˈɾiɾ miˈsi.niz/',
      level: 'A2',
      category: 'travel',
    },
  ],
  ar: [
    {
      id: 'ar_1',
      phrase: 'مَرْحَبًا، كَيْفَ حَالُكَ اليَوْمَ؟ أَتَمَنَّى لَكَ يَوْمًا سَعِيدًا.',
      translationFa: 'سلام، امروز چطوری؟ روز خوشی را برایت آرزومندم.',
      phonetic: '/marħaban kajfa ħaːluka al-jawm/',
      level: 'A1',
      category: 'daily',
    },
  ],
  it: [
    {
      id: 'it_1',
      phrase: 'Buongiorno! Come sta oggi? Piacere di conoscerla.',
      translationFa: 'روز بخیر! امروز حالتان چطور است؟ از آشنایی با شما خوشوقتم.',
      phonetic: '/bwondʒorno ˈkome sta ˈoddʒi pjaˈtʃere di koˈnoʃʃerla/',
      level: 'A1',
      category: 'daily',
    },
  ],
  ru: [
    {
      id: 'ru_1',
      phrase: 'Здравствуйте! Как ваши дела сегодня?',
      translationFa: 'سلام! امروز کارهایتان چطور پیش می‌رود؟',
      phonetic: '/ˈzdrastvʊjtʲe kak ˈvaʂɨ dʲɪˈla sʲɪˈvodnʲə/',
      level: 'A1',
      category: 'daily',
    },
  ],
  ja: [
    {
      id: 'ja_1',
      phrase: 'こんにちは、お元気ですか？',
      translationFa: 'سلام، حال شما چطور است؟',
      phonetic: '/koɴ.ni.tɕi.wa o.ɡeɴ.ki de.sɯ ka/',
      level: 'A1',
      category: 'daily',
    },
  ],
  zh: [
    {
      id: 'zh_1',
      phrase: '你好！今天过得怎么样？',
      translationFa: 'سلام! امروز چطور می‌گذرد؟',
      phonetic: '/nǐ hǎo! jīntiān guò de zěnmeyàng?/',
      level: 'A1',
      category: 'daily',
    },
  ],
};

const CATEGORIES = [
  { id: 'all', label: 'همه دسته‌ها' },
  { id: 'daily', label: 'روزمره و گفتگو' },
  { id: 'travel', label: 'سفر و آدرس' },
  { id: 'food', label: 'کافه و رستوران' },
  { id: 'business', label: 'کار و مصاحبه' },
  { id: 'phonetics', label: 'آواشناسی و چالش' },
];

export const PronunciationPracticeStudio: React.FC = () => {
  const { user, updateUserStats } = useApp();
  const currentLang = SUPPORTED_LANGUAGES[user.targetLanguage] || SUPPORTED_LANGUAGES.en;

  const phraseList = DEFAULT_PHRASES[user.targetLanguage] || DEFAULT_PHRASES.en;

  const [activePhrase, setActivePhrase] = useState<string>(
    phraseList[0]?.phrase || 'Good morning, how are you doing today?'
  );
  const [activeTranslation, setActiveTranslation] = useState<string>(
    phraseList[0]?.translationFa || 'صبح بخیر، امروز چطور هستید؟'
  );
  const [activePhonetic, setActivePhonetic] = useState<string>(
    phraseList[0]?.phonetic || ''
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customPhraseInput, setCustomPhraseInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Recording & Voice Recognition States
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBase64, setRecordedAudioBase64] = useState<string | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string>('audio/webm');
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PronunciationResult | null>(null);
  const [selectedWordTip, setSelectedWordTip] = useState<WordAnalysis | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<1 | 0.75>(1);

  // Audio & Visualizer Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Filtered presets
  const filteredPhrases = phraseList.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  // Select a preset phrase
  const handleSelectPreset = (preset: PracticePhrasePreset) => {
    audioService.playClickSound();
    setActivePhrase(preset.phrase);
    setActiveTranslation(preset.translationFa);
    setActivePhonetic(preset.phonetic);
    setAnalysisResult(null);
    setSpeechTranscript('');
    setRecordedAudioUrl(null);
    setRecordedAudioBase64(null);
    setSelectedWordTip(null);
  };

  // Submit custom phrase
  const handleApplyCustomPhrase = () => {
    if (!customPhraseInput.trim()) return;
    audioService.playClickSound();
    setActivePhrase(customPhraseInput.trim());
    setActiveTranslation('جمله دلخواه زبان‌آموز برای تقویت مکالمه');
    setActivePhonetic('');
    setAnalysisResult(null);
    setSpeechTranscript('');
    setRecordedAudioUrl(null);
    setRecordedAudioBase64(null);
    setSelectedWordTip(null);
    setShowCustomInput(false);
  };

  // Play Native TTS Speaker
  const handlePlayNativeSpeaker = (slow: boolean = false) => {
    setAudioSpeed(slow ? 0.75 : 1);
    audioService.speak(activePhrase, user.targetLanguage, slow ? 0.75 : 1.0);
  };

  // Real-time canvas visualizer
  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 64;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#4f46e5');
          gradient.addColorStop(0.5, '#10b981');
          gradient.addColorStop(1, '#f59e0b');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          x += barWidth + 2;
        }
      };

      draw();
    } catch (err) {
      console.warn('Visualizer initialization error:', err);
    }
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Start Voice Recording + Speech Recognition
  const handleStartRecording = async () => {
    try {
      audioService.playClickSound();
      setAnalysisResult(null);
      setSpeechTranscript('');
      setRecordedAudioUrl(null);
      setRecordedAudioBase64(null);
      setSelectedWordTip(null);
      audioChunksRef.current = [];

      // 1. Media Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startVisualizer(stream);

      // 2. MediaRecorder
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      setRecordedMimeType(mime);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        stopVisualizer();

        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setRecordedAudioBase64(base64data);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start(100);

      // 3. Web Speech Recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;

        const langCodes: Record<string, string> = {
          en: 'en-US',
          de: 'de-DE',
          fr: 'fr-FR',
          es: 'es-ES',
          tr: 'tr-TR',
          ar: 'ar-SA',
          it: 'it-IT',
          ru: 'ru-RU',
          fa: 'fa-IR',
        };

        recognition.lang = langCodes[user.targetLanguage] || 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + ' ';
          }
          setSpeechTranscript(transcript.trim());
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition event:', e.error);
        };

        recognition.start();
      }

      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone permission / start error:', err);
      alert('لطفاً دسترسی میکروفون را در مرورگر خود فعال کنید تا صدای شما با دقت ضبط و تحلیل شود.');
    }
  };

  // Stop Voice Recording
  const handleStopRecording = () => {
    audioService.playClickSound();
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  // Analyze Pronunciation via AI
  const handleAnalyzePronunciation = async () => {
    if (!activePhrase) return;
    setIsAnalyzing(true);
    audioService.playClickSound();

    try {
      const response = await fetch('/api/ai-tutor/pronunciation-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phrase: activePhrase,
          spokenText: speechTranscript || '',
          audioBase64: recordedAudioBase64,
          mimeType: recordedMimeType,
          targetLanguage: user.targetLanguage,
          explanationLanguage: user.explanationLanguage || 'fa',
          userLevel: user.cefrLevel || 'A1',
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned error for pronunciation');
      }

      const data: PronunciationResult = await response.json();
      setAnalysisResult(data);

      if (data.wordsAnalysis && data.wordsAnalysis.length > 0) {
        // Select first word that needs work or first word
        const tricky = data.wordsAnalysis.find((w) => w.status !== 'perfect') || data.wordsAnalysis[0];
        setSelectedWordTip(tricky);
      }

      // Gamification: Update user stats
      if (data.overallScore >= 75) {
        audioService.playCorrectSound();
        updateUserStats({
          xpEarned: data.xpEarned || 25,
          correctIncrement: 1,
          timeSpentSeconds: 30,
        });
      } else {
        audioService.playClickSound();
        updateUserStats({
          xpEarned: Math.max(10, data.xpEarned || 10),
          timeSpentSeconds: 20,
        });
      }
    } catch (err: any) {
      console.error('Pronunciation evaluation failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle Playback of Recorded Audio
  const handleToggleRecordedPlayback = () => {
    if (!recordedAudioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(recordedAudioUrl);
      audioElementRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.currentTime = 0;
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVisualizer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  return (
    <div className="space-y-6 select-none">
      {/* Studio Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                استودیوی تشخیص و تحلیل گفتار صوتی هوش مصنوعی
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-latin">
                {currentLang.flag} {currentLang.nameFa}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              تمرین پیشرفته تلفظ و آواشناسی زنده
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl leading-relaxed">
              با ضبط صدای خود، جمله زیر را تلفظ کنید. هوش مصنوعی بلافاصله اکسنت صوتی، تلفظ تک‌تک واژه‌ها، لحن کلام و جایگاه زبان و لب‌ها را تحلیل کرده و بازخورد اختصاصی فارسی می‌دهد.
            </p>
          </div>

          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-2 self-start md:self-auto transition-all active:scale-95 shadow-sm"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{showCustomInput ? 'بستن ورودی دلخواه' : 'وارد کردن جمله دلخواه شما'}</span>
          </button>
        </div>

        {/* Custom Phrase Collapsible Drawer */}
        <AnimatePresence>
          {showCustomInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-indigo-500/30 relative z-10"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customPhraseInput}
                  onChange={(e) => setCustomPhraseInput(e.target.value)}
                  placeholder={`یک جمله دلخواه به زبان ${currentLang.nameFa} بنویسید یا کپی کنید...`}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-black/40 border border-indigo-400/30 text-white placeholder-indigo-300/50 text-sm focus:outline-none focus:border-indigo-400"
                />
                <button
                  onClick={handleApplyCustomPhrase}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>تأیید و تمرین این جمله</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories & Preset Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-extrabold text-gray-900 dark:text-slate-200">
              انتخاب جملات استاندارد و کاربردی برای تمرین:
            </span>
          </div>
          <span className="text-[11px] text-gray-400">سطح فعال: {user.cefrLevel || 'A1'}</span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Preset Cards Slider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPhrases.map((preset) => {
            const isSelected = preset.phrase === activePhrase;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3.5 rounded-2xl text-right transition-all border flex flex-col justify-between gap-2 relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[10px] font-bold font-latin px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    {preset.level}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>انتخاب</span>
                    <ChevronRight className="w-3 h-3 rotate-180" />
                  </div>
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 font-latin leading-snug">
                    {preset.phrase}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {preset.translationFa}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Target Sentence Practice Arena */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Top Arena Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <span>جمله هدف برای ضبط صدا و تلفظ:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePlayNativeSpeaker(false)}
              title="شنیدن صدای بومی با سرعت عادی"
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>صدای نیتیو (1.0x)</span>
            </button>
            <button
              onClick={() => handlePlayNativeSpeaker(true)}
              title="شنیدن صدای بومی با سرعت آهسته"
              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 border border-gray-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-500" />
              <span>آهسته (0.75x)</span>
            </button>
          </div>
        </div>

        {/* Giant Phrase Display */}
        <div className="text-center space-y-2 py-2">
          <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-slate-100 font-latin tracking-tight leading-relaxed">
            {activePhrase}
          </h3>
          {activePhonetic && (
            <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-latin font-semibold">
              {activePhonetic}
            </p>
          )}
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 font-medium">
              {activeTranslation}
            </p>
            {activeTranslation && (
              <button
                onClick={() => audioService.speakPersian(activeTranslation)}
                title="پخش صوت ترجمه فارسی"
                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-all active:scale-95 flex items-center gap-1 text-[11px] font-bold"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>فارسی</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Audio Visualizer Canvas */}
        <div className="h-16 w-full rounded-2xl bg-gray-50 dark:bg-slate-950/80 border border-gray-200 dark:border-slate-800 flex items-center justify-center overflow-hidden relative">
          <canvas ref={canvasRef} width={600} height={64} className="w-full h-full" />
          {!isRecording && !recordedAudioUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-slate-600 text-xs font-medium gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>نمودار فرکانس صوتی با شروع ضبط فعال می‌شود</span>
            </div>
          )}
          {isRecording && (
            <div className="absolute top-2 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 text-[10px] font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>در حال ضبط صدا...</span>
            </div>
          )}
        </div>

        {/* Speech Transcript Preview */}
        {speechTranscript && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold">
              <Mic className="w-3.5 h-3.5" />
              <span>متن دریافت شده از صدای شما (Speech-to-Text):</span>
            </div>
            <p className="font-latin text-gray-800 dark:text-slate-200 font-semibold text-sm">
              "{speechTranscript}"
            </p>
          </div>
        )}

        {/* Recording & Control Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <Mic className="w-5 h-5 animate-pulse" />
              <span>شروع ضبط و گفتن جمله</span>
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="px-6 sm:px-8 py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-lg active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              <MicOff className="w-5 h-5 text-rose-500" />
              <span>پایان ضبط</span>
            </button>
          )}

          {recordedAudioUrl && !isRecording && (
            <>
              <button
                onClick={handleToggleRecordedPlayback}
                className="px-4 py-3.5 rounded-2xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-2xs"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-4 h-4 text-indigo-600" />
                    <span>توقف پخش صدای من</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-emerald-600" />
                    <span>شنیدن صدای ضبط‌شده خودم</span>
                  </>
                )}
              </button>

              <button
                onClick={handleAnalyzePronunciation}
                disabled={isAnalyzing}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                    <span>در حال تحلیل هوش مصنوعی...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>تحلیل تلفظ با هوش مصنوعی</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pronunciation AI Detailed Results & Word-by-Word Breakdown */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-5"
          >
            {/* Scorecard Hero */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md ${
                      analysisResult.overallScore >= 85
                        ? 'bg-emerald-600 shadow-emerald-600/30'
                        : analysisResult.overallScore >= 70
                        ? 'bg-amber-500 shadow-amber-500/30'
                        : 'bg-rose-500 shadow-rose-500/30'
                    }`}
                  >
                    {analysisResult.overallScore}%
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                      <span>
                        {analysisResult.overallScore >= 85
                          ? 'تلفظ فوق‌العاده و بسیار روان!'
                          : analysisResult.overallScore >= 70
                          ? 'تلفظ خوب، با قابلیت ارتقای جزئی'
                          : 'نیاز به تمرین بیشتر و ادای دقیق‌تر واژگان'}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      پاداش تمرین: +{analysisResult.xpEarned} امتیاز XP دریافت کردید
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs font-bold flex items-center gap-1.5 font-latin">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span>+{analysisResult.xpEarned} XP</span>
                  </div>
                </div>
              </div>

              {/* Sub-Metrics Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-600 dark:text-slate-400">دقت آوایی (Accuracy)</span>
                    <span className="text-emerald-600 font-latin">{analysisResult.accuracyScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${analysisResult.accuracyScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-600 dark:text-slate-400">روانی کلام (Fluency)</span>
                    <span className="text-blue-600 font-latin">{analysisResult.fluencyScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${analysisResult.fluencyScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-600 dark:text-slate-400">کامل بودن (Completeness)</span>
                    <span className="text-indigo-600 font-latin">{analysisResult.completenessScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${analysisResult.completenessScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Word-by-Word Colored Chips */}
              {analysisResult.wordsAnalysis && analysisResult.wordsAnalysis.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      تحلیل کلمه به کلمه (روی هر کلمه بزنید تا نکته دهان و زبان آن باز شود):
                    </span>
                    <div className="flex items-center gap-3 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> عالی (۹۰٪+)
                      </span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> خوب (۷۰٪+)
                      </span>
                      <span className="flex items-center gap-1 text-rose-600">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span> نیاز به تمرین
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 py-2">
                    {analysisResult.wordsAnalysis.map((w, idx) => {
                      const isWordSelected = selectedWordTip?.word === w.word;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            audioService.playClickSound();
                            setSelectedWordTip(w);
                            audioService.speak(w.word, user.targetLanguage, 0.85);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-latin font-bold text-sm transition-all flex items-center gap-1.5 border active:scale-95 ${
                            w.status === 'perfect'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                              : w.status === 'good'
                              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 hover:bg-rose-100'
                          } ${isWordSelected ? 'ring-2 ring-indigo-500 scale-105' : ''}`}
                        >
                          <span>{w.word}</span>
                          <span className="text-[10px] opacity-75 font-normal">{w.score}%</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Word Detail Popover Box */}
                  {selectedWordTip && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold font-latin text-indigo-900 dark:text-indigo-200">
                            {selectedWordTip.word}
                          </span>
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-latin font-mono">
                            {selectedWordTip.phonetic}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              selectedWordTip.score >= 88
                                ? 'bg-emerald-100 text-emerald-800'
                                : selectedWordTip.score >= 70
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            نمره: {selectedWordTip.score}%
                          </span>
                        </div>

                        <button
                          onClick={() => audioService.speak(selectedWordTip.word, user.targetLanguage, 0.75)}
                          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 shadow-2xs hover:bg-indigo-50"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>پخش مجدد این واژه</span>
                        </button>
                      </div>

                      <p className="text-xs text-gray-700 dark:text-slate-200 leading-relaxed font-medium">
                        💡 {selectedWordTip.feedbackFa}
                      </p>
                      {selectedWordTip.tip && (
                        <p className="text-xs text-indigo-800 dark:text-indigo-300 font-semibold bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
                          👅 فرم دهان و زبان: {selectedWordTip.tip}
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* In-depth Pedagogical Feedback & Intonation Coaching */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 font-extrabold text-xs">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>تحلیل جامع معلم هوشمند:</span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-slate-200 leading-relaxed">
                    {analysisResult.detailedFeedbackFa}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span>ریتم، استرس و لحن کلام (Intonation):</span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-slate-200 leading-relaxed">
                    {analysisResult.intonationAndRhythmTip}
                  </p>
                </div>
              </div>

              {/* Follow-up Next Challenge Action */}
              {analysisResult.followUpPracticePhrase && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-950/50 dark:to-emerald-950/50 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 block">
                      🎯 چالش بعدی پیشنهادی برای پیشرفت:
                    </span>
                    <span className="text-xs font-bold font-latin text-gray-900 dark:text-slate-100">
                      "{analysisResult.followUpPracticePhrase}"
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      audioService.playClickSound();
                      setActivePhrase(analysisResult.followUpPracticePhrase!);
                      setActiveTranslation('چالش مرحله بعد');
                      setActivePhonetic('');
                      setAnalysisResult(null);
                      setSpeechTranscript('');
                      setRecordedAudioUrl(null);
                      setRecordedAudioBase64(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-sm"
                  >
                    <span>تمرین این جمله جدید</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
