import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  Star,
  Sparkles,
  Zap,
  RotateCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Award,
  Layers,
  Calendar,
  Check,
  Play,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  VocabularyItem,
  WeeklyVocabularyPack,
  getAll52WeeksVocabularyForLanguage,
  getWeeklyVocabularyForLanguage,
} from '../../data/vocabularyMasteryData';
import { SUPPORTED_LANGUAGES } from '../../data/curriculumData';
import { audioService } from '../../services/audioService';
import { CEFRLevel, WeekQuarter } from '../../types';

interface VocabularyMasteryViewProps {
  initialWeek?: number;
  onOpenAiTutor?: () => void;
}

export const VocabularyMasteryView: React.FC<VocabularyMasteryViewProps> = ({
  initialWeek = 1,
  onOpenAiTutor,
}) => {
  const { user, addXp, addGems } = useApp();

  // State
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(initialWeek);
  const [selectedQuarter, setSelectedQuarter] = useState<WeekQuarter | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'cards' | 'flashcards' | 'bookmarked'>('cards');

  // Interactive Quiz Modal
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Flip Flashcard state
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);

  // Local storage for Mastered and Bookmarked words
  const masteredStorageKey = `HosseinFatemeh_MasteredVocab_${user.id}_${user.targetLanguage}`;
  const bookmarkStorageKey = `HosseinFatemeh_BookmarkedVocab_${user.id}_${user.targetLanguage}`;

  const [masteredWordIds, setMasteredWordIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(masteredStorageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [bookmarkedWordIds, setBookmarkedWordIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(bookmarkStorageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Save changes to localStorage
  const toggleMasteredWord = (id: string) => {
    audioService.playClickSound();
    setMasteredWordIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        addXp(5);
        audioService.playCorrectSound();
      }
      localStorage.setItem(masteredStorageKey, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const toggleBookmarkWord = (id: string) => {
    audioService.playClickSound();
    setBookmarkedWordIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(bookmarkStorageKey, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Get active language meta
  const currentLang = SUPPORTED_LANGUAGES[user.targetLanguage] || SUPPORTED_LANGUAGES.en;

  // Load all 52 weekly packs
  const allWeeklyPacks = useMemo(() => {
    return getAll52WeeksVocabularyForLanguage(user.targetLanguage);
  }, [user.targetLanguage]);

  // Current active pack
  const currentPack: WeeklyVocabularyPack = useMemo(() => {
    return (
      allWeeklyPacks.find((p) => p.weekNumber === selectedWeekNumber) ||
      getWeeklyVocabularyForLanguage(user.targetLanguage, selectedWeekNumber)
    );
  }, [allWeeklyPacks, user.targetLanguage, selectedWeekNumber]);

  // Filtered weekly packs for selector list
  const filteredPacks = useMemo(() => {
    return allWeeklyPacks.filter((p) => {
      if (selectedQuarter !== 'all' && p.quarter !== selectedQuarter) return false;
      if (selectedLevel !== 'all' && p.level !== selectedLevel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTheme = p.themeFa.toLowerCase().includes(q) || p.themeNative.toLowerCase().includes(q);
        const matchWords = p.words.some(
          (w) => w.word.toLowerCase().includes(q) || w.meaningFa.toLowerCase().includes(q),
        );
        const matchWeekNum = `هفته ${p.weekNumber}`.includes(q) || `${p.weekNumber}` === q;
        if (!matchTheme && !matchWords && !matchWeekNum) return false;
      }
      return true;
    });
  }, [allWeeklyPacks, selectedQuarter, selectedLevel, searchQuery]);

  // All bookmarked words across 52 weeks
  const allBookmarkedWords = useMemo(() => {
    const list: { pack: WeeklyVocabularyPack; word: VocabularyItem }[] = [];
    allWeeklyPacks.forEach((p) => {
      p.words.forEach((w) => {
        if (bookmarkedWordIds.has(w.id)) {
          list.push({ pack: p, word: w });
        }
      });
    });
    return list;
  }, [allWeeklyPacks, bookmarkedWordIds]);

  // Progress stats
  const totalCurriculumWords = 52 * 5; // 260 words
  const totalMasteredCount = masteredWordIds.size;
  const masteryPercentage = Math.min(
    100,
    Math.round((totalMasteredCount / totalCurriculumWords) * 100),
  );

  // Play target word audio
  const handlePlayWordAudio = (wordText: string) => {
    audioService.speak(wordText, currentLang.defaultVoiceLocale, user.settings.ttsSpeed);
  };

  // Play Persian meaning audio
  const handlePlayPersianAudio = (persianText: string) => {
    audioService.speakPersian(persianText, 0.95);
  };

  // Level badge colors
  const levelBadgeColors: Record<CEFRLevel, string> = {
    A1: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    A2: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    B1: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    B2: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    C1: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    C2: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  const partOfSpeechLabels: Record<string, { textFa: string; color: string }> = {
    noun: { textFa: 'اسم', color: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200' },
    verb: { textFa: 'فعل', color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200' },
    adj: { textFa: 'صفت', color: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200' },
    adv: { textFa: 'قید', color: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-200' },
    phrase: { textFa: 'اصطلاح', color: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-200' },
    idiom: { textFa: 'ضرب‌المثل', color: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200' },
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Card: 52-Week Vocabulary Expansion Engine */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white shadow-lg space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-xs">
              {currentLang.flag}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  گنجینه و توسعه روزانه واژگان (Vocabulary Mastery)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 font-latin">
                  52 WEEKS
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                یادگیری موضوعی، روزانه و هدفمند ۵ کلمه طلایی در هر هفته برای {currentLang.nameFa}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-center">
              <div className="text-sm font-extrabold text-amber-300 font-latin">
                {totalMasteredCount} / {totalCurriculumWords}
              </div>
              <div className="text-[10px] text-indigo-100">واژه مسلط‌شده</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-center">
              <div className="text-sm font-extrabold text-emerald-300 font-latin">
                {masteryPercentage}%
              </div>
              <div className="text-[10px] text-indigo-100">پیشرفت کل</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/25 rounded-full h-2.5 p-0.5 relative z-10">
          <div
            className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.max(4, masteryPercentage)}%` }}
          />
        </div>

        {/* Decorative Blur Bubble */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Mode Sub-Tabs: Cards List | Interactive Flip Flashcards | Starred Bookmarks */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
          <button
            onClick={() => {
              setActiveTab('cards');
              audioService.playClickSound();
            }}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-gray-200 dark:border-slate-700'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>کارت‌های ۵ روزه هفته</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('flashcards');
              setIsCardFlipped(false);
              setFlashcardIndex(0);
              audioService.playClickSound();
            }}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-gray-200 dark:border-slate-700'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>فلش‌کارت چرخشی</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('bookmarked');
              audioService.playClickSound();
            }}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'bookmarked'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs border border-gray-200 dark:border-slate-700'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>نشان‌شده‌ها ({bookmarkedWordIds.size})</span>
          </button>
        </div>

        {/* Quick Quiz Button for Active Week */}
        <button
          onClick={() => {
            setIsQuizOpen(true);
            setQuizSelectedOption(null);
            setQuizSubmitted(false);
            audioService.playClickSound();
          }}
          className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>کوییز هفته {currentPack.weekNumber}</span>
        </button>
      </div>

      {/* Week Selector & Quarter Filters */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-3.5 shadow-xs">
        {/* Search Bar & Quarter Chips */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی کلمه، موضوع یا معنی فارسی در کل ۵۲ هفته..."
              className="w-full pl-3 pr-10 py-2.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedQuarter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                selectedQuarter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
              }`}
            >
              همه فصل‌ها
            </button>
            {[1, 2, 3, 4].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q as WeekQuarter)}
                className={`px-2.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  selectedQuarter === q
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                }`}
              >
                فصل {q}
              </button>
            ))}
          </div>
        </div>

        {/* 52-Week Horizontal Carousel Picker */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
            <span>انتخاب هفته آموزشی (۱ تا ۵۲):</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              هفته {currentPack.weekNumber} از ۵۲ ({currentPack.level})
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {filteredPacks.map((pack) => {
              const isSelected = pack.weekNumber === selectedWeekNumber;
              const wordsInPack = pack.words.map((w) => w.id);
              const masteredInPack = wordsInPack.filter((id) => masteredWordIds.has(id)).length;
              const isPackMastered = masteredInPack === 5;

              return (
                <button
                  key={pack.weekNumber}
                  onClick={() => {
                    setSelectedWeekNumber(pack.weekNumber);
                    setFlashcardIndex(0);
                    setIsCardFlipped(false);
                    audioService.playClickSound();
                  }}
                  className={`px-3 py-2 rounded-2xl border text-xs font-bold shrink-0 flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-105'
                      : isPackMastered
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>هفته {pack.weekNumber}</span>
                    {isPackMastered && <Check className="w-3 h-3 text-emerald-500" />}
                  </div>
                  <span className={`text-[9px] font-latin font-semibold ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
                    {pack.level}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Week Header Information Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${levelBadgeColors[currentPack.level]}`}>
              سطح {currentPack.level}
            </span>
            <span className="text-xs text-gray-400">فصل {currentPack.quarter} • ماه {currentPack.monthNumber}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (selectedWeekNumber > 1) {
                  setSelectedWeekNumber(selectedWeekNumber - 1);
                  audioService.playClickSound();
                }
              }}
              disabled={selectedWeekNumber <= 1}
              className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer text-gray-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
              هفته {currentPack.weekNumber}
            </span>
            <button
              onClick={() => {
                if (selectedWeekNumber < 52) {
                  setSelectedWeekNumber(selectedWeekNumber + 1);
                  audioService.playClickSound();
                }
              }}
              disabled={selectedWeekNumber >= 52}
              className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer text-gray-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="text-base font-extrabold text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <span>موضوع هفته: {currentPack.themeFa}</span>
          <span className="text-xs font-normal text-indigo-600 dark:text-indigo-400 font-latin">
            ({currentPack.themeNative})
          </span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
          {currentPack.descriptionFa}
        </p>
      </div>

      {/* View Mode 1: Detailed Daily Word Cards */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          {currentPack.words.map((item) => {
            const isMastered = masteredWordIds.has(item.id);
            const isBookmarked = bookmarkedWordIds.has(item.id);
            const pos = partOfSpeechLabels[item.partOfSpeech] || partOfSpeechLabels.noun;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-3 shadow-xs ${
                  isMastered
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'
                }`}
              >
                {/* Header: Day Badge, Word, Audio Buttons & Action Toggles */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-latin border border-indigo-100 dark:border-indigo-800">
                        روز {item.dayNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${pos.color}`}>
                        {pos.textFa}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-slate-500 font-latin">
                        {item.phonetic}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 pt-0.5">
                      <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white font-latin tracking-wide">
                        {item.word}
                      </h4>

                      {/* Target Language Audio Button */}
                      <button
                        onClick={() => handlePlayWordAudio(item.word)}
                        className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 transition-all cursor-pointer active:scale-90"
                        title="پخش تلفظ زبان هدف"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right Actions: Bookmark & Mastered Checkbox */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleBookmarkWord(item.id)}
                      className={`p-2 rounded-2xl border transition-all cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-500 border-amber-300 dark:border-amber-700'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-400 border-gray-200 dark:border-slate-700 hover:text-amber-500'
                      }`}
                      title={isBookmarked ? 'حذف از نشان‌شده‌ها' : 'افزودن به نشان‌شده‌ها'}
                    >
                      <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => toggleMasteredWord(item.id)}
                      className={`px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isMastered
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isMastered ? 'text-white' : 'text-gray-400'}`} />
                      <span>{isMastered ? 'مسلط شدید (+۵ XP)' : 'ثبت تسلط'}</span>
                    </button>
                  </div>
                </div>

                {/* Persian Translation & Explanation */}
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>معنی فارسی:</span>
                      <span className="text-indigo-700 dark:text-indigo-300 font-bold">{item.meaningFa}</span>
                    </span>
                    <button
                      onClick={() => handlePlayPersianAudio(item.meaningFa)}
                      className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer"
                      title="خواندن صوتی معنی فارسی"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                    💡 <span className="font-semibold">کاربرد و نکته:</span> {item.contextNoteFa}
                  </p>
                </div>

                {/* Example Sentence in Context */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400">جمله نمونه در مکالمه واقعی:</span>
                  <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200 font-latin leading-relaxed">
                        {item.exampleTarget}
                      </p>
                      <button
                        onClick={() => handlePlayWordAudio(item.exampleTarget)}
                        className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 transition-all shrink-0 cursor-pointer"
                        title="پخش صوتی جمله"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-slate-300">{item.exampleFa}</p>
                  </div>
                </div>

                {/* Collocations Chips */}
                {item.collocations && item.collocations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-gray-400">هم‌آیندهای پرکاربرد:</span>
                    {item.collocations.map((col, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-latin font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View Mode 2: Interactive 3D Flip Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
            <span>فلش‌کارت واژگان هفته {currentPack.weekNumber}</span>
            <span className="font-latin font-bold text-indigo-600 dark:text-indigo-400">
              {flashcardIndex + 1} / {currentPack.words.length}
            </span>
          </div>

          {currentPack.words[flashcardIndex] && (
            <div className="perspective-1000 min-h-[260px]">
              <motion.div
                onClick={() => {
                  setIsCardFlipped(!isCardFlipped);
                  audioService.playClickSound();
                }}
                className={`w-full min-h-[260px] p-6 sm:p-8 rounded-3xl border text-center flex flex-col items-center justify-center gap-4 cursor-pointer shadow-md transition-all ${
                  isCardFlipped
                    ? 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950 border-indigo-300 dark:border-indigo-700'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-indigo-400'
                }`}
              >
                {!isCardFlipped ? (
                  <div className="space-y-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-latin border border-indigo-100 dark:border-indigo-800">
                      روز {currentPack.words[flashcardIndex].dayNumber} • {currentPack.level}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white font-latin tracking-wide">
                      {currentPack.words[flashcardIndex].word}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-latin">
                      {currentPack.words[flashcardIndex].phonetic}
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayWordAudio(currentPack.words[flashcardIndex].word);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>پخش تلفظ</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-indigo-500 dark:text-indigo-400 block pt-3">
                      👆 برای دیدن معنی و جمله نمونه کلیک کنید (چرخش کارت)
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3 text-right w-full">
                    <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        معنی و کاربرد فارسی:
                      </span>
                      <span className="text-sm font-black text-gray-900 dark:text-white font-latin">
                        {currentPack.words[flashcardIndex].word}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-indigo-900 dark:text-indigo-200">
                      {currentPack.words[flashcardIndex].meaningFa}
                    </h4>

                    <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                      💡 {currentPack.words[flashcardIndex].contextNoteFa}
                    </p>

                    <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-indigo-100 dark:border-slate-700 space-y-1">
                      <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 font-latin">
                        {currentPack.words[flashcardIndex].exampleTarget}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">
                        {currentPack.words[flashcardIndex].exampleFa}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Flashcard Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (flashcardIndex > 0) {
                  setFlashcardIndex(flashcardIndex - 1);
                  setIsCardFlipped(false);
                  audioService.playClickSound();
                }
              }}
              disabled={flashcardIndex === 0}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-700 dark:text-slate-300 disabled:opacity-40 hover:bg-gray-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ChevronRight className="w-4 h-4" />
              <span>واژه قبلی</span>
            </button>

            <button
              onClick={() => {
                const curId = currentPack.words[flashcardIndex].id;
                toggleMasteredWord(curId);
              }}
              className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {masteredWordIds.has(currentPack.words[flashcardIndex]?.id) ? 'مسلط شدید' : 'یاد گرفتم'}
              </span>
            </button>

            <button
              onClick={() => {
                if (flashcardIndex < currentPack.words.length - 1) {
                  setFlashcardIndex(flashcardIndex + 1);
                  setIsCardFlipped(false);
                  audioService.playClickSound();
                }
              }}
              disabled={flashcardIndex >= currentPack.words.length - 1}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-700 dark:text-slate-300 disabled:opacity-40 hover:bg-gray-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>واژه بعدی</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View Mode 3: Starred & Bookmarked Words */}
      {activeTab === 'bookmarked' && (
        <div className="space-y-3">
          {allBookmarkedWords.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-500 flex items-center justify-center mx-auto text-xl">
                ⭐
              </div>
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                هنوز واژه‌ای را نشان نکرده‌اید!
              </h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                با زدن روی آیکون ستاره در کنار کلمات دشوار یا پرکاربرد هر هفته، آن‌ها را در این بخش برای مرور سریع و دوره‌ای ذخیره کنید.
              </p>
            </div>
          ) : (
            allBookmarkedWords.map(({ pack, word }) => (
              <div
                key={word.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900 dark:text-white font-latin">
                      {word.word}
                    </span>
                    <button
                      onClick={() => handlePlayWordAudio(word.word)}
                      className="p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-latin">
                      هفته {pack.weekNumber}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-700 dark:text-slate-300">{word.meaningFa}</p>
                </div>

                <button
                  onClick={() => toggleBookmarkWord(word.id)}
                  className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 cursor-pointer"
                  title="حذف از نشان‌شده‌ها"
                >
                  <Star className="w-4 h-4 fill-amber-400" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Interactive Weekly Quiz Modal */}
      <AnimatePresence>
        {isQuizOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-gray-200 dark:border-slate-800 shadow-2xl space-y-4 text-right"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    کوییز تسلط واژگان هفته {currentPack.weekNumber} ({currentPack.level})
                  </h3>
                </div>
                <button
                  onClick={() => setIsQuizOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 flex items-center justify-center font-bold hover:bg-gray-200 cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Quiz Prompt */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {currentPack.quizQuestion.targetPrompt}
                </p>
                <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-relaxed">
                  {currentPack.quizQuestion.promptFa}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2">
                {currentPack.quizQuestion.options.map((opt, oIdx) => {
                  const isSelected = quizSelectedOption === oIdx;
                  const isCorrect = oIdx === currentPack.quizQuestion.correctIndex;

                  let btnStyle = 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200';
                  if (quizSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-800 dark:text-rose-200';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-800 dark:text-indigo-200';
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={quizSubmitted}
                      onClick={() => {
                        setQuizSelectedOption(oIdx);
                        audioService.playClickSound();
                      }}
                      className={`w-full p-3.5 rounded-2xl border text-xs font-bold text-right flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Explanation after Submission */}
              {quizSubmitted && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5">
                    {quizSelectedOption === currentPack.quizQuestion.correctIndex ? (
                      <span className="text-emerald-600">🎉 پاسخ کاملاً درست است! (+۱۵ XP و ۲ الماس)</span>
                    ) : (
                      <span className="text-rose-600">💡 پاسخ صحیح گزینه {currentPack.quizQuestion.correctIndex + 1} است.</span>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-600 dark:text-slate-300">
                    {currentPack.quizQuestion.explanationFa}
                  </p>
                </div>
              )}

              {/* Bottom Action Button */}
              <div className="pt-2">
                {!quizSubmitted ? (
                  <button
                    disabled={quizSelectedOption === null}
                    onClick={() => {
                      setQuizSubmitted(true);
                      if (quizSelectedOption === currentPack.quizQuestion.correctIndex) {
                        audioService.playFanfareSound();
                        addXp(15);
                        addGems(2);
                      } else {
                        audioService.playWrongSound();
                      }
                    }}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    ثبت و ارزیابی پاسخ
                  </button>
                ) : (
                  <button
                    onClick={() => setIsQuizOpen(false)}
                    className="w-full py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    بستن و ادامه تمرین
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
