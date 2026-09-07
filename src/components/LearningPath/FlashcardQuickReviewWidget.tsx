import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Volume2,
  RotateCw,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SRSCard } from '../../types';
import { audioService } from '../../services/audioService';

interface FlashcardQuickReviewWidgetProps {
  onOpenSRS?: () => void;
}

export const FlashcardQuickReviewWidget: React.FC<FlashcardQuickReviewWidgetProps> = ({
  onOpenSRS,
}) => {
  const { user, rateSRSCard, addXP } = useApp();

  // Filter cards for active target language
  const languageCards = useMemo(() => {
    const cards = Array.isArray(user.srsCards) ? user.srsCards : [];
    return cards.filter((c) => c.language === user.targetLanguage);
  }, [user.srsCards, user.targetLanguage]);

  // Seed / select 3 cards from the queue
  const [selectedCards, setSelectedCards] = useState<SRSCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Pick 3 cards (prioritizing due/learning/new, or random)
  const pickThreeCards = useCallback(() => {
    if (languageCards.length === 0) {
      setSelectedCards([]);
      return;
    }

    const now = new Date().toISOString();
    const dueOrLearning = languageCards.filter(
      (c) => c.state !== 'mastered' || (c.nextReviewDate && c.nextReviewDate <= now)
    );

    const pool = dueOrLearning.length >= 3 ? dueOrLearning : languageCards;
    // Shuffle and pick 3
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 3);

    setSelectedCards(chosen);
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedCount(0);
    setIsFinished(false);
  }, [languageCards]);

  // Initialize on mount or when language changes
  React.useEffect(() => {
    pickThreeCards();
  }, [pickThreeCards]);

  const currentCard: SRSCard | undefined = selectedCards[currentIndex];

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    audioService.playClickSound();
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;
    audioService.speak(currentCard.frontText, user.targetLanguage, user.settings.ttsSpeed);
  };

  const handleRate = (rating: 1 | 4) => {
    if (!currentCard) return;

    if (rating === 4) {
      audioService.playSuccessSound();
    } else {
      audioService.playClickSound();
    }

    rateSRSCard(currentCard.id, rating);
    const nextReviewed = reviewedCount + 1;
    setReviewedCount(nextReviewed);

    if (currentIndex + 1 < selectedCards.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all 3
      setIsFinished(true);
      addXP(15);
    }
  };

  if (languageCards.length === 0) {
    return null; // Don't clutter if no cards are available yet
  }

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3.5 transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span>مرور سریع فلش‌کارت‌ها</span>
              <span className="text-[10px] font-latin font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                SRS Quick 3
              </span>
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">
              تمرین روزانه ۳ واژه برای تثبیت در حافظه بلندمدت
            </p>
          </div>
        </div>

        {onOpenSRS && (
          <button
            onClick={onOpenSRS}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-all active:scale-95 shrink-0"
          >
            <span>جعبه کامل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Finished State */}
      {isFinished ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-center space-y-2.5"
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-none">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
              ۳ فلش‌کارت با موفقیت مرور شد!
            </h5>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              +۱۵ امتیاز تجربی (XP) دریافت کردید. استمرار در مرور کلید تسلط است.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={pickThreeCards}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-xs font-bold hover:bg-gray-50 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>۳ کارت دیگر</span>
            </button>
            {onOpenSRS && (
              <button
                onClick={onOpenSRS}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm shadow-emerald-200 dark:shadow-none"
              >
                <Award className="w-3.5 h-3.5" />
                <span>ورود به لایتنر کامل</span>
              </button>
            )}
          </div>
        </motion.div>
      ) : currentCard ? (
        <div className="space-y-3">
          {/* Card Indicator Bar */}
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-slate-400">
            <span>کارت {currentIndex + 1} از {selectedCards.length}</span>
            <span className="text-[10px] font-latin px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
              {currentCard.category || 'Vocabulary'}
            </span>
          </div>

          {/* Flashcard Item (Click to Flip) */}
          <div
            onClick={handleFlip}
            className="relative min-h-[140px] sm:min-h-[150px] p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-slate-800/80 dark:to-purple-950/20 border border-indigo-100/80 dark:border-slate-700 cursor-pointer shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex flex-col justify-between select-none"
          >
            {/* Top Row: audio & flip icon */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePlayAudio}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all active:scale-90"
                title="تلفظ صوتی"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                <RotateCw className="w-3 h-3" />
                <span>{isFlipped ? 'روی کارت' : 'مشاهده معنی'}</span>
              </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="front"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-center py-2 space-y-1"
                >
                  <div className="text-xl sm:text-2xl font-black font-latin text-gray-900 dark:text-slate-100">
                    {currentCard.frontText}
                  </div>
                  {currentCard.phonetic && (
                    <div className="text-xs font-latin text-indigo-600 dark:text-indigo-400 font-medium">
                      {currentCard.phonetic}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 pt-1">
                    برای دیدن ترجمه و مثال لمس کنید
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-center py-2 space-y-1.5"
                >
                  <div className="text-base sm:text-lg font-extrabold text-indigo-700 dark:text-indigo-300">
                    {currentCard.backTextFa}
                  </div>
                  {currentCard.partOfSpeech && (
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                      {currentCard.partOfSpeech}
                    </span>
                  )}
                  {currentCard.exampleTarget && (
                    <p className="text-[11px] text-gray-600 dark:text-slate-300 font-latin italic leading-relaxed pt-1">
                      «{currentCard.exampleTarget}»
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom State Pill */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500 border-t border-gray-100 dark:border-slate-700/60 pt-2 mt-2">
              <span>وضعیت: {currentCard.state === 'mastered' ? 'مسلط شده' : currentCard.state === 'review' ? 'نوبت مرور' : 'در حال یادگیری'}</span>
              <span>فاصله مرور: {currentCard.interval || 1} روز</span>
            </div>
          </div>

          {/* Quick Review Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              onClick={() => handleRate(1)}
              className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>نیاز به تمرین (دوباره)</span>
            </button>

            <button
              onClick={() => handleRate(4)}
              className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>بلدم (تسلط کامل)</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
