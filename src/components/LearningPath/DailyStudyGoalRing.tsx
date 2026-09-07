import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  Zap,
  Play,
  Settings2,
  ChevronLeft,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';

interface DailyStudyGoalRingProps {
  onStartQuickPractice?: () => void;
  onOpenAiTutor?: () => void;
}

export const DailyStudyGoalRing: React.FC<DailyStudyGoalRingProps> = ({
  onStartQuickPractice,
  onOpenAiTutor,
}) => {
  const { user, addStudyTime, updateSettings } = useApp();
  const [showGoalSelector, setShowGoalSelector] = useState(false);

  const goalMinutes = user.settings?.dailyGoalMinutes || 15;
  const currentSeconds = user.dailyStudyTimeSeconds || 0;
  const currentMinutes = Math.floor(currentSeconds / 60);
  const remainingSeconds = currentSeconds % 60;

  // Calculate percentage (0 to 100)
  const goalSeconds = goalMinutes * 60;
  const rawProgress = Math.min(100, (currentSeconds / goalSeconds) * 100);
  const progressPercent = Math.round(rawProgress);
  const isGoalAchieved = currentSeconds >= goalSeconds;

  // Circular progress ring geometry
  const radius = 38;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rawProgress / 100) * circumference;

  // Time remaining string in Persian
  const remainingTotalSec = Math.max(0, goalSeconds - currentSeconds);
  const remMin = Math.floor(remainingTotalSec / 60);

  const handleSimulatePractice = (minutesToAdd: number) => {
    audioService.playClickSound();
    addStudyTime(minutesToAdd * 60);
  };

  const handleSelectGoal = (minutes: number) => {
    audioService.playClickSound();
    updateSettings({ dailyGoalMinutes: minutes });
    setShowGoalSelector(false);
  };

  return (
    <div
      id="daily-study-goal-ring-card"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border border-indigo-100/90 dark:border-slate-800 shadow-sm p-4 sm:p-5 transition-all select-none"
    >
      {/* Background ambient glow */}
      <div
        className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl pointer-events-none transition-opacity ${
          isGoalAchieved ? 'bg-emerald-400/15 dark:bg-emerald-500/10' : 'bg-indigo-400/15 dark:bg-indigo-500/10'
        }`}
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left/Start side: Ring visualization + Core Stats */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* SVG Circular Progress Ring */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              {/* Background track circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-gray-100 dark:stroke-slate-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Active animated progress stroke */}
              <motion.circle
                cx="48"
                cy="48"
                r={radius}
                stroke={isGoalAchieved ? '#10b981' : '#6366f1'}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
                className="transition-colors duration-500"
              />
            </svg>

            {/* Inner Ring Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {isGoalAchieved ? (
                <motion.div
                  initial={{ scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400"
                >
                  <Trophy className="w-6 h-6 animate-bounce" />
                  <span className="text-[10px] font-black font-latin mt-0.5">100%</span>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-base font-black font-latin text-gray-900 dark:text-slate-100">
                      {currentMinutes}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 font-latin">/{goalMinutes}</span>
                  </div>
                  <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 font-latin">
                    {progressPercent}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Goal Text description & Motivation */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800">
                <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                هدف مطالعه روزانه
              </span>
              {isGoalAchieved ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  تکمیل شد!
                </span>
              ) : (
                <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                  {remMin > 0 ? `فقط ${remMin} دقیقه دیگر تا تکمیل` : 'کمتر از ۱ دقیقه تا تکمیل'}
                </span>
              )}
            </div>

            <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
              {isGoalAchieved ? (
                <>
                  <span>آفرین! تمرین ۱۵ دقیقه‌ای امروز کامل شد 🎉</span>
                </>
              ) : (
                <>
                  <span>تمرین مستمر روزانه ({goalMinutes} دقیقه)</span>
                </>
              )}
            </h3>

            <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
              {isGoalAchieved
                ? 'استمرار روزانه رمز تسلط زبانی است. برای ارتقای رتبه در لیگ می‌توانید بیشتر تمرین کنید!'
                : `مطالعه روزانه ۱۵ دقیقه، بازدهی یادگیری زبان را ۳ برابر سریع‌تر و پایدارتر می‌کند.`}
            </p>
          </div>
        </div>

        {/* Right side: Quick Action Buttons & Adjustments */}
        <div className="flex items-center sm:flex-col gap-2 w-full sm:w-auto shrink-0 justify-end">
          {/* Quick Practice button */}
          <button
            onClick={onStartQuickPractice || onOpenAiTutor}
            className={`flex-1 sm:flex-none w-full px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 ${
              isGoalAchieved
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none'
                : 'bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none'
            }`}
          >
            {isGoalAchieved ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>ادامه تمرین دلخواه</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>شروع تمرین امروز</span>
              </>
            )}
          </button>

          {/* Goal Duration Selector Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowGoalSelector(!showGoalSelector)}
              title="تنظیم زمان هدف روزانه"
              className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 border border-gray-200 dark:border-slate-700 transition-all active:scale-95"
            >
              <Settings2 className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
              <span>{goalMinutes} دقیقه</span>
            </button>

            {/* Quick simulation button (convenient for testing or marking time) */}
            <button
              onClick={() => handleSimulatePractice(5)}
              title="افزودن ۵ دقیقه تمرین به هدف امروز"
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 border border-indigo-200/80 dark:border-indigo-800 transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>+۵ دقیقه</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Goal Selector Dropdown */}
      <AnimatePresence>
        {showGoalSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 mt-3 border-t border-gray-100 dark:border-slate-800/80 space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700 dark:text-slate-300">
                میزان هدف مطالعه روزانه خود را انتخاب کنید:
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                پیشنهاد ما: ۱۵ دقیقه
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSelectGoal(mins)}
                  className={`py-2 px-2 rounded-xl text-xs font-latin font-bold transition-all border ${
                    goalMinutes === mins
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {mins} min {mins === 15 && '⭐'}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
