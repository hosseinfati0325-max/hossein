import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Award,
  Timer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  Brain,
  RotateCcw,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Target,
  BookOpen,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lightbulb,
  Check,
  AlertTriangle,
  Play,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  MockExamSession,
  MockExamQuestion,
  MockExamAIBreakdown,
  MockExamCategoryScore,
} from '../../types';
import { mockExamService } from '../../services/mockExamService';
import { audioService } from '../../services/audioService';

interface MockExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MockExamModal: React.FC<MockExamModalProps> = ({ isOpen, onClose }) => {
  const { user, addXP, addGems, triggerCelebration, showCelebrationModal, recordExamResult } = useApp();

  // Session Lifecycle: 'setup' | 'running' | 'evaluating' | 'breakdown'
  const [stage, setStage] = useState<'setup' | 'running' | 'evaluating' | 'breakdown'>('setup');
  const [questionCountChoice, setQuestionCountChoice] = useState<number>(10);
  const [session, setSession] = useState<MockExamSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<MockExamAIBreakdown | null>(null);

  // Audio playing helper
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Timer Effect
  useEffect(() => {
    let timer: any = null;
    if (stage === 'running') {
      timer = setInterval(() => {
        setTimeSpent((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [stage]);

  if (!isOpen) return null;

  // Format Time MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Generate & Launch Exam
  const handleStartMockExam = () => {
    audioService.playClickSound();
    const newSession = mockExamService.generateMockExam(user, questionCountChoice);
    setSession(newSession);
    setCurrentIdx(0);
    setUserAnswers({});
    setTimeSpent(0);
    setBreakdown(null);
    setStage('running');
  };

  // Current Question
  const currentQ: MockExamQuestion | undefined = session?.questions[currentIdx];

  // Select Option
  const handleSelectOption = (option: string) => {
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option,
    }));
    audioService.playClickSound();
  };

  // Audio speech
  const handleSpeak = (text?: string) => {
    if (!text) return;
    setIsPlayingAudio(true);
    audioService.speak(text, user.targetLanguage);
    setTimeout(() => setIsPlayingAudio(false), 2000);
  };

  // Next / Previous Question Navigation
  const handleNextQuestion = () => {
    if (!session) return;
    audioService.playClickSound();
    if (currentIdx + 1 < session.questions.length) {
      setCurrentIdx((i) => i + 1);
    } else {
      handleFinishExam();
    }
  };

  const handlePrevQuestion = () => {
    audioService.playClickSound();
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
    }
  };

  // Detailed Exam Score & Category Performance Overview
  const statsOverview = useMemo(() => {
    if (!session) return null;
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    let grammarTotal = 0;
    let grammarCorrect = 0;
    let vocabTotal = 0;
    let vocabCorrect = 0;

    session.questions.forEach((q) => {
      const ans = userAnswers[q.id];
      const isCorrect = ans === q.correctAnswer;
      if (!ans) {
        unanswered += 1;
      } else if (isCorrect) {
        correct += 1;
      } else {
        wrong += 1;
      }

      if (q.sourceType === 'grammar') {
        grammarTotal += 1;
        if (isCorrect) grammarCorrect += 1;
      } else {
        vocabTotal += 1;
        if (isCorrect) vocabCorrect += 1;
      }
    });

    const grammarPct = grammarTotal > 0 ? Math.round((grammarCorrect / grammarTotal) * 100) : 100;
    const vocabPct = vocabTotal > 0 ? Math.round((vocabCorrect / vocabTotal) * 100) : 100;

    return {
      correct,
      wrong,
      unanswered,
      total: session.questions.length,
      grammarTotal,
      grammarCorrect,
      grammarPct,
      vocabTotal,
      vocabCorrect,
      vocabPct,
    };
  }, [session, userAnswers]);

  // Finish & Evaluate via AI Tutor
  const handleFinishExam = async () => {
    if (!session) return;
    audioService.playSuccessSound();
    setStage('evaluating');

    try {
      const resultBreakdown = await mockExamService.evaluateMockExam(
        session,
        userAnswers,
        timeSpent,
        user
      );

      setBreakdown(resultBreakdown);

      // Reward user with XP & Gems
      const xpGained = Math.round(resultBreakdown.overallScorePercent * 1.2) + 35;
      const gemsGained = resultBreakdown.overallScorePercent >= 80 ? 15 : 6;
      addXP(xpGained);
      addGems(gemsGained);

      // Record exam result in user history
      recordExamResult(
        'mock_dynamic_exam',
        'شبیه‌ساز تصادفی مهارتی گرامر و لغات',
        `سطح ${user.currentLevel} • هوش مصنوعی`,
        user.currentLevel,
        resultBreakdown.overallScorePercent,
        Math.round((resultBreakdown.overallScorePercent / 100) * session.questions.length),
        session.questions.length,
        resultBreakdown.estimatedBandScore
      );

      triggerCelebration(resultBreakdown.overallScorePercent >= 70 ? 'exam' : 'lesson');
      setStage('breakdown');
    } catch (e) {
      console.error('Evaluation error:', e);
      setStage('breakdown');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden text-gray-900 dark:text-slate-100"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                  <span>شبیه‌ساز هوشمند Mock Exam</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-latin">
                    AI Diagnostic
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  تولید آزمون تصادفی از ماژول‌های گرامر، لغات و لایتنر با تحلیل نقاط قوت و ضعف
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content per Stage */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* 1. SETUP STAGE */}
            {stage === 'setup' && (
              <div className="space-y-5 py-2">
                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-lg space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-bold text-indigo-100 bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs">
                      سنجش ترکیبی و تطبیقی
                    </span>
                    <Sparkles className="w-6 h-6 text-indigo-200 animate-pulse" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-base sm:text-lg font-black">
                      آزمون شبیه‌ساز تصادفی مهارتی (Mock Exam)
                    </h4>
                    <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed mt-1">
                      این آزمون هوشمند به صورت کاملاً تصادفی از میان درس‌های گرامر تکمیل‌شده، واژگان موضوعی ۵۲ هفته و کارت‌های لایتنر شما سوال طرح می‌کند و در پایان، نقاط قوت، ضعف و برنامه مطالعاتی اختصاصی توسط هوش مصنوعی در اختیارتان قرار می‌دهد.
                    </p>
                  </div>
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                </div>

                {/* Question count selector */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-gray-700 dark:text-slate-300">
                    تعداد سوالات آزمون را مشخص فرمایید:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[5, 10, 15].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => {
                          audioService.playClickSound();
                          setQuestionCountChoice(cnt);
                        }}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          questionCountChoice === cnt
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold shadow-sm'
                            : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 text-gray-600 dark:text-slate-400 font-medium'
                        }`}
                      >
                        <div className="text-base font-black font-latin">{cnt} سوال</div>
                        <div className="text-[11px] opacity-75 mt-0.5">
                          {cnt === 5 ? 'سریع (۳ دقیقه)' : cnt === 10 ? 'استاندارد (۶ دقیقه)' : 'جامع (۱۰ دقیقه)'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sources Included Card */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-2.5">
                  <h5 className="text-xs font-extrabold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>منابع استخراج تصادفی سوالات:</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-600 dark:text-slate-300">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>ماژول‌های گرامر ({user.targetLanguage.toUpperCase()})</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                      <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>واژگان ۵۲ هفته موضوعی</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                      <Brain className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>کارت‌های لایتنر و دروس</span>
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={handleStartMockExam}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>تولید و شروع آزمون شبیه‌ساز تصادفی</span>
                </button>
              </div>
            )}

            {/* 2. RUNNING EXAM STAGE */}
            {stage === 'running' && currentQ && session && (
              <div className="space-y-5">
                {/* Progress & Timer Bar */}
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold font-latin">
                      سوال {currentIdx + 1} از {session.questions.length}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-latin">
                      {currentQ.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                    <Timer className="w-3.5 h-3.5" />
                    <span className="font-latin font-extrabold">{formatTime(timeSpent)}</span>
                  </div>
                </div>

                {/* Progress Bar Line */}
                <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentIdx + 1) / session.questions.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Question Card */}
                <div className="p-5 rounded-3xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 space-y-4">
                  {/* Category Tag */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {currentQ.topicCategoryFa}
                    </span>

                    {currentQ.targetAudioText && (
                      <button
                        onClick={() => handleSpeak(currentQ.targetAudioText)}
                        className={`p-2 rounded-xl text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs hover:scale-105 active:scale-95 transition-all ${
                          isPlayingAudio ? 'animate-pulse text-indigo-700' : ''
                        }`}
                        title="پخش تلفظ صوتی"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Question Prompt */}
                  <div className="space-y-1.5">
                    <h4 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-slate-100 leading-relaxed">
                      {currentQ.promptFa}
                    </h4>
                    {currentQ.promptTarget && (
                      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-latin direction-ltr text-left">
                        {currentQ.promptTarget}
                      </p>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2.5 pt-2">
                    {currentQ.options.map((option, oIdx) => {
                      const isSelected = userAnswers[currentQ.id] === option;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(option)}
                          className={`p-3.5 sm:p-4 rounded-2xl text-right sm:text-right border transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md shadow-indigo-200 dark:shadow-none'
                              : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-700'
                          }`}
                        >
                          <span className="text-xs sm:text-sm font-medium font-latin">
                            {option}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-white text-indigo-600 border-white'
                                : 'border-gray-300 dark:border-slate-700'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Nav Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentIdx === 0}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 text-xs font-bold disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>سوال قبلی</span>
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    disabled={!userAnswers[currentQ.id]}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-indigo-200 dark:shadow-none flex items-center gap-1.5"
                  >
                    <span>
                      {currentIdx + 1 === session.questions.length ? 'پایان و تحلیل هوشمند' : 'سوال بعدی'}
                    </span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. EVALUATING STAGE */}
            {stage === 'evaluating' && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-indigo-200 dark:border-indigo-950 border-t-indigo-600 animate-spin flex items-center justify-center"></div>
                  <Brain className="w-8 h-8 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-gray-900 dark:text-slate-100">
                    هوش مصنوعی در حال تحلیل جامع عملکرد شماست...
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm">
                    استخراج نمره معادل CEFR، تفکیک نقاط قوت و ضعف گرامری و واژگانی و تدوین نقشه راه مطالعاتی
                  </p>
                </div>
              </div>
            )}

            {/* 4. BREAKDOWN DIAGNOSTIC REPORT STAGE */}
            {stage === 'breakdown' && breakdown && session && (
              <div className="space-y-5">
                {/* Score & Band Header Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-bold text-indigo-100 bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      کارنامه تحلیلی هوش مصنوعی
                    </span>
                    <span className="text-xs font-bold font-latin bg-black/20 px-2.5 py-1 rounded-lg">
                      ⏱ {formatTime(timeSpent)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 relative z-10">
                    <div>
                      <div className="text-3xl sm:text-4xl font-black font-latin">
                        {breakdown.overallScorePercent}٪
                      </div>
                      <div className="text-xs text-indigo-100 mt-1 font-bold">
                        نمره معادل: <span className="font-latin underline">{breakdown.estimatedBandScore}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-indigo-200">سطح عملکردی</div>
                      <div className="text-xl font-extrabold font-latin text-amber-300">
                        {breakdown.proficiencyLevel}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-indigo-100/90 leading-relaxed pt-2 border-t border-white/20 relative z-10">
                    {breakdown.summaryFa}
                  </p>
                  <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                </div>

                {/* 4-Box Quick Diagnostic Summary (Correct, Wrong, Unanswered, Percentage) */}
                {statsOverview && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center">
                        <div className="text-lg sm:text-xl font-black font-latin text-emerald-600 dark:text-emerald-400">
                          {statsOverview.correct}
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                          درست
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center">
                        <div className="text-lg sm:text-xl font-black font-latin text-rose-600 dark:text-rose-400">
                          {statsOverview.wrong}
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-rose-800 dark:text-rose-300">
                          غلط
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
                        <div className="text-lg sm:text-xl font-black font-latin text-amber-600 dark:text-amber-400">
                          {statsOverview.unanswered}
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-amber-800 dark:text-amber-300">
                          بدون پاسخ
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-center">
                        <div className="text-lg sm:text-xl font-black font-latin text-indigo-600 dark:text-indigo-400">
                          {breakdown.overallScorePercent}٪
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-indigo-800 dark:text-indigo-300">
                          درصد کل
                        </div>
                      </div>
                    </div>

                    {/* Grammar vs Vocabulary Performance Split */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Grammar Performance */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-gray-800 dark:text-slate-200 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>عملکرد گرامر (Grammar):</span>
                          </span>
                          <span className="font-latin font-bold text-indigo-600 dark:text-indigo-400">
                            {statsOverview.grammarCorrect} از {statsOverview.grammarTotal} ({statsOverview.grammarPct}٪)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              statsOverview.grammarPct >= 75
                                ? 'bg-emerald-500'
                                : statsOverview.grammarPct >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${statsOverview.grammarPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Vocabulary Performance */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-gray-800 dark:text-slate-200 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>عملکرد واژگان (Vocabulary):</span>
                          </span>
                          <span className="font-latin font-bold text-amber-600 dark:text-amber-400">
                            {statsOverview.vocabCorrect} از {statsOverview.vocabTotal} ({statsOverview.vocabPct}٪)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              statsOverview.vocabPct >= 75
                                ? 'bg-emerald-500'
                                : statsOverview.vocabPct >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${statsOverview.vocabPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses 2-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Strengths */}
                  <div className="p-4 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-2.5">
                    <h5 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>نقاط قوت و تسلط‌ها (Strengths):</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
                      {breakdown.strengthsFa.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-4 rounded-3xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2.5">
                    <h5 className="text-xs font-extrabold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>نقاط نیازمند تمرین (Weaknesses):</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-rose-900 dark:text-rose-200">
                      {breakdown.weaknessesFa.map((wk, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{wk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Category Breakdown Progress */}
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs">
                  <h5 className="text-xs font-extrabold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>تفکیک درصدی عملکرد در مباحث آزمون:</span>
                  </h5>

                  <div className="space-y-2.5">
                    {breakdown.categoryScores.map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-700 dark:text-slate-300">
                            {cat.categoryFa}
                          </span>
                          <span
                            className={`font-latin font-extrabold ${
                              cat.percentage >= 80
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : cat.percentage >= 60
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {cat.correct} از {cat.total} ({cat.percentage}٪)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              cat.percentage >= 80
                                ? 'bg-emerald-500'
                                : cat.percentage >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable AI Study Plan */}
                <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800 space-y-2.5">
                  <h5 className="text-xs font-extrabold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>برنامه مطالعاتی پیشنهادی معلم هوش مصنوعی:</span>
                  </h5>
                  <div className="space-y-1.5 text-xs text-purple-950 dark:text-purple-200">
                    {breakdown.actionableStudyPlanFa.map((plan, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{plan}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motivational Quote */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-center text-xs text-gray-600 dark:text-slate-300 font-medium italic">
                  «{breakdown.motivationalMessageFa}»
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleStartMockExam}
                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>آزمون مجدد با سوالات جدید</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-indigo-200 dark:shadow-none"
                  >
                    <Check className="w-4 h-4" />
                    <span>تأیید و ذخیره کارنامه</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
