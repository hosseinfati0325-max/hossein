import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Award,
  GraduationCap,
  Timer,
  BarChart3,
  Flame,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  Brain,
  Mic,
  Headphones,
  BookOpen,
  Bot,
  Swords,
  Sparkles,
  Volume2,
  X,
  Check,
  AlertCircle,
  Gem,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INTERNATIONAL_EXAMS } from '../../data/curriculumData';
import { AI_RIVALS, AI_BATTLE_QUESTIONS, BattleQuestion } from '../../data/aiRivalsData';
import { InternationalExam, LeagueCompetitor, AIRival } from '../../types';
import { LessonRunnerModal } from '../LessonRunner/LessonRunnerModal';
import { ExamSimulatorModal } from './ExamSimulatorModal';
import { MockExamModal } from './MockExamModal';
import { audioService } from '../../services/audioService';
import { ProgressCharts } from './ProgressCharts';

interface ExamsAndLeagueViewProps {
  onOpenPlacementTest: () => void;
}

export const ExamsAndLeagueView: React.FC<ExamsAndLeagueViewProps> = ({ onOpenPlacementTest }) => {
  const {
    user,
    profiles,
    realCapacity,
    setIsCapacityModalOpen,
    recordAiBattle,
    triggerCelebration,
    showCelebrationModal,
  } = useApp();
  const [subTab, setSubTab] = useState<'exams' | 'ai_rivals' | 'league' | 'stats'>('exams');
  const [activeExam, setActiveExam] = useState<InternationalExam | null>(null);
  const [isMockExamOpen, setIsMockExamOpen] = useState(false);

  // AI Battle State
  const [selectedRival, setSelectedRival] = useState<AIRival | null>(null);
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [battleIndex, setBattleIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [aiSelectedAnswer, setAiSelectedAnswer] = useState<string | null>(null);
  const [battleAnswerState, setBattleAnswerState] = useState<'idle' | 'answered' | 'finished'>('idle');
  const [battleTimer, setBattleTimer] = useState(15);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  // Real Registered Learners + AI Benchmarks Competitors
  const registeredCompetitors: LeagueCompetitor[] = profiles.map((p) => {
    const isCurrentUser = p.id === user.id;
    const nameDisplay = isCurrentUser
      ? `${p.firstName ? `${p.firstName} ${p.lastName}` : p.name} (شما)`
      : p.firstName ? `${p.firstName} ${p.lastName}` : p.name;

    return {
      id: p.id,
      name: nameDisplay,
      avatar: p.avatar || '🦁',
      xp: isCurrentUser ? user.leagueXp : p.leagueXp || p.xp || 120,
      streak: isCurrentUser ? user.streak : p.streak || 1,
      isUser: isCurrentUser,
      targetLang: p.targetLanguage || 'en',
    };
  });

  // AI Benchmarks to enrich competition
  const aiBenchmarks: LeagueCompetitor[] = [
    {
      id: 'ai_alex',
      name: 'Alex AI (رقیب هوشمند)',
      avatar: '🤖',
      xp: Math.max(150, user.leagueXp + 25),
      streak: 14,
      isAi: true,
      targetLang: 'en',
    },
    {
      id: 'ai_sophia',
      name: 'Sophia AI (معلم هوشمند)',
      avatar: '🦾',
      xp: Math.max(90, Math.floor(user.leagueXp * 0.85)),
      streak: 9,
      isAi: true,
      targetLang: 'de',
    },
  ];

  const competitors: LeagueCompetitor[] = [...registeredCompetitors, ...aiBenchmarks].sort(
    (a, b) => b.xp - a.xp,
  );

  const userRank = competitors.findIndex((c) => c.isUser) + 1;

  const handleStartExam = (exam: InternationalExam) => {
    audioService.playClickSound();
    setActiveExam(exam);
  };

  // Start AI Battle
  const handleStartBattle = (rival: AIRival) => {
    audioService.playClickSound();
    setSelectedRival(rival);
    setIsBattleActive(true);
    setBattleIndex(0);
    setUserScore(0);
    setAiScore(0);
    setSelectedAnswer(null);
    setAiSelectedAnswer(null);
    setBattleAnswerState('idle');
    setBattleTimer(15);
    setBattleLog([`مسابقه زنده با ${rival.nameFa} آغاز شد!`]);
  };

  // Battle timer countdown
  useEffect(() => {
    if (!isBattleActive || battleAnswerState !== 'idle') return;
    if (battleTimer <= 0) {
      handleAnswerQuestion(''); // time out
      return;
    }
    const timer = setInterval(() => {
      setBattleTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isBattleActive, battleAnswerState, battleTimer]);

  // Current battle question
  const currentQ: BattleQuestion | undefined = AI_BATTLE_QUESTIONS[battleIndex];

  const handleAnswerQuestion = (ans: string) => {
    if (!currentQ || !selectedRival || battleAnswerState !== 'idle') return;
    setSelectedAnswer(ans);
    setBattleAnswerState('answered');

    const isUserCorrect = ans === currentQ.correctAnswer;
    if (isUserCorrect) {
      audioService.playCorrectSound();
      setUserScore((s) => s + 10);
    } else {
      audioService.playWrongSound();
    }

    // Determine AI response based on accuracy rate
    const aiWillBeCorrect = Math.random() < selectedRival.accuracy;
    const aiAns = aiWillBeCorrect
      ? currentQ.correctAnswer
      : currentQ.options.find((o) => o !== currentQ.correctAnswer) || currentQ.correctAnswer;

    setAiSelectedAnswer(aiAns);
    if (aiWillBeCorrect) {
      setAiScore((s) => s + 10);
    }

    if (currentQ.targetAudioText) {
      audioService.speak(currentQ.targetAudioText, user.targetLanguage);
    }
  };

  const handleNextBattleQuestion = () => {
    audioService.playClickSound();
    if (battleIndex + 1 < AI_BATTLE_QUESTIONS.length) {
      setBattleIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAiSelectedAnswer(null);
      setBattleAnswerState('idle');
      setBattleTimer(15);
    } else {
      setBattleAnswerState('finished');
      const won = userScore >= aiScore;
      const xpWon = won ? (selectedRival?.xpReward || 45) : 10;
      const gemsWon = won ? (selectedRival?.gemReward || 6) : 1;
      recordAiBattle(won, xpWon, gemsWon);
      if (won) {
        audioService.playFanfareSound();
        showCelebrationModal({
          title: 'پیروزی چشمگیر در دوئل!',
          subtitle: `شما موفق شدید در مسابقه رقابتی، حریف هوشمند «${selectedRival?.nameFa || 'رقیب'}» را با امتیاز ${userScore} به ${aiScore} مغلوب کنید!`,
          xpReward: xpWon,
          gemReward: gemsWon,
          scorePercent: Math.round((userScore / (AI_BATTLE_QUESTIONS.length * 10)) * 100),
          category: 'duel',
        });
      }
    }
  };

  return (
    <div className="pb-32 sm:pb-36 max-w-2xl w-full mx-auto px-3 sm:px-4 pt-3 sm:pt-5 space-y-5 select-none">
      {/* Sub Tabs Navigation */}
      <div className="grid grid-cols-4 gap-1 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs font-bold">
        <button
          onClick={() => {
            setSubTab('exams');
            audioService.playClickSound();
          }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
            subTab === 'exams'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-gray-200 dark:border-slate-800'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>آزمون‌ها</span>
        </button>

        <button
          onClick={() => {
            setSubTab('ai_rivals');
            audioService.playClickSound();
          }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
            subTab === 'ai_rivals'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs border border-gray-200 dark:border-slate-800'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>دوئل هوش مصنوعی</span>
        </button>

        <button
          onClick={() => {
            setSubTab('league');
            audioService.playClickSound();
          }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
            subTab === 'league'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-gray-200 dark:border-slate-800'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>لیگ هفتگی</span>
        </button>

        <button
          onClick={() => {
            setSubTab('stats');
            audioService.playClickSound();
          }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
            subTab === 'stats'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-gray-200 dark:border-slate-800'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>روند پیشرفت</span>
        </button>
      </div>

      {/* Tab 1: Exams Hub */}
      {subTab === 'exams' && (
        <div className="space-y-4">
          {/* Weekly Progress & Multi-Language Mastery Shortcut Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/60 dark:via-purple-950/40 dark:to-pink-950/40 border border-indigo-200 dark:border-indigo-800 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200 dark:shadow-none">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>نمودار پیشرفت هفتگی تسلط زبان‌ها</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold">
                    Recharts
                  </span>
                </h4>
                <p className="text-[11px] text-gray-600 dark:text-slate-300 mt-0.5">
                  مشاهده رشد هفتگی در ۸ زبان زنده دنیا و مهارت‌های ۴‌گانه
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                audioService.playClickSound();
                setSubTab('stats');
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 active:scale-95 transition-all shadow-sm"
            >
              مشاهده نمودار
            </button>
          </div>

          {/* Placement Test Big Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[11px] font-bold text-indigo-100 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-xs">
                سنجش استاندارد CEFR (A1 تا C2)
              </span>
              <Compass className="w-6 h-6 text-indigo-200" />
            </div>

            <div className="relative z-10">
              <h3 className="text-base font-extrabold text-white">آزمون تعیین سطح جامع هوشمند</h3>
              <p className="text-xs text-indigo-100/90 mt-1 leading-relaxed">
                ارزیابی ۴ مهارتی (گرامر، لغات، شنیداری، ترجمه فارسی به مقصد و درک مطلب) با سطح‌بندی دقیق.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/20 relative z-10">
              <span className="text-xs text-indigo-100 font-latin">⏱ ۵ الی ۸ دقیقه • ارزیابی هوشمند</span>
              <button
                onClick={onOpenPlacementTest}
                className="px-4 py-2 rounded-xl bg-white text-indigo-700 font-extrabold text-xs hover:bg-indigo-50 transition-all active:scale-95 shadow-md"
              >
                {user.placementTestDone ? 'آزمون مجدد' : 'شروع تعیین سطح'}
              </button>
            </div>
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          </div>

          {/* DYNAMIC MOCK EXAM GENERATOR (مولد آزمون آزمایشی تصادفی هوشمند) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900 text-white shadow-lg space-y-3 relative overflow-hidden border border-purple-500/30">
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[11px] font-bold text-purple-100 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                مولد شبیه‌ساز تصادفی (Mock Exam Generator)
              </span>
              <Brain className="w-6 h-6 text-purple-200" />
            </div>

            <div className="relative z-10">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>شبیه‌ساز هوشمند درس‌های گذرانده‌شده</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400 text-purple-950 font-black">
                  AI Breakdown
                </span>
              </h3>
              <p className="text-xs text-purple-100/90 mt-1 leading-relaxed">
                استخراج تصادفی سوالات از ماژول‌های گرامر تکمیل‌شده، واژگان موضوعی و لایتنر همراه با تحلیل فوری نقاط قوت و ضعف و ارائه برنامه مطالعاتی هوشمند.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/20 relative z-10">
              <span className="text-xs text-purple-200 font-latin">🎲 سوالات تطبیقی و متغیر • تحلیل فوری</span>
              <button
                onClick={() => {
                  audioService.playClickSound();
                  setIsMockExamOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs transition-all active:scale-95 shadow-md flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-purple-950" />
                <span>تولید Mock Exam</span>
              </button>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
          </div>


          {/* International Exam Simulators */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400">شبیه‌ساز آزمون‌های بین‌المللی:</h4>

            {INTERNATIONAL_EXAMS.map((exam) => (
              <div
                key={exam.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all overflow-hidden"
              >
                {exam.imageUrl && (
                  <div className="rounded-2xl overflow-hidden h-32 w-full border border-gray-100 dark:border-slate-800">
                    <img
                      src={exam.imageUrl}
                      alt={exam.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 px-2 py-0.5 rounded-md font-latin">
                      Level: {exam.level} • زبان: {exam.targetLanguage.toUpperCase()}
                    </span>
                    <h5 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 font-latin mt-1">{exam.title}</h5>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{exam.subtitleFa}</p>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <span className="font-latin">⏱ {exam.durationMinutes} Min</span>
                  <button
                    onClick={() => handleStartExam(exam)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-xs transition-all active:scale-95 shadow-xs shadow-indigo-100 dark:shadow-none"
                  >
                    شرکت در شبیه‌ساز
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: AI Rivals Battle Arena (رقیب هوش مصنوعی) */}
      {subTab === 'ai_rivals' && (
        <div className="space-y-4">
          {/* Battle Header Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[11px] font-bold text-rose-100 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" />
                میدان مبارزه سرعتی هوش مصنوعی
              </span>
              <span className="text-xs font-bold bg-black/20 px-2 py-0.5 rounded-lg">
                برد: {user.aiBattleWins || 0} | باخت: {user.aiBattleLosses || 0}
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="text-base font-extrabold text-white">دوئل زنده با رقبای هوش مصنوعی</h3>
              <p className="text-xs text-rose-100/90 mt-1 leading-relaxed">
                یک رقیب مجهز به الگوریتم هوشمند انتخاب کنید، به سوالات زبانی پاسخ دهید و مهارت خود را بسنجید!
              </p>
            </div>
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          </div>

          {/* AI Rival Cards Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AI_RIVALS.map((rival) => (
              <div
                key={rival.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs hover:border-rose-400 dark:hover:border-rose-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-2xl shadow-xs">
                      {rival.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-900 dark:text-slate-100">{rival.nameFa}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-latin">
                          {rival.level}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-slate-400 font-latin">{rival.nameEn}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {rival.descriptionFa}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-100 dark:border-slate-800">
                    <span>دقت پیش‌بینی: {Math.round(rival.accuracy * 100)}%</span>
                    <span className="font-latin font-bold text-amber-600 dark:text-amber-400">+{Math.round(rival.accuracy * 30 + 10)} XP</span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartBattle(rival)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>مبارزه با {rival.nameFa.split(' ')[0]}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Weekly League */}
      {subTab === 'league' && (
        <div className="space-y-4">
          {/* League Tier Header */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-md text-center space-y-2 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 mx-auto flex items-center justify-center text-white shadow-inner">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-extrabold text-white">لیگ بین‌المللی طلایی • هفته جاری</h3>
            <p className="text-xs text-amber-50">
              رقابت همزمان با یادگیرندگان و ربات‌های هوش مصنوعی! ۳ نفر اول به لیگ الماس صعود می‌کنند.
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-[11px] font-latin text-white border border-white/20 backdrop-blur-xs">
              <Timer className="w-3.5 h-3.5" />
              <span>پایان هفته: ۳ روز و ۱۲ ساعت باقی‌مانده</span>
            </div>
          </div>

          {/* Real Capacity & Community Participation Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-slate-100">
                    ظرفیت واقعی زبان‌آموزان:
                  </span>
                  <span className="font-latin font-black text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    {realCapacity} نفر عضو
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                  با ثبت‌نام هر کاربر جدید، ظرفیت و جدول رتبه‌بندی به طور خودکار رشد می‌کند
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCapacityModalOpen(true);
                audioService.playClickSound();
              }}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 active:scale-95 transition-all shadow-xs"
            >
              افزودن عضو
            </button>
          </div>

          {/* Competitors Leaderboard */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {competitors.map((c, index) => {
                const rank = index + 1;
                const isPromotionZone = rank <= 3;

                return (
                  <div
                    key={c.id}
                    className={`p-3.5 flex items-center justify-between gap-3 transition-all ${
                      c.isUser
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-r-4 border-indigo-600'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Number */}
                      <span
                        className={`w-6 text-center font-extrabold font-latin text-sm ${
                          rank === 1
                            ? 'text-amber-500 text-base'
                            : rank === 2
                            ? 'text-gray-400'
                            : rank === 3
                            ? 'text-amber-700'
                            : 'text-gray-400'
                        }`}
                      >
                        {rank}
                      </span>

                      {/* Avatar */}
                      <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {c.avatar && (c.avatar.startsWith('data:') || c.avatar.startsWith('http') || c.avatar.startsWith('/') || c.avatar.length > 10) ? (
                          <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl leading-none">{c.avatar}</span>
                        )}
                      </span>

                      {/* Name & Streak */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${c.isUser ? 'text-indigo-900 dark:text-indigo-300 font-extrabold' : 'text-gray-800 dark:text-slate-100'}`}>
                            {c.name}
                          </span>
                          {c.isAi && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                              AI
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-400 font-latin">
                          <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                          <span>{c.streak} روز</span>
                        </div>
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-left font-latin font-bold text-xs text-gray-800 dark:text-slate-200">
                      <span>{c.xp} XP</span>
                      {isPromotionZone && (
                        <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-sans font-bold">صعود ↗</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Detailed Progress Stats & Recharts Visualizations */}
      {subTab === 'stats' && (
        <div className="space-y-4">
          <ProgressCharts user={user} />
        </div>
      )}

      {/* AI Battle Live Duel Modal */}
      <AnimatePresence>
        {isBattleActive && selectedRival && currentQ && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 max-w-lg w-full shadow-2xl text-right max-h-[90vh] overflow-y-auto"
            >
              {battleAnswerState !== 'finished' ? (
                <>
                  {/* Duel Arena Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <Swords className="w-5 h-5 text-rose-600" />
                      <span className="text-sm font-bold text-gray-900 dark:text-slate-100">
                        دوئل زنده (سوال {battleIndex + 1} از {AI_BATTLE_QUESTIONS.length})
                      </span>
                    </div>
                    <button
                      onClick={() => setIsBattleActive(false)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-slate-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Scoreboard: User vs Rival */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-center flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center overflow-hidden mb-1 shadow-xs">
                        {user.avatar && (user.avatar.startsWith('data:') || user.avatar.startsWith('http') || user.avatar.startsWith('/') || user.avatar.length > 10) ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl leading-none">{user.avatar}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block">{user.name}</span>
                      <span className="text-lg font-extrabold text-indigo-700 dark:text-indigo-400 font-latin">
                        {userScore} امتیاز
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-center">
                      <span className="text-2xl block mb-1">{selectedRival.avatar}</span>
                      <span className="text-xs font-bold text-rose-900 dark:text-rose-300 block">{selectedRival.name}</span>
                      <span className="text-lg font-extrabold text-rose-700 dark:text-rose-400 font-latin">
                        {aiScore} امتیاز
                      </span>
                    </div>
                  </div>

                  {/* Timer Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-latin text-gray-500 dark:text-slate-400 mb-1">
                      <span>زمان پاسخ‌گویی:</span>
                      <span className="font-bold text-rose-600">{battleTimer}s</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(battleTimer / 15) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Card */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 mb-4">
                    {currentQ.imageUrl && (
                      <div className="rounded-xl overflow-hidden mb-3 max-h-36">
                        <img
                          src={currentQ.imageUrl}
                          alt="Question"
                          className="w-full h-32 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <h4 className="text-sm font-bold text-gray-900 dark:text-slate-100 leading-relaxed">
                      {currentQ.promptFa}
                    </h4>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {currentQ.options.map((opt, i) => {
                      const isSelected = selectedAnswer === opt;
                      const isCorrect = opt === currentQ.correctAnswer;
                      const isAiPicked = aiSelectedAnswer === opt;

                      let btnStyle = 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-100';
                      if (battleAnswerState === 'answered') {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-900 dark:text-rose-300';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold';
                      }

                      return (
                        <button
                          key={i}
                          disabled={battleAnswerState === 'answered'}
                          onClick={() => handleAnswerQuestion(opt)}
                          className={`w-full p-3 rounded-2xl border text-right transition-all flex items-center justify-between gap-2 text-xs font-bold ${btnStyle}`}
                        >
                          <span className="font-latin">{opt}</span>
                          <div className="flex items-center gap-1">
                            {isAiPicked && battleAnswerState === 'answered' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-sans">
                                انتخاب {selectedRival.nameFa.split(' ')[0]}
                              </span>
                            )}
                            {battleAnswerState === 'answered' && isCorrect && (
                              <Check className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Question / Explanation */}
                  {battleAnswerState === 'answered' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                        {currentQ.explanationFa}
                      </div>
                      <button
                        onClick={handleNextBattleQuestion}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs active:scale-95 transition-all shadow-md"
                      >
                        {battleIndex + 1 < AI_BATTLE_QUESTIONS.length ? 'سوال بعدی' : 'مشاهده نتایج نهایی'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Battle Finished Screen */
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Trophy className="w-8 h-8" />
                  </div>

                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-slate-100">
                    {userScore > aiScore ? '🎉 پیروزی افتخارآفرین بر رقیب هوش مصنوعی!' : userScore === aiScore ? '🤝 مساوی هیجان‌انگیز!' : '💪 تلاش عالی! دفعه بعد برنده می‌شوید'}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-slate-300">
                    امتیاز شما: <strong className="font-latin">{userScore}</strong> | امتیاز {selectedRival.nameFa}: <strong className="font-latin">{aiScore}</strong>
                  </p>

                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>پاداش: +{Math.round(selectedRival.accuracy * 30 + 10)} XP و +5 جواهر</span>
                  </div>

                  <button
                    onClick={() => setIsBattleActive(false)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 active:scale-95 transition-all shadow-md"
                  >
                    بازگشت به لیگ
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Active Exam Simulator Modal */}
      {activeExam && (
        <ExamSimulatorModal
          exam={activeExam}
          onClose={() => setActiveExam(null)}
        />
      )}

      {/* Dynamic Mock Exam Modal */}
      <MockExamModal
        isOpen={isMockExamOpen}
        onClose={() => setIsMockExamOpen(false)}
      />
    </div>
  );
};

