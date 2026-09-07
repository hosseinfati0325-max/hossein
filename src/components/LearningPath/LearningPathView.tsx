import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Check,
  Lock,
  Sparkles,
  Zap,
  Award,
  BookOpen,
  Compass,
  ArrowLeft,
  Flame,
  Layers,
  Calendar,
  Filter,
  Search,
  Trophy,
  CheckCircle2,
  Play,
  RotateCcw,
  Unlock,
  ChevronDown,
  Info,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  ALL_UNITS_BY_LANG,
  ENGLISH_UNITS,
  SUPPORTED_LANGUAGES,
} from '../../data/curriculumData';
import {
  get52WeeksCurriculumForLanguage,
} from '../../data/curriculum52WeeksData';
import { curriculumStorageService } from '../../services/curriculumStorageService';
import {
  Lesson,
  Unit,
  CurriculumWeek,
  WeekStageLesson,
  CEFRLevel,
  WeekQuarter,
  Curriculum52WeeksDB,
} from '../../types';
import { LessonRunnerModal } from '../LessonRunner/LessonRunnerModal';
import { WeekDetailModal } from './WeekDetailModal';
import { DailyStudyGoalRing } from './DailyStudyGoalRing';
import { DailyWordTipCard } from '../DailyWord/DailyWordTipCard';
import { FlashcardQuickReviewWidget } from './FlashcardQuickReviewWidget';
import { VocabularyMasteryView } from './VocabularyMasteryView';
import { audioService } from '../../services/audioService';

interface LearningPathViewProps {
  onOpenPlacementTest: () => void;
  onOpenAiTutor: () => void;
  onOpenSRS?: () => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  onOpenPlacementTest,
  onOpenAiTutor,
  onOpenSRS,
}) => {
  const { user, completeLesson } = useApp();

  // Mode: 52-Week Tree Roadmap vs Vocabulary Mastery vs Fast Unit Lessons
  const [viewMode, setViewMode] = useState<'52weeks' | 'vocab' | 'units'>('52weeks');
  const [vocabInitialWeek, setVocabInitialWeek] = useState<number>(1);

  // 52-Week Curriculum State
  const [selectedQuarter, setSelectedQuarter] = useState<WeekQuarter | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<CurriculumWeek | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Local database state for 52 weeks
  const [curriculumDB, setCurriculumDB] = useState<Curriculum52WeeksDB>(() =>
    curriculumStorageService.get52WeeksProgress(user.id, user.targetLanguage),
  );

  // Reload 52-week DB when user or target language changes
  const reloadCurriculumDB = useCallback(() => {
    const db = curriculumStorageService.get52WeeksProgress(user.id, user.targetLanguage);
    setCurriculumDB(db);
  }, [user.id, user.targetLanguage]);

  useEffect(() => {
    reloadCurriculumDB();
  }, [user.id, user.targetLanguage, reloadCurriculumDB]);

  // Generate the full 52-week curriculum for the active language
  const full52Weeks = useMemo(() => {
    return get52WeeksCurriculumForLanguage(user.targetLanguage);
  }, [user.targetLanguage]);

  // Get current curriculum units based on target language
  const units: Unit[] = ALL_UNITS_BY_LANG[user.targetLanguage] || ENGLISH_UNITS;
  const currentLang = SUPPORTED_LANGUAGES[user.targetLanguage] || SUPPORTED_LANGUAGES.en;

  // Filtered weeks based on Quarter, CEFR Level, and Search query
  const filteredWeeks = useMemo(() => {
    return full52Weeks.filter((w) => {
      if (selectedQuarter !== 'all' && w.quarter !== selectedQuarter) return false;
      if (selectedLevel !== 'all' && w.level !== selectedLevel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitleFa = w.titleFa.toLowerCase().includes(q);
        const matchTitleNative = w.titleNative.toLowerCase().includes(q);
        const matchTheme = w.themeFa.toLowerCase().includes(q);
        const matchGrammar = w.grammarFocusFa.toLowerCase().includes(q);
        const matchNum = `هفته ${w.weekNumber}`.includes(q) || `${w.weekNumber}` === q;
        if (!matchTitleFa && !matchTitleNative && !matchTheme && !matchGrammar && !matchNum) {
          return false;
        }
      }
      return true;
    });
  }, [full52Weeks, selectedQuarter, selectedLevel, searchQuery]);

  // Calculate 52-week progress stats
  const progressStats = useMemo(() => {
    let completedStagesCount = 0;
    let masteredWeeksCount = 0;
    Object.values(curriculumDB.weekProgress || {}).forEach((rec: any) => {
      if (!rec) return;
      completedStagesCount += (rec.completedStageIds || []).length;
      if (rec.isWeekMastered) masteredWeeksCount += 1;
    });
    const totalStages = 52 * 5; // 260 stages
    const percent = Math.min(100, Math.round((completedStagesCount / totalStages) * 100));
    return {
      completedStagesCount,
      totalStages,
      masteredWeeksCount,
      percent,
      unlockedWeekNumber: curriculumDB.unlockedWeekNumber || 1,
    };
  }, [curriculumDB]);

  // Start Stage Lesson in the Runner
  const handleStartStage = (week: CurriculumWeek, stage: WeekStageLesson) => {
    const lessonForRunner: Lesson = {
      id: stage.id,
      unitId: `w${week.weekNumber}`,
      title: stage.titleNative,
      titleFa: `${week.titleFa} - ${stage.titleFa}`,
      descriptionFa: stage.descriptionFa,
      xpReward: stage.xpReward,
      gemReward: stage.gemReward,
      exercises: stage.exercises,
      levelRequired: week.level,
    };

    setActiveLesson(lessonForRunner);
    setSelectedWeek(null);
  };

  // When lesson finishes in LessonRunnerModal
  const handleLessonCompletedClose = () => {
    if (activeLesson) {
      // Check if it's a 52-week stage (id format: {lang}_w{weekNum}_stage{stageNum})
      const match = activeLesson.id.match(/_w(\d+)_stage(\d+)/);
      if (match) {
        const weekNum = parseInt(match[1], 10);
        curriculumStorageService.saveWeekStageCompletion(
          user.id,
          user.targetLanguage,
          weekNum,
          activeLesson.id,
          100,
        );
        reloadCurriculumDB();
      }
    }
    setActiveLesson(null);
  };

  const handleStartUnitLesson = (lesson: Lesson, isLocked: boolean) => {
    if (isLocked) {
      audioService.playWrongSound();
      return;
    }
    audioService.playClickSound();
    setActiveLesson(lesson);
  };

  const handleUnlockAllForDemo = () => {
    audioService.playFanfareSound();
    const updated = curriculumStorageService.unlockAllWeeksForTesting(user.id, user.targetLanguage);
    setCurriculumDB(updated);
  };

  const handleReset52Weeks = () => {
    if (window.confirm('آیا از بازنشانی پیشرفت ۵۲ هفته در دیتابیس محلی اطمینان دارید؟')) {
      audioService.playClickSound();
      const reset = curriculumStorageService.resetCurriculumProgress(user.id, user.targetLanguage);
      setCurriculumDB(reset);
    }
  };

  const levelBadgeColors: Record<CEFRLevel, string> = {
    A1: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    A2: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    B1: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    B2: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    C1: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    C2: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  return (
    <div className="pb-28 max-w-2xl mx-auto px-2 sm:px-4 pt-2.5 sm:pt-4 space-y-4 sm:space-y-5 select-none w-full">
      {/* Daily Study Goal Progress Ring Card */}
      <DailyStudyGoalRing
        onOpenAiTutor={onOpenAiTutor}
        onStartQuickPractice={() => {
          if (filteredWeeks.length > 0) {
            const firstWeek = filteredWeeks[0];
            if (firstWeek.stages && firstWeek.stages.length > 0) {
              handleStartStage(firstWeek, firstWeek.stages[0]);
            }
          }
        }}
      />

      {/* Daily Word & Pedagogical Tip Card (Personalized by Level) */}
      <DailyWordTipCard onOpenAiTutor={onOpenAiTutor} />

      {/* SRS Flashcard Quick Review Widget (Daily 3-Card Practice) */}
      <FlashcardQuickReviewWidget onOpenSRS={onOpenSRS} />

      {/* Placement Test Prompt Banner (if not completed) */}
      {!user.placementTestDone && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg flex items-center justify-between gap-3 sm:gap-4 relative overflow-hidden"
        >
          <div className="space-y-1 relative z-10 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-100">
              <Compass className="w-4 h-4 text-indigo-200 shrink-0" />
              <span>تعیین سطح هوشمند و دقیق</span>
            </div>
            <h3 className="text-xs sm:text-base font-extrabold text-white">هنوز سطحتان را نسنجیده‌اید؟</h3>
            <p className="text-[11px] sm:text-xs text-indigo-100/90 leading-relaxed">
              با شرکت در آزمون ۵ دقیقه‌ای، درس‌های متناسب با سطح واقعی‌تان باز می‌شود.
            </p>
          </div>
          <button
            onClick={onOpenPlacementTest}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-xs shrink-0 shadow-md hover:bg-indigo-50 transition-all active:scale-95 relative z-10"
          >
            شروع آزمون
          </button>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        </motion.div>
      )}

      {/* Language Overview Banner Card */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-xl sm:text-2xl shadow-xs shrink-0">
            {currentLang.flag}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="truncate">{currentLang.nameFa} ({currentLang.nameNative})</span>
              <span className="text-[9px] sm:text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 sm:px-2 py-0.5 rounded-full font-latin font-bold border border-indigo-100 dark:border-indigo-800">
                {currentLang.speakersCount}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 truncate">
              {currentLang.descriptionFa}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenAiTutor}
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shrink-0 active:scale-95 shadow-sm shadow-indigo-200 dark:shadow-none flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">یار هوش مصنوعی</span>
          <span className="xs:hidden">یار هوش</span>
        </button>
      </div>

      {/* Mode Switcher Toggle Bar */}
      <div className="p-1 sm:p-1.5 bg-gray-100 dark:bg-slate-800/90 rounded-2xl flex items-center gap-1 border border-gray-200 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            setViewMode('52weeks');
            audioService.playClickSound();
          }}
          className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap transition-all cursor-pointer select-none shrink-0 sm:shrink ${
            viewMode === '52weeks'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-gray-200/80 dark:border-slate-700'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>مسیر ۵۲ هفته</span>
        </button>

        <button
          onClick={() => {
            setViewMode('vocab');
            audioService.playClickSound();
          }}
          className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap transition-all cursor-pointer select-none shrink-0 sm:shrink ${
            viewMode === 'vocab'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-gray-200/80 dark:border-slate-700'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>گنجینه واژگان</span>
        </button>

        <button
          onClick={() => {
            setViewMode('units');
            audioService.playClickSound();
          }}
          className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap transition-all cursor-pointer select-none shrink-0 sm:shrink ${
            viewMode === 'units'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-gray-200/80 dark:border-slate-700'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>درس‌های سریع</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 52-WEEK CURRICULUM TREE VIEW */}
      {/* ========================================================================= */}
      {viewMode === '52weeks' && (
        <div className="space-y-5">
          {/* 52-Week Progress Card & Local DB Status */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  ذخیره در دیتابیس محلی (Local DB)
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-slate-100">
                  مسیر ۵۲ هفته‌ای یادگیری زبان {currentLang.nameFa}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleUnlockAllForDemo}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-all flex items-center gap-1"
                  title="بازگشایی تمام ۵۲ هفته برای تست و بررسی"
                >
                  <Unlock className="w-3 h-3" />
                  <span>آزاد کردن همه</span>
                </button>
                <button
                  onClick={handleReset52Weeks}
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 transition-all"
                  title="بازنشانی پیشرفت دیتابیس"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Progress Bar & Badges */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300">
                <span>پیشرفت کلی: {progressStats.percent}٪</span>
                <span>
                  هفته فعال: {progressStats.unlockedWeekNumber} از ۵۲ • {progressStats.completedStagesCount} مرحله کامل‌شده
                </span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressStats.percent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Quarter Navigator Filter Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>فصل‌های سال یادگیری (۴ فصل):</span>
              </span>
              <span className="text-[11px] text-gray-400 dark:text-slate-500 font-bold">
                {filteredWeeks.length} هفته در دسترس
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { q: 1 as WeekQuarter, title: 'فصل ۱ (هفته ۱-۱۳)', sub: 'A1 ➔ A2 مقدماتی' },
                { q: 2 as WeekQuarter, title: 'فصل ۲ (هفته ۱۴-۲۶)', sub: 'A2 ➔ B1 متوسط' },
                { q: 3 as WeekQuarter, title: 'فصل ۳ (هفته ۲۷-۳۹)', sub: 'B1 ➔ B2 فوق‌متوسط' },
                { q: 4 as WeekQuarter, title: 'فصل ۴ (هفته ۴۰-۵۲)', sub: 'C1 ➔ C2 پیشرفته/استادی' },
              ].map((item) => {
                const isActive = selectedQuarter === item.q;
                return (
                  <button
                    key={item.q}
                    onClick={() => {
                      setSelectedQuarter(isActive ? 'all' : item.q);
                      audioService.playClickSound();
                    }}
                    className={`p-2.5 rounded-2xl text-right transition-all border ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 border-gray-200 dark:border-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-[11px] font-extrabold">{item.title}</div>
                    <div
                      className={`text-[9px] font-latin font-bold mt-0.5 ${
                        isActive ? 'text-indigo-100' : 'text-gray-400 dark:text-slate-500'
                      }`}
                    >
                      {item.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CEFR Level Quick Filter Pills & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Level Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => {
                  setSelectedLevel('all');
                  audioService.playClickSound();
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  selectedLevel === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-800'
                }`}
              >
                تمام سطوح
              </button>
              {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => {
                const isSelected = selectedLevel === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => {
                      setSelectedLevel(isSelected ? 'all' : lvl);
                      audioService.playClickSound();
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-latin font-bold transition-all border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[150px] flex-1 sm:flex-initial">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی موضوع یا هفته..."
                className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs text-gray-900 dark:text-slate-100 font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* ===================================================================== */}
          {/* THE 52-WEEK ROADMAP TREE (ZIGZAG NODES) */}
          {/* ===================================================================== */}
          <div className="relative pt-4 space-y-5">
            {filteredWeeks.map((week, idx) => {
              const weekProg = curriculumDB.weekProgress[week.weekNumber];
              const completedCount = (weekProg?.completedStageIds || []).length;
              const isMastered = weekProg?.isWeekMastered || completedCount >= 5;
              const isUnlocked = week.weekNumber <= (curriculumDB.unlockedWeekNumber || 1);

              // Zigzag horizontal offset map for aesthetic path
              const offsetPattern = [0, 30, 0, -30];
              const offset = offsetPattern[week.weekNumber % 4];

              return (
                <div key={week.weekNumber} className="relative flex flex-col items-center">
                  {/* Milestone Section Header Header if milestone */}
                  {week.isMilestone && (
                    <div className="w-full mb-3 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-xs shadow-md">
                        <Trophy className="w-4 h-4 fill-slate-950" />
                        <span>{week.milestoneTitleFa}</span>
                      </div>
                    </div>
                  )}

                  {/* Week Node Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ transform: `translateX(${offset}px)` }}
                    onClick={() => {
                      audioService.playClickSound();
                      setSelectedWeek(week);
                    }}
                    className={`w-full max-w-lg p-4 rounded-3xl border transition-all cursor-pointer shadow-xs relative overflow-hidden ${
                      isMastered
                        ? 'bg-gradient-to-br from-emerald-50/90 to-white dark:from-emerald-950/30 dark:to-slate-900 border-emerald-300 dark:border-emerald-800/80 shadow-emerald-100/50 dark:shadow-none'
                        : isUnlocked
                        ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 shadow-md hover:border-indigo-400 dark:hover:border-indigo-600'
                        : 'bg-gray-50/70 dark:bg-slate-900/40 border-gray-200 dark:border-slate-800/60 opacity-65'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Circular Week Action Badge */}
                        <div
                          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black shadow-xs transition-all ${
                            isMastered
                              ? 'bg-emerald-500 text-white'
                              : isUnlocked
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950'
                              : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600'
                          }`}
                        >
                          {isMastered ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : isUnlocked ? (
                            <span className="text-xs font-latin font-black">W{week.weekNumber}</span>
                          ) : (
                            <Lock className="w-5 h-5" />
                          )}
                          <span className="text-[9px] font-latin opacity-90">{week.level}</span>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-black text-gray-900 dark:text-slate-100">
                              هفته {week.weekNumber}: {week.titleFa}
                            </span>
                            <span
                              className={`px-2 py-0.2 rounded-full font-latin font-bold text-[10px] border ${
                                levelBadgeColors[week.level]
                              }`}
                            >
                              {week.level}
                            </span>
                          </div>

                          <p className="text-[11px] font-latin text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                            {week.titleNative}
                          </p>

                          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {week.themeFa}
                          </p>

                          {/* Quick Vocab Button */}
                          <div className="pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setVocabInitialWeek(week.weekNumber);
                                setViewMode('vocab');
                                audioService.playClickSound();
                              }}
                              className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <BookOpen className="w-3 h-3 text-indigo-500" />
                              <span>واژگان طلایی هفته {week.weekNumber}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right-side status and details button */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isMastered
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isUnlocked
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'
                          }`}
                        >
                          {isMastered ? '✓ تکمیل شد' : `${completedCount}/۵ مرحله`}
                        </span>

                        <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                          <span>مشاهده و شروع</span>
                          <ArrowLeft className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 52-WEEK VOCABULARY MASTERY MODULE VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'vocab' && (
        <VocabularyMasteryView
          initialWeek={vocabInitialWeek}
          onOpenAiTutor={onOpenAiTutor}
        />
      )}

      {/* ========================================================================= */}
      {/* FAST UNIT LESSONS VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'units' && (
        <div className="space-y-8">
          {units.map((unit) => {
            return (
              <div key={unit.id} className="space-y-4">
                {/* Unit Header Card */}
                <div className="p-4 rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs text-gray-900 dark:text-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 font-latin uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800">
                      بخش {unit.unitNumber} • سطح {unit.level}
                    </span>
                    <span className="text-xs font-latin text-gray-400 dark:text-slate-500 font-semibold">
                      {unit.titleNative}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-slate-100 mt-1">
                    {unit.titleFa}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    {unit.descriptionFa}
                  </p>
                </div>

                {/* Unit Lessons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unit.lessons.map((lesson, lIdx) => {
                    const isCompleted = user.completedLessonIds.includes(lesson.id);
                    const isLocked =
                      lIdx > 0 &&
                      !user.completedLessonIds.includes(unit.lessons[lIdx - 1].id) &&
                      !isCompleted;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleStartUnitLesson(lesson, isLocked)}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isCompleted
                            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                            : !isLocked
                            ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 shadow-xs'
                            : 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isCompleted
                                ? 'bg-amber-500 text-slate-950'
                                : !isLocked
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 dark:bg-slate-700 text-gray-400'
                            }`}
                          >
                            {isCompleted ? (
                              <Star className="w-5 h-5 fill-slate-950" />
                            ) : !isLocked ? (
                              <BookOpen className="w-5 h-5" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-gray-900 dark:text-slate-100">
                              {lesson.titleFa}
                            </h4>
                            <p className="text-[10px] font-latin text-gray-400 dark:text-slate-500">
                              {lesson.title}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-latin font-bold text-indigo-600 dark:text-indigo-400">
                          +{lesson.xpReward}XP
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Week Detail Modal Drawer */}
      {selectedWeek && (
        <WeekDetailModal
          week={selectedWeek}
          targetLanguage={user.targetLanguage}
          userId={user.id}
          weekProgress={curriculumDB.weekProgress[selectedWeek.weekNumber]}
          isUnlocked={selectedWeek.weekNumber <= (curriculumDB.unlockedWeekNumber || 1)}
          onClose={() => setSelectedWeek(null)}
          onStartStage={(stage) => handleStartStage(selectedWeek, stage)}
          onRefreshDB={reloadCurriculumDB}
        />
      )}

      {/* Active Lesson Modal */}
      {activeLesson && (
        <LessonRunnerModal
          lesson={activeLesson}
          onClose={handleLessonCompletedClose}
        />
      )}
    </div>
  );
};
