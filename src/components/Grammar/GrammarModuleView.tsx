import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Brain,
  Send,
  HelpCircle,
  Layers,
  Award,
  ArrowRight,
  RotateCcw,
  Zap,
  Check,
  X,
  MessageSquare,
  Flame,
  Search,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GrammarLesson, GrammarSentenceAnalysisResult, CEFRLevel, TargetLanguageCode } from '../../types';
import { ALL_GRAMMAR_LESSONS } from '../../data/grammarData';
import { SUPPORTED_LANGUAGES } from '../../data/curriculumData';
import { audioService } from '../../services/audioService';
import { MockExamModal } from '../ExamsAndLeague/MockExamModal';

export const GrammarModuleView: React.FC = () => {
  const {
    user,
    setTargetLanguage,
    addXP,
    addGems,
    triggerCelebration,
    showCelebrationModal,
    markGrammarLessonMastered,
  } = useApp();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<GrammarLesson | null>(null);
  const [isMockExamOpen, setIsMockExamOpen] = useState(false);

  // Active sub-tab in lesson view
  const [lessonSubTab, setLessonSubTab] = useState<'guide' | 'ai_analyzer' | 'ai_ask' | 'quiz'>('guide');

  // AI Sentence Analyzer State
  const [userSentence, setUserSentence] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GrammarSentenceAnalysisResult | null>(null);

  // AI Ask Coach State
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<any | null>(null);

  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [dynamicAiQuizzes, setDynamicAiQuizzes] = useState<any[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES[user.targetLanguage] || SUPPORTED_LANGUAGES.en;
  const lessonsForLang = ALL_GRAMMAR_LESSONS[user.targetLanguage] || ALL_GRAMMAR_LESSONS.en;

  // Filter lessons
  const filteredLessons = lessonsForLang.filter((lesson) => {
    const matchesLevel = selectedLevel === 'ALL' || lesson.level === selectedLevel;
    const matchesSearch =
      !searchQuery.trim() ||
      lesson.titleFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.titleNative.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.summaryFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.categoryFa.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Open a lesson
  const handleOpenLesson = (lesson: GrammarLesson) => {
    setSelectedLesson(lesson);
    setLessonSubTab('guide');
    setUserSentence('');
    setAnalysisResult(null);
    setAiAnswer(null);
    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setIsQuizSubmitted(false);
    setQuizScore(0);
    setDynamicAiQuizzes([]);
    audioService.playClickSound();
  };

  // AI Sentence Analysis handler
  const handleAnalyzeSentence = async () => {
    if (!userSentence.trim() || isAnalyzing || !selectedLesson) return;
    setIsAnalyzing(true);
    audioService.playClickSound();

    try {
      const response = await fetch('/api/grammar/analyze-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence: userSentence,
          targetLanguage: user.targetLanguage,
          ruleTitle: selectedLesson.titleNative,
          ruleContext: selectedLesson.summaryFa,
          userLevel: selectedLesson.level,
          explanationLanguage: user.explanationLanguage,
        }),
      });

      const data = await response.json();
      setAnalysisResult(data);
      if (data.isCorrect) {
        audioService.playCorrectSound();
        addXP(15);
        if (data.score >= 90) {
          triggerCelebration('grammar');
        }
      } else {
        audioService.playWrongSound();
      }
    } catch (err) {
      console.error('Error analyzing grammar sentence:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Ask AI Rule Coach handler
  const handleAskAiCoach = async (customQ?: string) => {
    const q = (customQ || aiQuestion).trim();
    if (!q || isAskingAi || !selectedLesson) return;

    setIsAskingAi(true);
    setAiQuestion('');
    audioService.playClickSound();

    try {
      const response = await fetch('/api/grammar/ask-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          ruleTitle: selectedLesson.titleNative,
          targetLanguage: user.targetLanguage,
          userLevel: selectedLesson.level,
          explanationLanguage: user.explanationLanguage,
        }),
      });

      const data = await response.json();
      setAiAnswer(data);
      addXP(5);
    } catch (err) {
      console.error('Error asking grammar question:', err);
    } finally {
      setIsAskingAi(false);
    }
  };

  // Generate dynamic AI Quizzes
  const handleGenerateAiQuiz = async () => {
    if (!selectedLesson || isGeneratingQuiz) return;
    setIsGeneratingQuiz(true);
    audioService.playClickSound();

    try {
      const response = await fetch('/api/grammar/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleTitle: selectedLesson.titleNative,
          targetLanguage: user.targetLanguage,
          level: selectedLesson.level,
          count: 4,
          explanationLanguage: user.explanationLanguage,
        }),
      });

      const data = await response.json();
      if (data.quizzes && data.quizzes.length > 0) {
        setDynamicAiQuizzes(data.quizzes);
        setCurrentQuizIndex(0);
        setSelectedQuizOption(null);
        setIsQuizSubmitted(false);
      }
    } catch (err) {
      console.error('Error generating AI grammar quiz:', err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const activeQuizzes = dynamicAiQuizzes.length > 0 ? dynamicAiQuizzes : selectedLesson?.interactiveQuizzes || [];
  const currentQuiz = activeQuizzes[currentQuizIndex];

  // Submit Quiz Answer
  const handleSubmitQuiz = () => {
    if (!selectedQuizOption || isQuizSubmitted || !currentQuiz) return;
    setIsQuizSubmitted(true);

    const isCorrect = selectedQuizOption === currentQuiz.correctAnswer;
    if (isCorrect) {
      audioService.playCorrectSound();
      setQuizScore((prev) => prev + 1);
      addXP(10);
    } else {
      audioService.playWrongSound();
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < activeQuizzes.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedQuizOption(null);
      setIsQuizSubmitted(false);
    } else {
      // Completed all
      const finalScore = quizScore + (selectedQuizOption === currentQuiz?.correctAnswer ? 1 : 0);
      const totalQuizzes = activeQuizzes.length;
      const scorePercent = Math.round((finalScore / totalQuizzes) * 100);
      const xpWon = 30 + finalScore * 5;
      const gemsWon = finalScore >= 3 ? 5 : 2;

      addXP(xpWon);
      addGems(gemsWon);
      audioService.playSuccessSound();

      showCelebrationModal({
        title: 'تبریک! آزمون گرامر تکمیل شد!',
        subtitle: `شما به ${finalScore} از ${totalQuizzes} سوال گرامر «${selectedLesson?.titleFa}» پاسخ صحیح دادید.`,
        xpReward: xpWon,
        gemReward: gemsWon,
        scorePercent,
        category: 'grammar',
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-3 sm:p-6 pb-24 selection:bg-indigo-600 selection:text-white">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 mb-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none shrink-0">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">
                  ماژول جامع آموزش گرامر {currentLang.nameFa}
                </h1>
                <span className="text-xl sm:text-2xl">{currentLang.flag}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
                درسنامه‌های طبقه‌بندی‌شده از سطح پایه تا پیشرفته، همراه با تحلیل زنده هوش مصنوعی
              </p>
            </div>
          </div>

          {/* Quick Language Switcher Pills */}
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700">
            {(['en', 'de', 'fr', 'es'] as TargetLanguageCode[]).map((langCode) => {
              const info = SUPPORTED_LANGUAGES[langCode];
              const isSelected = user.targetLanguage === langCode;
              return (
                <button
                  key={langCode}
                  onClick={() => {
                    setTargetLanguage(langCode);
                    setSelectedLesson(null);
                    audioService.playClickSound();
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-indigo-200 dark:border-indigo-800'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{info.flag}</span>
                  <span className="hidden sm:inline">{info.nameFa}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level Filters & Search */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setSelectedLevel(lvl);
                  audioService.playClickSound();
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedLevel === lvl
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {lvl === 'ALL' ? 'همه سطوح' : `سطح ${lvl}`}
              </button>
            ))}
          </div>

          {/* Search Box & Mock Exam Quick Action */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px] justify-end">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در مباحث گرامری..."
                className="w-full pl-3 pr-9 py-1.5 text-xs bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-slate-100"
              />
            </div>

            <button
              onClick={() => {
                audioService.playClickSound();
                setIsMockExamOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs shrink-0 transition-all active:scale-95"
              title="آزمون آزمایشی شبیه‌ساز تصادفی از گرامر و لغات"
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">آزمون Mock Exam</span>
              <span className="sm:hidden">Mock</span>
            </button>
          </div>
        </div>
      </div>


      {/* Main Content Area */}
      {!selectedLesson ? (
        /* LESSONS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map((lesson, idx) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleOpenLesson(lesson)}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
                    سطح {lesson.level}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                    {lesson.categoryFa}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {lesson.titleFa}
                </h3>
                <p className="text-xs text-gray-400 font-latin mt-0.5">{lesson.titleNative}</p>

                <p className="text-xs text-gray-600 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                  {lesson.summaryFa}
                </p>

                {lesson.formula && (
                  <div className="mt-3 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 text-[11px] font-latin font-semibold text-indigo-900 dark:text-indigo-200">
                    📐 {lesson.formula}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  آموزش + تحلیل هوش مصنوعی
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                  مطالعه درسنامه
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </span>
              </div>
            </motion.div>
          ))}

          {filteredLessons.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6">
              <BookOpen className="w-10 h-10 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-bold text-gray-700 dark:text-slate-300">
                هیچ مبحث گرامری با فیلتر انتخابی پیدا نشد.
              </p>
              <button
                onClick={() => {
                  setSelectedLevel('ALL');
                  setSearchQuery('');
                }}
                className="mt-3 px-4 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-bold"
              >
                نمایش همه مباحث
              </button>
            </div>
          )}
        </div>
      ) : (
        /* SINGLE LESSON DEEP VIEW */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs"
        >
          {/* Top Bar of Active Lesson */}
          <div className="p-4 sm:p-5 bg-gray-50/80 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setSelectedLesson(null)}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ArrowRight className="w-4 h-4" />
              بازگشت به فهرست گرامر
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold text-xs">
                سطح {selectedLesson.level}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400">{selectedLesson.categoryFa}</span>
            </div>
          </div>

          {/* Lesson Header Title */}
          <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-800">
            <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-slate-100">
              {selectedLesson.titleFa}
            </h2>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-latin font-medium mt-1">
              {selectedLesson.titleNative}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mt-3 leading-relaxed">
              {selectedLesson.summaryFa}
            </p>

            {selectedLesson.formula && (
              <div className="mt-4 p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center gap-2 text-xs font-latin text-indigo-900 dark:text-indigo-200">
                <span className="font-bold shrink-0">فرمول طلایی:</span>
                <code className="font-bold">{selectedLesson.formula}</code>
              </div>
            )}

            {/* Sub-Tabs: Guide, AI Sentence Analyzer, Ask AI Coach, Interactive Quiz */}
            <div className="flex items-center gap-1.5 mt-5 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setLessonSubTab('guide')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  lessonSubTab === 'guide'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                درسنامه و قواعد
              </button>
              <button
                onClick={() => setLessonSubTab('ai_analyzer')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  lessonSubTab === 'ai_analyzer'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                تحلیل زنده جمله با AI
              </button>
              <button
                onClick={() => setLessonSubTab('ai_ask')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  lessonSubTab === 'ai_ask'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                پرسش از معلم هوش مصنوعی
              </button>
              <button
                onClick={() => setLessonSubTab('quiz')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  lessonSubTab === 'quiz'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                کوییز و آزمون تسلط
              </button>
            </div>
          </div>

          {/* SUB-TAB 1: LESSON GUIDE */}
          {lessonSubTab === 'guide' && (
            <div className="p-5 sm:p-6 space-y-6">
              {/* Detailed Markdown / HTML text */}
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-gray-700 dark:text-slate-200 leading-relaxed space-y-3 whitespace-pre-line">
                {selectedLesson.contentMarkdownFa}
              </div>

              {/* Specific Rules and Examples */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  قواعد تفصیلی و مثال‌های کاربردی
                </h4>

                {selectedLesson.rules.map((rule, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 space-y-3"
                  >
                    <h5 className="text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-300">
                      {rule.ruleTitleFa}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                      {rule.explanationFa}
                    </p>

                    {/* Rule Examples */}
                    <div className="space-y-2 mt-2">
                      {rule.examples.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700/80 gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-latin font-bold text-gray-900 dark:text-slate-100">
                                {ex.target}
                              </span>
                              {ex.phonetic && (
                                <span className="text-[11px] text-gray-400 font-latin">{ex.phonetic}</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{ex.fa}</p>
                          </div>
                          <button
                            onClick={() => audioService.speak(ex.target, user.targetLanguage, user.settings.ttsSpeed)}
                            className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 shrink-0"
                            title="پخش تلفظ صوتی"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Common Mistakes */}
                    {rule.commonMistakesFa && rule.commonMistakesFa.length > 0 && (
                      <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>راهنمای اجتناب از اشتباهات رایج زبان‌آموزان:</span>
                        </div>
                        {rule.commonMistakesFa.map((cm, cmIdx) => (
                          <div key={cmIdx} className="text-gray-700 dark:text-slate-300 mt-1">
                            <span className="text-rose-600 line-through mr-1 font-latin">{cm.wrong}</span>
                            <span className="text-emerald-600 font-bold font-latin ml-2">✓ {cm.correct}</span>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">علت: {cm.reasonFa}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Master / Complete this Grammar Lesson Gamification Card */}
              <div className="mt-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-200 dark:shadow-none">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                      ثبت تسلط و دریافت پاداش گرامر
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      مطالعه این مبحث را تکمیل کرده‌اید؟ ثبت کنید تا +۲۵ امتیاز و +۵ جم دریافت نمایید.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    audioService.playClickSound();
                    markGrammarLessonMastered(selectedLesson.id, selectedLesson.titleFa);
                  }}
                  className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 ${
                    user.completedLessonIds.includes(`grammar_${selectedLesson.id}`)
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {user.completedLessonIds.includes(`grammar_${selectedLesson.id}`)
                      ? 'مبحث تسلط یافته ✓ (تکرار پاداش)'
                      : 'تکمیل مبحث و دریافت پاداش'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: AI REAL-TIME SENTENCE ANALYZER */}
          {lessonSubTab === 'ai_analyzer' && (
            <div className="p-5 sm:p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  آزمایشگاه زنده نگارش و تحلیل گرامر:
                </p>
                <p className="mt-1 text-gray-600 dark:text-slate-300">
                  یک جمله دلخواه به زبان {currentLang.nameFa} بنویسید که در آن قاعده «{selectedLesson.titleFa}» را به کار برده‌اید. هوش مصنوعی Gemini تطابق فعل و فاعل، ترتیب ارکان، حروف اضافه و ساختار شما را تحلیل می‌کند.
                </p>
              </div>

              {/* Input Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                  جمله شما به زبان {currentLang.nameFa}:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userSentence}
                    onChange={(e) => setUserSentence(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeSentence()}
                    placeholder={`مثال: یک جمله کامل به زبان ${currentLang.nameFa} بنویسید...`}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm font-latin focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-slate-100"
                  />
                  <button
                    onClick={handleAnalyzeSentence}
                    disabled={!userSentence.trim() || isAnalyzing}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        در حال تحلیل...
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        تحلیل جمله
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Analysis Result Card */}
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-3xl bg-gray-50 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {analysisResult.isCorrect ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                          <Check className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h5 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                          {analysisResult.isCorrect ? 'آفرین! گرامر کاملاً صحیح است' : 'نیاز به بهبود و تصحیح'}
                        </h5>
                        <p className="text-xs text-gray-500">امتیاز ساختاری: {analysisResult.score} از ۱۰۰</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-100 dark:border-slate-800">
                    {analysisResult.overallFeedbackFa}
                  </p>

                  {/* Corrections if any */}
                  {analysisResult.corrections && analysisResult.corrections.length > 0 && (
                    <div className="space-y-2">
                      <h6 className="text-xs font-bold text-rose-600 dark:text-rose-400">تصحیح بخش‌های خطادار:</h6>
                      {analysisResult.corrections.map((corr, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs"
                        >
                          <div className="flex items-center gap-2 font-latin">
                            <span className="line-through text-rose-500">{corr.original}</span>
                            <span>→</span>
                            <span className="font-bold text-emerald-600">{corr.corrected}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 dark:text-slate-300 mt-1">{corr.ruleReasonFa}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Improved Sentence */}
                  {analysisResult.improvedSentence && (
                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-indigo-900 dark:text-indigo-200">شکل استاندارد و بهینه جمله:</span>
                        <button
                          onClick={() =>
                            audioService.speak(
                              analysisResult.improvedSentence!,
                              user.targetLanguage,
                              user.settings.ttsSpeed
                            )
                          }
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-latin font-bold text-gray-900 dark:text-slate-100 mt-1 text-sm">
                        {analysisResult.improvedSentence}
                      </p>
                      {analysisResult.improvedSentenceFa && (
                        <p className="text-gray-500 dark:text-slate-400 mt-0.5 text-xs">
                          {analysisResult.improvedSentenceFa}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* SUB-TAB 3: ASK AI COACH ABOUT THIS RULE */}
          {lessonSubTab === 'ai_ask' && (
            <div className="p-5 sm:p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200">
                <p className="font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  اتاق گفتگو با معلم گرامر:
                </p>
                <p className="mt-1 text-gray-600 dark:text-slate-300">
                  هر ابهام یا سوالی درباره این قاعده گرامری دارید به فارسی یا زبان مقصد بپرسید تا با مثال‌های ملموس و شیوای آموزشی پاسخ بگیرید.
                </p>
              </div>

              {/* Suggested Questions */}
              {selectedLesson.aiDiscussionPrompts && selectedLesson.aiDiscussionPrompts.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400">سوالات پیشنهادی:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLesson.aiDiscussionPrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleAskAiCoach(prompt)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-xs text-gray-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 text-right transition-colors"
                      >
                        ❓ {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAiCoach()}
                  placeholder="سوال خود را تایپ کنید..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-slate-100"
                />
                <button
                  onClick={() => handleAskAiCoach()}
                  disabled={!aiQuestion.trim() || isAskingAi}
                  className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1 shrink-0"
                >
                  {isAskingAi ? 'در حال پاسخ...' : 'ارسال سوال'}
                </button>
              </div>

              {/* AI Coach Answer Card */}
              {aiAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-3xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-4"
                >
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                    <Brain className="w-5 h-5" />
                    <span>پاسخ معلم هوشمند:</span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {aiAnswer.answerFa}
                  </p>

                  {/* Examples from AI */}
                  {aiAnswer.examples && aiAnswer.examples.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-gray-500">مثال‌های تکمیلی:</span>
                      {aiAnswer.examples.map((ex: any, eIdx: number) => (
                        <div
                          key={eIdx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-xs"
                        >
                          <div>
                            <span className="font-latin font-bold text-gray-900 dark:text-slate-100">{ex.target}</span>
                            <p className="text-gray-500 text-[11px] mt-0.5">{ex.translationFa}</p>
                          </div>
                          <button
                            onClick={() => audioService.speak(ex.target, user.targetLanguage, user.settings.ttsSpeed)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* SUB-TAB 4: INTERACTIVE QUIZ & MASTERY */}
          {lessonSubTab === 'quiz' && (
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    کوییز تسلط بر مبحث ({currentQuizIndex + 1} از {activeQuizzes.length})
                  </h4>
                  <p className="text-xs text-gray-500">پاسخ دهید تا امتیاز و جم تسلط این درس را کسب کنید.</p>
                </div>

                <button
                  onClick={handleGenerateAiQuiz}
                  disabled={isGeneratingQuiz}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGeneratingQuiz ? 'تولید کوییز هوشمند...' : 'تولید سوال جدید با AI'}
                </button>
              </div>

              {currentQuiz && (
                <div className="p-5 rounded-3xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-4">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {currentQuiz.questionFa}
                  </p>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-center">
                    <p className="text-base sm:text-lg font-latin font-bold text-gray-900 dark:text-slate-100">
                      {currentQuiz.promptTarget}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentQuiz.options.map((option: string, oIdx: number) => {
                      const isSelected = selectedQuizOption === option;
                      const isCorrect = option === currentQuiz.correctAnswer;

                      let btnStyle =
                        'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 hover:border-indigo-400';
                      if (isQuizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-500 text-white border-emerald-600';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-500 text-white border-rose-600';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-700 dark:text-indigo-300';
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => {
                            if (!isQuizSubmitted) {
                              setSelectedQuizOption(option);
                              audioService.playClickSound();
                            }
                          }}
                          className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-latin font-bold text-center transition-all ${btnStyle}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action & Explanation */}
                  <div className="pt-3 border-t border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {!isQuizSubmitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={!selectedQuizOption}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs"
                      >
                        ثبت و بررسی پاسخ
                      </button>
                    ) : (
                      <div className="w-full space-y-3">
                        <div
                          className={`p-3 rounded-2xl text-xs ${
                            selectedQuizOption === currentQuiz.correctAnswer
                              ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          <p className="font-bold">
                            {selectedQuizOption === currentQuiz.correctAnswer ? '✓ کاملاً درست بود!' : '✗ اشتباه بود'}
                          </p>
                          <p className="mt-1 leading-relaxed">{currentQuiz.explanationFa}</p>
                        </div>

                        <button
                          onClick={handleNextQuiz}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
                        >
                          {currentQuizIndex < activeQuizzes.length - 1 ? (
                            <>
                              سوال بعدی
                              <ArrowRight className="w-4 h-4 rotate-180" />
                            </>
                          ) : (
                            <>
                              <Award className="w-4 h-4" />
                              تکمیل کوییز درسنامه
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Dynamic Mock Exam Generator Modal */}
      <MockExamModal
        isOpen={isMockExamOpen}
        onClose={() => setIsMockExamOpen(false)}
      />
    </div>
  );
};

