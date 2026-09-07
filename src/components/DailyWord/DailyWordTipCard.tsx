import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Volume2,
  Brain,
  RotateCcw,
  Check,
  Lightbulb,
  MessageSquare,
  BookmarkPlus,
  Share2,
  Zap,
  Flame,
  ArrowLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dailyWordService } from '../../services/dailyWordService';
import { DailyWordTip } from '../../types';
import { audioService } from '../../services/audioService';

interface DailyWordTipCardProps {
  onOpenAiTutor?: (initialPrompt?: string) => void;
}

export const DailyWordTipCard: React.FC<DailyWordTipCardProps> = ({ onOpenAiTutor }) => {
  const {
    user,
    addSRSCard,
    addGems,
    addXP,
    isOnline,
    triggerCelebration,
  } = useApp();

  const [wordTip, setWordTip] = useState<DailyWordTip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingWordAudio, setIsPlayingWordAudio] = useState(false);
  const [isPlayingSentenceAudio, setIsPlayingSentenceAudio] = useState(false);
  const [isSavedToSRS, setIsSavedToSRS] = useState(false);
  const [showMemoryTrick, setShowMemoryTrick] = useState(false);

  // Fetch or load today's word
  const loadDailyWord = useCallback(
    async (forceRefresh: boolean = false) => {
      setIsLoading(true);
      setIsSavedToSRS(false);
      try {
        const tip = await dailyWordService.getDailyWordTip(
          user.targetLanguage,
          user.currentLevel,
          user.explanationLanguage || 'fa',
          user.id,
          forceRefresh
        );
        setWordTip(tip);

        // Check if already in SRS deck
        if (tip) {
          const alreadyInSRS = user.srsCards?.some(
            (c) => c.frontText.toLowerCase() === tip.word.toLowerCase()
          );
          setIsSavedToSRS(!!alreadyInSRS);
        }
      } catch (err) {
        console.warn('Failed to load daily word, fallback to offline bank', err);
      } finally {
        setIsLoading(false);
      }
    },
    [user.targetLanguage, user.currentLevel, user.explanationLanguage, user.id, user.srsCards]
  );

  useEffect(() => {
    loadDailyWord(false);
  }, [loadDailyWord]);

  // Pronounce target word
  const handlePlayWordAudio = () => {
    if (!wordTip) return;
    setIsPlayingWordAudio(true);
    audioService.speak(wordTip.word, wordTip.targetLanguage);
    setTimeout(() => setIsPlayingWordAudio(false), 1600);
  };

  // Pronounce example sentence
  const handlePlaySentenceAudio = () => {
    if (!wordTip) return;
    setIsPlayingSentenceAudio(true);
    audioService.speak(wordTip.exampleSentence, wordTip.targetLanguage);
    setTimeout(() => setIsPlayingSentenceAudio(false), 3000);
  };

  // Play Persian explanation audio
  const handlePlayPersianAudio = () => {
    if (!wordTip) return;
    audioService.speakPersian(`${wordTip.word}: ${wordTip.translationFa}. ${wordTip.pedagogicalTipFa}`);
  };

  // Save to SRS Spaced Repetition deck
  const handleSaveToSRS = () => {
    if (!wordTip || isSavedToSRS) return;
    const card = dailyWordService.createSRSCardFromWord(wordTip);
    addSRSCard(card);
    setIsSavedToSRS(true);
    audioService.playSuccessSound();
    triggerCelebration('standard');
  };

  if (isLoading && !wordTip) {
    return (
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-32 bg-gray-200 dark:bg-slate-800 rounded-full"></div>
          <div className="h-5 w-16 bg-gray-200 dark:bg-slate-800 rounded-full"></div>
        </div>
        <div className="h-7 w-48 bg-gray-200 dark:bg-slate-800 rounded-xl mb-2"></div>
        <div className="h-4 w-full bg-gray-100 dark:bg-slate-800/60 rounded-lg mb-4"></div>
        <div className="h-10 w-full bg-gray-100 dark:bg-slate-800/40 rounded-2xl"></div>
      </div>
    );
  }

  if (!wordTip) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100/90 dark:border-indigo-900/50 shadow-xs relative overflow-hidden group"
    >
      {/* Background soft decorative glow */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-slate-100">
                واژه و نکته طلایی امروز
              </h3>
              {wordTip.isAiGenerated && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 text-amber-500" />
                  <span>تولید هوش مصنوعی</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">
              متناسب با سطح واقعی شما ({user.currentLevel})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {wordTip.level}
          </span>
          <button
            onClick={() => loadDailyWord(true)}
            disabled={isLoading}
            title="دریافت واژه تازه از هوش مصنوعی"
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-300 transition-all active:scale-90 shadow-xs cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Word Presentation Block */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 sm:p-4 border border-indigo-100/80 dark:border-slate-700/80 shadow-xs mb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-indigo-950 dark:text-white font-latin tracking-tight">
                {wordTip.word}
              </h2>
              {wordTip.phonetic && (
                <span className="text-xs font-mono font-medium text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                  {wordTip.phonetic}
                </span>
              )}
              {wordTip.partOfSpeech && (
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                  {wordTip.partOfSpeech}
                </span>
              )}
            </div>

            {/* Persian Translation */}
            <p className="text-sm sm:text-base font-black text-gray-900 dark:text-slate-100 pt-0.5">
              {wordTip.translationFa}
            </p>
          </div>

          {/* Audio Pronunciation Button */}
          <button
            onClick={handlePlayWordAudio}
            className={`p-2.5 rounded-2xl transition-all cursor-pointer shrink-0 shadow-xs active:scale-95 flex items-center justify-center ${
              isPlayingWordAudio
                ? 'bg-indigo-600 text-white scale-105 shadow-indigo-300'
                : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200/70 dark:border-indigo-800'
            }`}
            title="تلفظ صوتی واژه با لهجه بومی"
          >
            <Volume2 className={`w-5 h-5 ${isPlayingWordAudio ? 'animate-bounce' : ''}`} />
          </button>
        </div>

        {/* Synonyms if available */}
        {wordTip.synonyms && wordTip.synonyms.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2 border-t border-gray-100 dark:border-slate-700/50 text-[11px]">
            <span className="text-gray-400 dark:text-slate-500 font-medium">مترادف‌ها:</span>
            {wordTip.synonyms.map((syn, idx) => (
              <span
                key={idx}
                className="bg-gray-100 dark:bg-slate-700/60 text-gray-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-latin font-semibold text-[10px]"
              >
                {syn}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Example Sentence Section */}
      <div className="bg-white/80 dark:bg-slate-800/60 rounded-2xl p-3 border border-gray-200/80 dark:border-slate-700/60 space-y-1.5 mb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-indigo-500" />
            <span>مثال کاربردی در جمله:</span>
          </span>
          <button
            onClick={handlePlaySentenceAudio}
            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <Volume2 className="w-3 h-3" />
            <span>شنیدن جمله</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-slate-200 font-latin leading-relaxed dir-ltr text-left">
          "{wordTip.exampleSentence}"
        </p>
        <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
          «{wordTip.exampleTranslationFa}»
        </p>
      </div>

      {/* Pedagogical Tip / Nuance */}
      {wordTip.pedagogicalTipFa && (
        <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 text-[11px] sm:text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold block">نکته آموزشی استاد حسین و فاطمه:</span>
            <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              {wordTip.pedagogicalTipFa}
            </p>
          </div>
        </div>
      )}

      {/* Memory Trick Accordion (if available) */}
      {wordTip.memoryTrickFa && (
        <div className="mb-3">
          <button
            onClick={() => setShowMemoryTrick(!showMemoryTrick)}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>{showMemoryTrick ? 'مخفی کردن ترفند به‌خاطرسپاری' : 'مشاهده ترفند طلایی کدگذاری ذهنی'}</span>
          </button>
          <AnimatePresence>
            {showMemoryTrick && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1.5 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-indigo-900 dark:text-indigo-200 leading-relaxed"
              >
                {wordTip.memoryTrickFa}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action Footer Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSaveToSRS}
          disabled={isSavedToSRS}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
            isSavedToSRS
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none'
          }`}
        >
          {isSavedToSRS ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>در جعبه لایتنر ذخیره شد</span>
            </>
          ) : (
            <>
              <BookmarkPlus className="w-4 h-4" />
              <span>افزودن به جعبه لایتنر SRS (+۲ الماس)</span>
            </>
          )}
        </button>

        {onOpenAiTutor && (
          <button
            onClick={() =>
              onOpenAiTutor(
                `سلام استاد! امروز می‌خواهم کاربرد واژه «${wordTip.word}» را در مکالمه با هم تمرین کنیم.`
              )
            }
            className="py-2 sm:py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95 shadow-xs cursor-pointer"
            title="مکالمه با این واژه در هوش مصنوعی"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">تمرین در مکالمه</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
