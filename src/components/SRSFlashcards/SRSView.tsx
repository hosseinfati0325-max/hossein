import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Layers,
  Volume2,
  RotateCw,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  Dumbbell,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Plus,
  Shuffle,
  RefreshCw,
  Trash2,
  Filter,
  Lightbulb,
  X,
  Loader2,
  Check,
  AlertCircle,
  Award,
  ChevronRight,
  ShieldCheck,
  Play,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SRSCard, WeaknessRecord, TargetLanguageCode } from '../../types';
import { audioService } from '../../services/audioService';
import { SUPPORTED_LANGUAGES, INITIAL_SRS_CARDS } from '../../data/curriculumData';
import { WORLD_SRS_CARDS } from '../../data/worldLanguagesData';

interface SRSViewProps {
  onOpenAiRemedial: (topic: string) => void;
}

type CardFilter = 'all' | 'new' | 'learning' | 'mastered';

interface WorkoutQuestion {
  id: string;
  promptFa: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanationFa: string;
}

export const SRSView: React.FC<SRSViewProps> = ({ onOpenAiRemedial }) => {
  const {
    user,
    rateSRSCard,
    addSRSCard,
    addSRSCards,
    resetSRSDeck,
    deleteSRSCard,
    improveWeaknessMastery,
    deleteWeakness,
    addCustomWeakness,
    resetWeaknesses,
    addXP,
    addGems,
    triggerCelebration,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'srs' | 'weakness'>('srs');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filter, setFilter] = useState<CardFilter>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingPersian, setIsPlayingPersian] = useState(false);

  // Modals for SRS
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiGenModalOpen, setIsAiGenModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('Essential Daily Vocabulary');
  const [aiLevel, setAiLevel] = useState(user.currentLevel || 'A1');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGenError, setAiGenError] = useState<string | null>(null);

  // Custom Card Form State
  const [newFront, setNewFront] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newPartOfSpeech, setNewPartOfSpeech] = useState('noun');
  const [newBackFa, setNewBackFa] = useState('');
  const [newExampleTarget, setNewExampleTarget] = useState('');
  const [newExampleFa, setNewExampleFa] = useState('');
  const [newCategory, setNewCategory] = useState('واژگان کاربردی');

  // Weakness Gym State & Modals
  const [isAddWeaknessModalOpen, setIsAddWeaknessModalOpen] = useState(false);
  const [newWeaknessFa, setNewWeaknessFa] = useState('');
  const [newWeaknessNative, setNewWeaknessNative] = useState('');
  const [newWeaknessCategory, setNewWeaknessCategory] = useState('Grammar');
  const [newWeaknessRec, setNewWeaknessRec] = useState('');

  // Active Workout Modal State
  const [activeWorkoutWeakness, setActiveWorkoutWeakness] = useState<WeaknessRecord | null>(null);
  const [workoutQuestions, setWorkoutQuestions] = useState<WorkoutQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);

  const currentLangInfo = SUPPORTED_LANGUAGES[user.targetLanguage] || SUPPORTED_LANGUAGES.en;

  // Safe weaknesses for current language
  const allWeaknesses = useMemo(() => {
    return Array.isArray(user.weaknesses) ? user.weaknesses : [];
  }, [user.weaknesses]);

  const langWeaknesses = useMemo(() => {
    return allWeaknesses.filter(
      (w) => !w.language || w.language === user.targetLanguage
    );
  }, [allWeaknesses, user.targetLanguage]);

  // Reset card index when language changes
  useEffect(() => {
    setCardIndex(0);
    setIsFlipped(false);
  }, [user.targetLanguage, filter]);

  // Filter cards for the active language
  const allLangCards = useMemo(() => {
    const cards = Array.isArray(user.srsCards) ? user.srsCards : [];
    return cards.filter((c) => c.language === user.targetLanguage);
  }, [user.srsCards, user.targetLanguage]);

  const filteredCards = useMemo(() => {
    if (filter === 'all') return allLangCards;
    if (filter === 'new') return allLangCards.filter((c) => c.state === 'new');
    if (filter === 'learning') return allLangCards.filter((c) => c.state === 'learning' || c.state === 'review');
    if (filter === 'mastered') return allLangCards.filter((c) => c.state === 'mastered');
    return allLangCards;
  }, [allLangCards, filter]);

  const safeIndex = filteredCards.length > 0 ? Math.min(cardIndex, filteredCards.length - 1) : 0;
  const currentCard: SRSCard | undefined = filteredCards[safeIndex];

  const masteredCount = allLangCards.filter((c) => c.state === 'mastered').length;
  const learningCount = allLangCards.filter((c) => c.state === 'learning' || c.state === 'review').length;
  const newCount = allLangCards.filter((c) => c.state === 'new').length;

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    audioService.playClickSound();
    if (!isFlipped && currentCard) {
      setIsPlayingAudio(true);
      audioService.speak(currentCard.frontText, user.targetLanguage, user.settings.ttsSpeed, () => {
        setIsPlayingAudio(false);
      });
    }
  }, [isFlipped, currentCard, user.targetLanguage, user.settings.ttsSpeed]);

  const handleRate = useCallback((rating: 1 | 2 | 3 | 4) => {
    if (!currentCard) return;
    rateSRSCard(currentCard.id, rating);
    audioService.playClickSound();
    setIsFlipped(false);
    if (safeIndex + 1 < filteredCards.length) {
      setCardIndex(safeIndex + 1);
    } else {
      setCardIndex(0);
    }
  }, [currentCard, rateSRSCard, safeIndex, filteredCards.length]);

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    audioService.playClickSound();
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    audioService.playClickSound();
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handlePlayVoice = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentCard) return;
    setIsPlayingAudio(true);
    audioService.speak(currentCard.frontText, user.targetLanguage, user.settings.ttsSpeed, () => {
      setIsPlayingAudio(false);
    });
  };

  const handlePlayPersianVoice = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentCard) return;
    setIsPlayingPersian(true);
    audioService.speakPersian(currentCard.backTextFa, 0.95, () => {
      setIsPlayingPersian(false);
    });
  };

  const handleAddCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBackFa.trim()) return;

    const newCard: SRSCard = {
      id: `srs_custom_${Date.now()}`,
      frontText: newFront.trim(),
      backTextFa: newBackFa.trim(),
      phonetic: newPhonetic.trim() || undefined,
      partOfSpeech: newPartOfSpeech,
      exampleTarget: newExampleTarget.trim() || undefined,
      exampleFa: newExampleFa.trim() || undefined,
      category: newCategory.trim() || 'واژگان کاربردی',
      language: user.targetLanguage,
      state: 'new',
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(),
    };

    addSRSCard(newCard);
    audioService.playSuccessSound();
    setIsAddModalOpen(false);
    setNewFront('');
    setNewPhonetic('');
    setNewBackFa('');
    setNewExampleTarget('');
    setNewExampleFa('');
  };

  const handleLoadStarterCards = () => {
    audioService.playClickSound();
    const rawStarters = WORLD_SRS_CARDS[user.targetLanguage] || INITIAL_SRS_CARDS.filter((c) => c.language === user.targetLanguage);
    const starters: SRSCard[] = Array.isArray(rawStarters) ? rawStarters : [rawStarters];
    if (starters.length > 0) {
      addSRSCards(starters);
    }
  };

  // Weakness Gym Workout Generator
  const handleStartWorkout = (weakness: WeaknessRecord) => {
    audioService.playClickSound();
    setActiveWorkoutWeakness(weakness);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setIsWorkoutCompleted(false);

    // Generate 3 targeted questions based on the weakness topic
    const topic = weakness.topicNative || weakness.topicFa;
    const questions: WorkoutQuestion[] = [
      {
        id: 'q1',
        promptFa: `تمرین اول: انتخاب ساختار صحیح برای مبحث «${weakness.topicFa}»`,
        questionText: `Which of the following is the correct application for: "${topic}"?`,
        options: [
          `Option A: Standard usage pattern according to rules of ${topic}`,
          `Option B: Incorrect usage with invalid tense or agreement`,
          `Option C: Literal translation missing key preposition`,
          `Option D: Informal conversational shortcut`,
        ],
        correctIndex: 0,
        explanationFa: `پاسخ صحیح گزینه ۱ است زیرا ساختار استاندارد ${weakness.topicFa} را رعایت می‌کند.`,
      },
      {
        id: 'q2',
        promptFa: `تمرین دوم: جای خالی را در این جمله پر کنید:`,
        questionText: `Select the most natural phrasing to fix this challenge in everyday dialogue:`,
        options: [
          `Form 1 (Recommended idiomatic structure)`,
          `Form 2 (Common learner confusion)`,
          `Form 3 (Outdated phrasing)`,
          `Form 4 (Grammatically mismatched)`,
        ],
        correctIndex: 0,
        explanationFa: `نکته کلیدی: در ${weakness.topicFa} همیشه باید به هماهنگی اجزای جمله توجه کرد.`,
      },
      {
        id: 'q3',
        promptFa: `تمرین سوم: تثبیت نهایی و کاربرد کاربردی:`,
        questionText: `How should you express this concept naturally in ${currentLangInfo.nameFa}?`,
        options: [
          `Exact master expression (تثبیت‌شده)`,
          `Partially correct expression`,
          `Literal word-for-word translation`,
          `Opposite meaning expression`,
        ],
        correctIndex: 0,
        explanationFa: `آفرین! با درک این ساختار تسلط شما بر این مبحث افزایش یافت.`,
      },
    ];

    setWorkoutQuestions(questions);
  };

  const handleWorkoutSubmit = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const q = workoutQuestions[currentQIndex];
    const isCorrect = selectedOption === q.correctIndex;

    if (isCorrect) {
      audioService.playSuccessSound();
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      audioService.playClickSound();
    }
  };

  const handleWorkoutNextQuestion = () => {
    if (currentQIndex + 1 < workoutQuestions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Completed workout
      setIsWorkoutCompleted(true);
      audioService.playSuccessSound();
      triggerCelebration('srs');
      addXP(30);
      addGems(5);
      if (activeWorkoutWeakness) {
        improveWeaknessMastery(activeWorkoutWeakness.id, 25);
      }
    }
  };

  // Add Custom Weakness
  const handleAddCustomWeakness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeaknessFa.trim() || !newWeaknessNative.trim()) return;

    const record: WeaknessRecord = {
      id: `weak_${user.targetLanguage}_${Date.now()}`,
      topicFa: newWeaknessFa.trim(),
      topicNative: newWeaknessNative.trim(),
      language: user.targetLanguage,
      category: newWeaknessCategory,
      mistakeCount: 1,
      masteryPercent: 40,
      lastMistakeDate: new Date().toISOString(),
      recommendationFa: newWeaknessRec.trim() || `تمرین روزانه و تمرکز بر مبحث ${newWeaknessFa.trim()}`,
    };

    addCustomWeakness(record);
    audioService.playSuccessSound();
    setIsAddWeaknessModalOpen(false);
    setNewWeaknessFa('');
    setNewWeaknessNative('');
    setNewWeaknessRec('');
  };

  // Load starter weaknesses for language
  const handleLoadStarterWeaknesses = () => {
    audioService.playClickSound();
    const starterTopics: Record<TargetLanguageCode, WeaknessRecord[]> = {
      en: [
        {
          id: `weak_en_1_${Date.now()}`,
          topicFa: 'افعال زمان گذشته بی‌قاعده',
          topicNative: 'Irregular Past Tense Verbs (went, saw, caught)',
          language: 'en',
          category: 'Grammar',
          mistakeCount: 2,
          masteryPercent: 60,
          lastMistakeDate: new Date().toISOString(),
          recommendationFa: 'مرور لیست ۱۰ فعل پرکاربرد بی‌قاعده و ساخت جمله با آنها',
        },
        {
          id: `weak_en_2_${Date.now()}`,
          topicFa: 'حروف اضافه زمان و مکان (in, on, at)',
          topicNative: 'Prepositions of Time & Place',
          language: 'en',
          category: 'Prepositions',
          mistakeCount: 1,
          masteryPercent: 50,
          lastMistakeDate: new Date().toISOString(),
          recommendationFa: 'یادگیری هرم حروف اضافه: At برای دقیق‌ترین، In برای کلی‌ترین',
        },
      ],
      de: [
        {
          id: `weak_de_1_${Date.now()}`,
          topicFa: 'حروف تعریف معین (der, die, das) و حالت Akkusativ',
          topicNative: 'Bestimmte Artikel & Akkusativ',
          language: 'de',
          category: 'Grammar',
          mistakeCount: 2,
          masteryPercent: 55,
          lastMistakeDate: new Date().toISOString(),
          recommendationFa: 'توجه به تغییر der به den در مفعول مستقیم مذکر',
        },
      ],
      fr: [
        {
          id: `weak_fr_1_${Date.now()}`,
          topicFa: 'زمان گذشته ساده با افعال کمکی être و avoir',
          topicNative: 'Passé Composé avec être et avoir',
          language: 'fr',
          category: 'Verbs',
          mistakeCount: 1,
          masteryPercent: 65,
          lastMistakeDate: new Date().toISOString(),
          recommendationFa: 'افعال حرکتی و بازتابی با être صرف می‌شوند',
        },
      ],
      es: [
        {
          id: `weak_es_1_${Date.now()}`,
          topicFa: 'تفاوت افعال بودن Ser و Estar',
          topicNative: 'Diferencia entre Ser y Estar',
          language: 'es',
          category: 'Grammar',
          mistakeCount: 2,
          masteryPercent: 50,
          lastMistakeDate: new Date().toISOString(),
          recommendationFa: 'Ser برای ویژگی‌های دائمی و Estar برای حالات و مکان',
        },
      ],
      tr: [
        {
          id: `weak_tr_1_${Date.now()}`,
          topicFa: 'هماهنگی اصوات و پسوندهای مکانی -de / -den',
          topicNative: 'Ses Uyumu ve Bulunma Ekleri',
          language: 'tr',
          category: 'Grammar',
          mistakeCount: 1,
          masteryPercent: 60,
          lastMistakeDate: new Date().toISOString(),
          recommendationFa: 'قاعده مصوت‌های ضخیم (a, ı, o, u) و نازک (e, i, ö, ü)',
        },
      ],
      ar: [
        {
          id: `weak_ar_1_${Date.now()}`,
          topicFa: 'ضمایر متصل و اعراب فاعل و مفعول',
          topicNative: 'الضمائر المتصلة والإعراب',
          language: 'ar',
          category: 'Grammar',
          mistakeCount: 1,
          masteryPercent: 55,
          lastMistakeDate: new Date().toISOString(),
          recommendationFa: 'تمرین تشخیص ضمایر ه، ها، هم، نا و علائم ضمه و فتحه',
        },
      ],
      it: [
        {
          id: `weak_it_1_${Date.now()}`,
          topicFa: 'تطابق جنسیت و شمار اسامی و صفات',
          topicNative: 'Concordanza Genere e Numero',
          language: 'it',
          category: 'Grammar',
          mistakeCount: 1,
          masteryPercent: 60,
          lastMistakeDate: new Date().toISOString(),
          recommendationFa: 'تغییر o/i برای مذکر و a/e برای مونث',
        },
      ],
      ru: [
        {
          id: `weak_ru_1_${Date.now()}`,
          topicFa: 'حالت مفعولی مستقیم و پسوندهای اسامی',
          topicNative: 'Винительный падеж (Accusative)',
          language: 'ru',
          category: 'Grammar',
          mistakeCount: 2,
          masteryPercent: 45,
          lastMistakeDate: new Date().toISOString(),
          recommendationFa: 'تغییر اسامی مونث انتهایی а به у در حالت مفعولی',
        },
      ],
      zh: [
        {
          id: `weak_zh_1_${Date.now()}`,
          topicFa: 'چهار لحن صوتی و کلمات شمارشگر (量词)',
          topicNative: 'Tones & Measure Words (个, 只, 本)',
          language: 'zh',
          category: 'Pronunciation',
          mistakeCount: 2,
          masteryPercent: 50,
          lastMistakeDate: new Date().toISOString(),
          recommendationFa: 'تمرین مداوم با فایل‌های صوتی برای تثبیت چهار لحن Pinyin',
        },
      ],
      ja: [
        {
          id: `weak_ja_1_${Date.now()}`,
          topicFa: 'حروف نشانه دستوری は (wa) و が (ga)',
          topicNative: 'Particles wa and ga (は と が)',
          language: 'ja',
          category: 'Grammar',
          mistakeCount: 2,
          masteryPercent: 55,
          lastMistakeDate: new Date().toISOString(),
          recommendationFa: 'استفاده از は برای مبتدا و موضوع کلی، و が برای فاعل خاص یا اطلاعات جدید',
        },
      ],
    };

    const starters = starterTopics[user.targetLanguage] || starterTopics.en;
    starters.forEach((item) => addCustomWeakness(item));
  };

  return (
    <div className="pb-28 sm:pb-32 px-2.5 sm:px-6 pt-2 sm:pt-4 max-w-4xl mx-auto space-y-4 sm:space-y-5">
      {/* Top Header & Selector Tabs */}
      <div className="grid grid-cols-2 p-1 bg-gray-200 dark:bg-slate-800 rounded-2xl text-xs">
        <button
          onClick={() => {
            audioService.playClickSound();
            setActiveTab('srs');
          }}
          className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'srs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>فلش‌کارت‌های هوشمند SRS ({allLangCards.length})</span>
        </button>

        <button
          onClick={() => {
            audioService.playClickSound();
            setActiveTab('weakness');
          }}
          className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'weakness'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>باشگاه نقاط ضعف ({langWeaknesses.length})</span>
        </button>
      </div>

      {activeTab === 'srs' ? (
        <div className="space-y-4">
          {/* Active Language Badge & Actions Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentLangInfo.flag}</span>
              <div>
                <h2 className="text-xs font-extrabold text-gray-900 dark:text-slate-100">
                  فلش‌کارت‌های {currentLangInfo.nameFa}
                </h2>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">
                  {allLangCards.length} کارت ثبت‌شده در الگوریتم تکرار فاصله‌دار
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  audioService.playClickSound();
                  setIsAddModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>کارت دستی</span>
              </button>

              <button
                onClick={handleLoadStarterCards}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                title="بارگذاری کارت‌های پیش‌فرض"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>کارت‌های پایه</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
              <div className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{masteredCount}</div>
              <div className="text-[10px] text-gray-500 dark:text-slate-400">تثبیت‌شده (Mastered)</div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
              <div className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">{learningCount}</div>
              <div className="text-[10px] text-gray-500 dark:text-slate-400">در حال یادگیری</div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
              <div className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{newCount}</div>
              <div className="text-[10px] text-gray-500 dark:text-slate-400">کارت جدید</div>
            </div>
          </div>

          {/* Flashcard Presentation View */}
          {filteredCards.length > 0 && currentCard ? (
            <div className="space-y-4">
              <div className="relative min-h-[320px] sm:min-h-[360px] perspective-1000">
                <motion.div
                  onClick={handleFlip}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="w-full h-full min-h-[320px] sm:min-h-[360px] p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-950 shadow-lg cursor-pointer flex flex-col justify-between select-none relative"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front Side */}
                  <div
                    className={`absolute inset-0 p-6 flex flex-col justify-between rounded-3xl backface-hidden ${
                      isFlipped ? 'pointer-events-none' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold">
                        {currentCard.category || 'واژگان'}
                      </span>
                      <span className="text-gray-400 text-[11px] font-latin">
                        {safeIndex + 1} / {filteredCards.length}
                      </span>
                    </div>

                    <div className="text-center my-auto space-y-3">
                      <h3 className="text-3xl sm:text-4xl font-extrabold font-latin text-gray-900 dark:text-slate-100">
                        {currentCard.frontText}
                      </h3>
                      {currentCard.phonetic && (
                        <p className="text-sm font-latin text-gray-500 dark:text-slate-400">
                          {currentCard.phonetic}
                        </p>
                      )}
                      <button
                        onClick={handlePlayVoice}
                        className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 mx-auto transition-transform active:scale-90 cursor-pointer"
                        title="تلفظ صوتی"
                      >
                        <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                      </button>
                    </div>

                    <div className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
                      <RotateCw className="w-3 h-3" />
                      <span>برای مشاهده معنی ضربه بزنید</span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div
                    className={`absolute inset-0 p-6 flex flex-col justify-between rounded-3xl backface-hidden ${
                      !isFlipped ? 'pointer-events-none' : ''
                    }`}
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold">
                        ترجمه و کاربرد
                      </span>
                      <button
                        onClick={handlePlayPersianVoice}
                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>تلفظ فارسی</span>
                      </button>
                    </div>

                    <div className="text-center my-auto space-y-3">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                        {currentCard.backTextFa}
                      </h3>
                      {currentCard.exampleTarget && (
                        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-xs space-y-1">
                          <p className="font-latin text-gray-800 dark:text-slate-200 font-medium">
                            {currentCard.exampleTarget}
                          </p>
                          {currentCard.exampleFa && (
                            <p className="text-gray-500 dark:text-slate-400">
                              {currentCard.exampleFa}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
                      <span>یکی از دکمه‌های ارزیابی زیر را انتخاب کنید</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* SRS Rating Control Buttons */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <button
                  onClick={() => handleRate(1)}
                  className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/70 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <span className="text-sm">❌</span>
                  <span>دوباره (۱ دقیقه)</span>
                </button>

                <button
                  onClick={() => handleRate(2)}
                  className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <span className="text-sm">⚠️</span>
                  <span>سخت (۱۰ دقیقه)</span>
                </button>

                <button
                  onClick={() => handleRate(3)}
                  className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <span className="text-sm">👍</span>
                  <span>خوب (۱ روز)</span>
                </button>

                <button
                  onClick={() => handleRate(4)}
                  className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <span className="text-sm">⭐</span>
                  <span>آسان (۴ روز)</span>
                </button>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>قبلی</span>
                </button>

                <button
                  onClick={() => deleteSRSCard(currentCard.id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                  title="حذف کارت"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>بعدی</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 space-y-4">
              <Brain className="w-12 h-12 text-indigo-400 mx-auto" />
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                هیچ فلش‌کارتی برای زبان {currentLangInfo.nameFa} یافت نشد
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                می‌توانید فلش‌کارت‌های پایه این زبان را بارگذاری کنید یا کارت جدید به دست خود ایجاد نمایید.
              </p>
              <button
                onClick={handleLoadStarterCards}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>بارگذاری فلش‌کارت‌های استاندارد</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Weakness Gym Tab */
        <div className="space-y-4">
          {/* Header Card with Quick Stats & Actions */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">
                      باشگاه نقاط ضعف و تمرین‌های جبرانی ({currentLangInfo.nameFa})
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">
                      تشخیص هوشمند چالش‌ها در آزمون‌ها و تمرین‌های جبرانی فوری
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ms-auto">
                <button
                  onClick={() => {
                    audioService.playClickSound();
                    setIsAddWeaknessModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت چالش جدید</span>
                </button>

                <button
                  onClick={handleLoadStarterWeaknesses}
                  className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>چالش‌های پیشنهادی سطح {user.currentLevel || 'A1'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* List of Weaknesses */}
          {langWeaknesses.length > 0 ? (
            <div className="space-y-3">
              {langWeaknesses.map((w) => (
                <div
                  key={w.id}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">
                          {w.category || 'دسته‌بندی'}
                        </span>
                        {w.mistakeCount > 0 && (
                          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                            {w.mistakeCount} بار اشتباه
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 mt-1.5">{w.topicFa}</h4>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 font-latin">{w.topicNative}</p>
                    </div>

                    <div className="text-left shrink-0">
                      <span
                        className={`text-xs font-bold font-latin px-2.5 py-1 rounded-full border ${
                          w.masteryPercent >= 80
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : w.masteryPercent >= 50
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {w.masteryPercent}% تسلط
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        w.masteryPercent >= 80
                          ? 'bg-emerald-500'
                          : w.masteryPercent >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(8, w.masteryPercent)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-1">
                      {w.recommendationFa}
                    </span>

                    <div className="flex items-center gap-1.5 ms-auto">
                      <button
                        onClick={() => handleStartWorkout(w)}
                        className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shrink-0 transition-all active:scale-95 shadow-sm shadow-orange-100 dark:shadow-none cursor-pointer flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>تمرین سریع باشگاه</span>
                      </button>

                      <button
                        onClick={() => {
                          audioService.playClickSound();
                          onOpenAiRemedial(w.topicNative || w.topicFa);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                        title="آموزش و رفع اشکال در چت با هوش مصنوعی"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>معلم هوشمند AI</span>
                      </button>

                      <button
                        onClick={() => deleteWeakness(w.id)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="حذف مبحث"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 space-y-4">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                در حال حاضر هیچ نقطه ضعفی برای {currentLangInfo.nameFa} ثبت نشده است!
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                هنگامی که در آزمون‌ها یا تمرین‌ها اشتباهی داشته باشید، سیستم هوشمند آن را در این بخش قرار می‌دهد. همچنین می‌توانید چالش‌های متداول سطح {user.currentLevel || 'A1'} را فعال کنید.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={handleLoadStarterWeaknesses}
                  className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>بارگذاری چالش‌های پیشنهادی سطح {user.currentLevel || 'A1'}</span>
                </button>
                <button
                  onClick={() => setIsAddWeaknessModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت چالش دلخواه</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Interactive Weakness Workout */}
      <AnimatePresence>
        {activeWorkoutWeakness && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 w-full max-w-lg shadow-2xl space-y-4 text-right"
            >
              {!isWorkoutCompleted ? (
                <>
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">
                          تمرین تقویتی: {activeWorkoutWeakness.topicFa}
                        </h3>
                        <p className="text-[10px] text-gray-500 dark:text-slate-400">
                          سوال {currentQIndex + 1} از {workoutQuestions.length}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveWorkoutWeakness(null)}
                      className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {workoutQuestions[currentQIndex] && (
                    <div className="space-y-4">
                      <div className="p-3.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 text-xs">
                        <div className="font-bold text-orange-900 dark:text-orange-200 mb-1">
                          {workoutQuestions[currentQIndex].promptFa}
                        </div>
                        <div className="font-latin text-gray-800 dark:text-slate-200 font-semibold text-sm">
                          {workoutQuestions[currentQIndex].questionText}
                        </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {workoutQuestions[currentQIndex].options.map((opt, idx) => {
                          const isSelected = selectedOption === idx;
                          const isCorrect = idx === workoutQuestions[currentQIndex].correctIndex;
                          let btnStyle = 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200';
                          if (isAnswerSubmitted) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                            } else if (isSelected) {
                              btnStyle = 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-800 dark:text-rose-200';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-800 dark:text-indigo-200 font-bold';
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                if (!isAnswerSubmitted) {
                                  setSelectedOption(idx);
                                  audioService.playClickSound();
                                }
                              }}
                              className={`w-full p-3 rounded-2xl border text-right font-latin text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isAnswerSubmitted && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation if submitted */}
                      {isAnswerSubmitted && (
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-gray-700 dark:text-slate-300">
                          {workoutQuestions[currentQIndex].explanationFa}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2">
                        {!isAnswerSubmitted ? (
                          <button
                            onClick={handleWorkoutSubmit}
                            disabled={selectedOption === null}
                            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
                          >
                            ثبت پاسخ
                          </button>
                        ) : (
                          <button
                            onClick={handleWorkoutNextQuestion}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
                          >
                            {currentQIndex + 1 < workoutQuestions.length ? 'سوال بعدی' : 'مشاهده نتایج'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <Award className="w-8 h-8" />
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 dark:text-slate-100">
                    تمرین باشگاه با موفقیت تکمیل شد!
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                    شما {correctAnswersCount} از {workoutQuestions.length} سوال را به درستی پاسخ دادید و تسلط شما بر مبحث «{activeWorkoutWeakness?.topicFa}» به اندازه ۲۵٪ افزایش یافت.
                  </p>

                  <div className="flex items-center justify-center gap-3 text-xs font-bold">
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      +30 XP تجربه
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      +5 الماس 💎
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveWorkoutWeakness(null)}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    بازگشت به باشگاه نقاط ضعف
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Custom Weakness */}
      <AnimatePresence>
        {isAddWeaknessModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-4 text-right"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-orange-600" />
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">
                    ثبت نقطه ضعف / چالش یادگیری جدید
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddWeaknessModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomWeakness} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                    عنوان مبحث به فارسی:
                  </label>
                  <input
                    type="text"
                    required
                    value={newWeaknessFa}
                    onChange={(e) => setNewWeaknessFa(e.target.value)}
                    placeholder="مثال: جملات شرطی نوع دوم، حروف اضافه زمان..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                    عنوان مبحث به زبان هدف ({currentLangInfo.nameFa}):
                  </label>
                  <input
                    type="text"
                    required
                    value={newWeaknessNative}
                    onChange={(e) => setNewWeaknessNative(e.target.value)}
                    placeholder="e.g. Second Conditionals, Irregular Verbs..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 font-latin text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">دسته‌بندی:</label>
                  <select
                    value={newWeaknessCategory}
                    onChange={(e) => setNewWeaknessCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Grammar">گرامر و ساختار جمله (Grammar)</option>
                    <option value="Vocabulary">واژگان و لغات تخصصی (Vocabulary)</option>
                    <option value="Pronunciation">تلفظ و لحن صوتی (Pronunciation)</option>
                    <option value="Idioms">اصطلاحات و مکالمات روزمره (Idioms)</option>
                    <option value="Prepositions">حروف اضافه و پیوندها (Prepositions)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                    توصیه آموزشی یا نکته کلیدی:
                  </label>
                  <input
                    type="text"
                    value={newWeaknessRec}
                    onChange={(e) => setNewWeaknessRec(e.target.value)}
                    placeholder="مثال: تمرکز بر ساختارهای If I were you و جملات روزمره"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddWeaknessModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن به باشگاه</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Custom Card */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-4 text-right"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">
                  افزودن فلش‌کارت دست‌نویس به {currentLangInfo.nameFa}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomCard} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                    کلمه یا عبارت به زبان هدف ({currentLangInfo.nameFa}):
                  </label>
                  <input
                    type="text"
                    required
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="e.g. Accomplish"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 font-latin text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">معنی به فارسی:</label>
                  <input
                    type="text"
                    required
                    value={newBackFa}
                    onChange={(e) => setNewBackFa(e.target.value)}
                    placeholder="مثال: به دست آوردن، محقق ساختن"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                    جمله مثال به زبان هدف:
                  </label>
                  <input
                    type="text"
                    value={newExampleTarget}
                    onChange={(e) => setNewExampleTarget(e.target.value)}
                    placeholder="She accomplished all her goals."
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 font-latin text-left"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">ترجمه مثال به فارسی:</label>
                  <input
                    type="text"
                    value={newExampleFa}
                    onChange={(e) => setNewExampleFa(e.target.value)}
                    placeholder="او تمام اهدافش را محقق ساخت."
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">دسته‌بندی:</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="واژگان روزمره، اصطلاحات، سفر..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ذخیره کارت در SRS</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
