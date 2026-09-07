import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, Gem, Flame, Award, Sparkles, CheckCircle2, ArrowRight, Star, Heart } from 'lucide-react';
import { audioService } from '../../services/audioService';
import { confettiService } from '../../services/confettiService';

export interface CelebrationModalData {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  xpReward?: number;
  gemReward?: number;
  streakDays?: number;
  badge?: string;
  scorePercent?: number;
  category?: 'grammar' | 'exam' | 'lesson' | 'duel' | 'srs' | 'general';
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalData> = ({
  isOpen,
  title,
  subtitle,
  xpReward = 20,
  gemReward = 5,
  streakDays,
  badge,
  scorePercent,
  category = 'general',
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      if (category === 'exam') {
        confettiService.triggerMassiveFireworkShow();
      } else if (category === 'grammar') {
        confettiService.triggerGrammarStarBurst();
      } else {
        confettiService.triggerSideCannons();
      }
      audioService.playFanfareSound();
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in select-none">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 25 }}
          transition={{ type: 'spring', damping: 24, stiffness: 350 }}
          className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl p-6 text-center overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-amber-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Animated Icon Trophy/Badge */}
          <div className="relative mx-auto mb-4 flex items-center justify-center">
            <motion.div
              initial={{ rotate: -15, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20"
            >
              {category === 'grammar' ? (
                <Award className="w-10 h-10 sm:w-12 sm:h-12" />
              ) : category === 'exam' ? (
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
              ) : (
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12" />
              )}
            </motion.div>

            {/* Sparkle decorative icons */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], rotate: [0, 90, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-1 -right-1 text-yellow-400"
            >
              <Star className="w-6 h-6 fill-yellow-400" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
              className="absolute -bottom-1 -left-1 text-amber-500"
            >
              <Sparkles className="w-5 h-5 fill-amber-500" />
            </motion.div>
          </div>

          {/* Title & Congratulations */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl font-black text-gray-900 dark:text-slate-100 mb-1.5"
          >
            {title}
          </motion.h2>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mb-5 leading-relaxed px-2"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Score pill if provided */}
          {typeof scorePercent === 'number' && (
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>نمره کسب‌شده: {scorePercent}%</span>
            </div>
          )}

          {/* Reward Badges Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* XP Gained */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 shadow-xs flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black text-lg sm:text-xl font-latin">
                <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
                <span>+{xpReward} XP</span>
              </div>
              <span className="text-[11px] text-gray-500 dark:text-slate-400 font-bold mt-0.5">
                امتیاز مهارت
              </span>
            </motion.div>

            {/* Gems Gained */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 shadow-xs flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-black text-lg sm:text-xl font-latin">
                <Gem className="w-5 h-5 fill-blue-500 text-blue-500" />
                <span>+{gemReward}</span>
              </div>
              <span className="text-[11px] text-gray-500 dark:text-slate-400 font-bold mt-0.5">
                جواهر پاداش
              </span>
            </motion.div>
          </div>

          {/* Optional Streak Reminder */}
          {typeof streakDays === 'number' && streakDays > 0 && (
            <div className="mb-5 p-2.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 flex items-center justify-center gap-2 text-xs font-bold text-orange-700 dark:text-orange-300">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>استریک یادگیری شما: {streakDays} روز متوالی! 🔥</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => {
              audioService.playClickSound();
              onClose();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>ادامه و دریافت پاداش</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
