import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  Volume2,
  Volume1,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  Zap,
  Gem,
  BookOpen,
  Lightbulb,
  Check,
  Languages,
  Info,
  Keyboard,
  Layers,
  Edit3,
  Eraser,
} from 'lucide-react';
import { Lesson, Exercise, MatchingPair } from '../../types';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';

interface LessonRunnerModalProps {
  lesson: Lesson;
  onClose: () => void;
}

interface MatchTileItem {
  id: string; // unique tile id
  pairId: string; // matches partner
  text: string;
  type: 'target' | 'native';
  audioText?: string;
}

// Special language characters helper for on-screen touch keyboard
const SPECIAL_CHARS_BY_LANG: Record<string, string[]> = {
  de: ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'],
  fr: ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'ù', 'û'],
  es: ['ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü', '¿', '¡', 'Ñ'],
  it: ['à', 'è', 'é', 'ì', 'ò', 'ù'],
  tr: ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü', 'Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü'],
  ar: ['َ', 'ُ', 'ِ', 'ً', 'ٌ', 'ٍ', 'ّ', 'ْ', 'ة', 'ى', 'ء', 'إ', 'أ'],
  ru: ['ё', 'ж', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'],
};

export const LessonRunnerModal: React.FC<LessonRunnerModalProps> = ({ lesson, onClose }) => {
  const {
    user,
    deductHeart,
    completeLesson,
    recordExamResult,
    recordMistakeTopic,
    triggerCelebration,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [availableTiles, setAvailableTiles] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [isTypingMode, setIsTypingMode] = useState(false); // Toggle between Keyboard and Tile Bank
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [speakingResult, setSpeakingResult] = useState<{
    score: number;
    accuracy: string;
    feedbackFa: string;
  } | null>(null);

  // Match pairs state
  const [matchTiles, setMatchTiles] = useState<MatchTileItem[]>([]);
  const [selectedMatchTile, setSelectedMatchTile] = useState<MatchTileItem | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [mismatchPairIds, setMismatchPairIds] = useState<string[]>([]);

  // Educational slide/guidebook state
  const [showGuidebook, setShowGuidebook] = useState(false);

  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isCompleted, setIsCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [aiWritingFeedback, setAiWritingFeedback] = useState<any | null>(null);
  const [isCheckingAi, setIsCheckingAi] = useState(false);

  const currentEx: Exercise | undefined = lesson.exercises[currentIndex];
  const progressPercent = Math.round(((currentIndex + (status !== 'idle' ? 1 : 0)) / Math.max(lesson.exercises.length, 1)) * 100);

  // Fallback options builder for exercises that might lack explicit options
  const computedOptions = useMemo(() => {
    if (!currentEx) return [];
    if (currentEx.options && currentEx.options.length > 0) {
      return currentEx.options;
    }
    // Generate intelligent options if none provided
    const correct = Array.isArray(currentEx.correctAnswer) ? currentEx.correctAnswer[0] : currentEx.correctAnswer;
    const distractors = ['آموزش و یادگیری', 'گزینه مرتبط ۲', 'ساختار زمان حال', 'عبارت تکمیلی'];
    if (currentEx.type === 'fill_in_blank' || currentEx.type === 'spot_the_mistake') {
      return [correct, 'is', 'are', 'am'].filter((v, i, a) => a.indexOf(v) === i);
    }
    return [correct, ...distractors.slice(0, 3)].sort(() => 0.5 - Math.random());
  }, [currentEx]);

  // Fallback tiles builder for tile-based exercises
  const computedInitialTiles = useMemo(() => {
    if (!currentEx) return [];
    if (currentEx.wordTiles && currentEx.wordTiles.length > 0) {
      return [...currentEx.wordTiles];
    }
    const correct = Array.isArray(currentEx.correctAnswer) ? currentEx.correctAnswer[0] : currentEx.correctAnswer;
    if (typeof correct === 'string' && correct.trim()) {
      const words = correct.trim().split(/\s+/);
      const extraWords = ['very', 'also', 'and', 'the', 'not', 'is', 'in'];
      const combined = [...words, ...extraWords.slice(0, Math.min(3, words.length))];
      return combined.sort(() => 0.5 - Math.random());
    }
    return [];
  }, [currentEx]);

  // Initialize exercise state on index change
  useEffect(() => {
    if (!currentEx) return;
    setSelectedOption(null);
    setFreeText('');
    setIsTypingMode(false);
    setSpokenTranscript('');
    setSpeakingResult(null);
    setStatus('idle');
    setAiWritingFeedback(null);
    setSelectedMatchTile(null);
    setMatchedPairIds([]);
    setMismatchPairIds([]);

    const initialTiles = computedInitialTiles;
    setAvailableTiles(initialTiles);
    setSelectedTiles([]);

    // Setup matching pairs tiles if match_pairs type
    if (currentEx.type === 'match_pairs' && currentEx.matchingPairs && currentEx.matchingPairs.length > 0) {
      const items: MatchTileItem[] = [];
      currentEx.matchingPairs.forEach((pair) => {
        items.push({
          id: `${pair.id}_target`,
          pairId: pair.id,
          text: pair.target,
          type: 'target',
          audioText: pair.target,
        });
        items.push({
          id: `${pair.id}_native`,
          pairId: pair.id,
          text: pair.nativeFa,
          type: 'native',
          audioText: pair.nativeFa,
        });
      });
      setMatchTiles(items.sort(() => Math.random() - 0.5));
    } else {
      setMatchTiles([]);
    }

    // Auto-play audio if enabled
    if (user.settings.autoPlayAudio && currentEx.targetAudioText) {
      setTimeout(() => {
        audioService.speak(currentEx.targetAudioText!, user.targetLanguage, user.settings.ttsSpeed);
      }, 300);
    }
  }, [currentIndex, currentEx, computedInitialTiles, user.settings.autoPlayAudio, user.settings.ttsSpeed, user.targetLanguage]);

  if (!currentEx && !isCompleted) {
    return null;
  }

  // Handle tile tap in word order / translate exercises
  const handleTileClick = (tile: string, fromSelected: boolean) => {
    audioService.playClickSound();
    if (fromSelected) {
      setSelectedTiles((prev) => {
        const idx = prev.indexOf(tile);
        if (idx === -1) return prev;
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      });
      setAvailableTiles((prev) => [...prev, tile]);
    } else {
      setAvailableTiles((prev) => {
        const idx = prev.indexOf(tile);
        if (idx === -1) return prev;
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      });
      setSelectedTiles((prev) => [...prev, tile]);
    }
  };

  // Handle Match Pairs Tile Selection
  const handleMatchTileClick = (tile: MatchTileItem) => {
    if (matchedPairIds.includes(tile.pairId)) return; // already solved

    audioService.playClickSound();
    if (tile.type === 'target') {
      audioService.speak(tile.text, user.targetLanguage);
    } else {
      audioService.speakPersian(tile.text);
    }

    if (!selectedMatchTile) {
      setSelectedMatchTile(tile);
    } else {
      if (selectedMatchTile.id === tile.id) {
        setSelectedMatchTile(null);
        return;
      }

      if (selectedMatchTile.pairId === tile.pairId && selectedMatchTile.type !== tile.type) {
        audioService.playCorrectSound();
        const newMatched = [...matchedPairIds, tile.pairId];
        setMatchedPairIds(newMatched);
        setSelectedMatchTile(null);

        const totalPairs = currentEx?.matchingPairs?.length || 0;
        if (newMatched.length === totalPairs && totalPairs > 0) {
          setStatus('correct');
          setCorrectCount((prev) => prev + 1);
        }
      } else {
        audioService.playWrongSound();
        setMismatchPairIds([selectedMatchTile.id, tile.id]);
        setTimeout(() => {
          setMismatchPairIds([]);
          setSelectedMatchTile(null);
        }, 700);
      }
    }
  };

  // Start speech recognition for speaking exercises
  const handleToggleMic = () => {
    if (isSpeaking) {
      audioService.stopListening();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    setSpokenTranscript('');
    audioService.playClickSound();

    const success = audioService.startListening(
      user.targetLanguage,
      (transcript, isFinal) => {
        setSpokenTranscript(transcript);
        if (isFinal) {
          setIsSpeaking(false);
          if (currentEx?.correctAnswer) {
            const evalResult = audioService.evaluatePronunciation(
              transcript,
              Array.isArray(currentEx.correctAnswer) ? currentEx.correctAnswer[0] : currentEx.correctAnswer,
            );
            setSpeakingResult(evalResult);
          }
        }
      },
      (err) => {
        console.warn('Speech error:', err);
        setIsSpeaking(false);
      },
      () => {
        setIsSpeaking(false);
      },
    );

    if (!success) {
      setIsSpeaking(false);
    }
  };

  // Helper to normalize strings for robust comparison
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?،؛]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/['’]/g, "'");
  };

  // Check Answer Button Logic
  const handleCheck = async () => {
    if (!currentEx) return;

    let isCorrect = false;

    if (currentEx.type === 'match_pairs') {
      const totalPairs = currentEx.matchingPairs?.length || 0;
      isCorrect = matchedPairIds.length === totalPairs && totalPairs > 0;
    } else if (currentEx.type === 'free_writing') {
      if (!freeText.trim()) return;
      setIsCheckingAi(true);
      try {
        const res = await fetch('/api/ai-tutor/writing-correction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: freeText,
            targetLanguage: user.targetLanguage,
            explanationLanguage: user.explanationLanguage,
          }),
        });
        const data = await res.json();
        setAiWritingFeedback(data);
        isCorrect = (data.score || 80) >= 60;
      } catch {
        isCorrect = freeText.trim().length > 5;
      } finally {
        setIsCheckingAi(false);
      }
    } else if (currentEx.type === 'speaking_pronunciation') {
      if (speakingResult) {
        isCorrect = speakingResult.score >= 55;
      } else if (spokenTranscript) {
        const evalRes = audioService.evaluatePronunciation(
          spokenTranscript,
          Array.isArray(currentEx.correctAnswer) ? currentEx.correctAnswer[0] : currentEx.correctAnswer,
        );
        setSpeakingResult(evalRes);
        isCorrect = evalRes.score >= 55;
      } else {
        isCorrect = false;
      }
    } else if (currentEx.type === 'fill_in_blank') {
      const expectedAnswers = (Array.isArray(currentEx.correctAnswer) ? currentEx.correctAnswer : [currentEx.correctAnswer]).map(normalize);
      const userValue = normalize(selectedOption || freeText || selectedTiles.join(' '));
      isCorrect = expectedAnswers.some((ans) => ans === userValue || (ans.length > 2 && userValue.includes(ans)));
    } else if (isTypingMode || freeText.trim().length > 0) {
      // User typed their answer in the input box
      const expectedAnswers = (Array.isArray(currentEx.correctAnswer) ? currentEx.correctAnswer : [currentEx.correctAnswer]).map(normalize);
      const userTyped = normalize(freeText);
      isCorrect = expectedAnswers.some((ans) => ans === userTyped || userTyped === ans.replace(/['’]/g, ''));
    } else if (currentEx.type === 'translate_to_target' || currentEx.type === 'word_jumble' || currentEx.type === 'listening_dictation') {
      const constructed = normalize(selectedTiles.join(' '));
      const expectedAnswers = (Array.isArray(currentEx.correctAnswer) ? currentEx.correctAnswer : [currentEx.correctAnswer]).map(normalize);
      isCorrect = expectedAnswers.some((ans) => ans === constructed);
    } else {
      // Multiple choice or option selection
      const expectedAnswers = (Array.isArray(currentEx.correctAnswer) ? currentEx.correctAnswer : [currentEx.correctAnswer]).map(normalize);
      const chosen = selectedOption ? normalize(selectedOption) : normalize(freeText);
      isCorrect = expectedAnswers.some((ans) => ans === chosen);
    }

    if (isCorrect) {
      audioService.playCorrectSound();
      setStatus('correct');
      setCorrectCount((prev) => prev + 1);
    } else {
      audioService.playWrongSound();
      setStatus('wrong');
      deductHeart();
      if (currentEx.weaknessCategory) {
        recordMistakeTopic(currentEx.weaknessCategory);
      }
    }
  };

  // Continue to Next Question
  const handleContinue = () => {
    if (currentIndex + 1 < lesson.exercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      if (lesson.unitId === 'exam' || lesson.id.includes('exam')) {
        const total = lesson.exercises.length;
        const finalScore = total > 0 ? Math.round((correctCount / total) * 100) : 100;
        const bandStr =
          finalScore >= 85
            ? 'باند عالی (C1-C2 Master)'
            : finalScore >= 70
            ? 'باند پیشرفته (B2 Vantage)'
            : finalScore >= 50
            ? 'باند متوسط (B1 Threshold)'
            : 'باند مقدماتی (A2 Waystage)';

        recordExamResult(
          lesson.id,
          lesson.title,
          lesson.titleFa,
          lesson.levelRequired || 'B1',
          finalScore,
          correctCount,
          total,
          bandStr,
        );
        triggerCelebration('exam');
      } else {
        completeLesson(lesson.id, lesson.xpReward, lesson.gemReward);
        triggerCelebration('lesson');
      }
    }
  };

  // Play audio helper with rate
  const playTargetAudio = (speed: number = 1.0) => {
    if (currentEx?.targetAudioText) {
      audioService.speak(currentEx.targetAudioText, user.targetLanguage, speed);
    }
  };

  const specialChars = SPECIAL_CHARS_BY_LANG[user.targetLanguage] || [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-gray-900 dark:text-slate-100 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="max-w-2xl w-full mx-auto px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between gap-3 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Progress Bar */}
        <div className="flex-1 h-3.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-gray-300/60 dark:border-slate-700 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full shadow-xs"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        {/* Educational Slide / Guidebook Toggle */}
        <button
          onClick={() => {
            setShowGuidebook(true);
            audioService.playClickSound();
          }}
          title="مشاهده درسنامه و اسلاید آموزشی"
          className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all active:scale-95 shadow-xs"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden sm:inline">درسنامه</span>
        </button>

        {/* Hearts Count */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold font-latin text-sm">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>{user.hearts}</span>
        </div>
      </div>

      {/* Main Exercise Area */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 overflow-y-auto flex flex-col justify-between">
        {!isCompleted ? (
          <div>
            {/* Exercise Instruction & Header */}
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>تمرین هوشمند {currentIndex + 1} از {lesson.exercises.length}</span>
                </div>
                <h2 className="text-base sm:text-xl font-extrabold text-gray-900 dark:text-slate-100 leading-snug">
                  {currentEx.instructionFa}
                </h2>
              </div>

              {/* Mode switch for writing/tiles if applicable */}
              {(currentEx.type === 'translate_to_target' ||
                currentEx.type === 'word_jumble' ||
                currentEx.type === 'listening_dictation' ||
                currentEx.type === 'fill_in_blank') && (
                <button
                  onClick={() => {
                    setIsTypingMode((prev) => !prev);
                    audioService.playClickSound();
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-1.5 shrink-0 shadow-xs transition-all active:scale-95"
                  title="تغییر بین حالت تایپ با کیبورد و بانک کلمات"
                >
                  {isTypingMode ? (
                    <>
                      <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>بانک کلمات</span>
                    </>
                  ) : (
                    <>
                      <Keyboard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>تایپ کیبورد</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Prompt Card / Audio Banner & Image */}
            {currentEx.type !== 'match_pairs' && (
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 mb-5 shadow-xs relative overflow-hidden">
                {/* Exercise Illustration Image if present */}
                {currentEx.imageUrl && (
                  <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 flex items-center justify-center max-h-48">
                    <img
                      src={currentEx.imageUrl}
                      alt={currentEx.promptText}
                      className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {currentEx.direction === 'fa_to_target' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          🇮🇷 فارسی به مقصد
                        </span>
                      )}
                      {currentEx.direction === 'target_to_fa' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          مقصد به فارسی 🇮🇷
                        </span>
                      )}
                    </div>

                    {/* For Fill in the Blank, render highlighted prompt */}
                    {currentEx.type === 'fill_in_blank' ? (
                      <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 leading-relaxed">
                        {currentEx.promptText.includes('___') || currentEx.promptText.includes('_____') ? (
                          <span>
                            {currentEx.promptText.split(/_{3,5}/).map((part, pIdx, arr) => (
                              <React.Fragment key={pIdx}>
                                {part}
                                {pIdx < arr.length - 1 && (
                                  <span className="inline-block mx-1.5 px-3 py-0.5 rounded-lg border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold underline font-latin">
                                    {selectedOption || freeText || selectedTiles[0] || '_____'}
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                          </span>
                        ) : (
                          <p>{currentEx.promptText}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 leading-relaxed font-latin">
                        {currentEx.promptText}
                      </p>
                    )}

                    {currentEx.phonetic && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-latin mt-1 dir-ltr text-right">
                        {currentEx.phonetic}
                      </p>
                    )}
                  </div>

                  {/* Audio Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    {currentEx.targetAudioText && (
                      <>
                        <button
                          onClick={() => playTargetAudio(1.0)}
                          title="پخش صوت زبان مقصد"
                          className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 transition-all active:scale-90 shadow-xs"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => playTargetAudio(0.6)}
                          title="پخش با دور آرام (0.6x)"
                          className="p-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 transition-all active:scale-90"
                        >
                          <Volume1 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {currentEx.persianAudioText && (
                      <button
                        onClick={() => audioService.speakPersian(currentEx.persianAudioText!)}
                        title="پخش تلفظ فارسی"
                        className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 transition-all active:scale-90 flex items-center gap-1 text-xs font-bold"
                      >
                        <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[10px]">فارسی</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Grammar Note if present */}
                {currentEx.grammarNoteFa && (
                  <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/80">
                    <HelpCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <span>{currentEx.grammarNoteFa}</span>
                  </div>
                )}
              </div>
            )}

            {/* Exercise Interaction Components */}

            {/* 1. MATCH PAIRS (جفت‌کردن کلمات دولینگو) */}
            {currentEx.type === 'match_pairs' && (
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-3">
                    <span>کلمه زبان مقصد و معنی فارسی مرتبط را جفت کنید:</span>
                    <span className="font-latin font-bold text-indigo-600 dark:text-indigo-400">
                      {matchedPairIds.length} / {currentEx.matchingPairs?.length || 0} جفت
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {matchTiles.map((tile) => {
                      const isMatched = matchedPairIds.includes(tile.pairId);
                      const isSelected = selectedMatchTile?.id === tile.id;
                      const isMismatch = mismatchPairIds.includes(tile.id);

                      return (
                        <button
                          key={tile.id}
                          disabled={isMatched}
                          onClick={() => handleMatchTileClick(tile)}
                          className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-20 shadow-xs relative ${
                            isMatched
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 opacity-60'
                              : isMismatch
                              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 animate-shake scale-95'
                              : isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/90 border-indigo-600 dark:border-indigo-400 text-indigo-900 dark:text-indigo-200 font-bold scale-105 shadow-md shadow-indigo-100 dark:shadow-none'
                              : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200'
                          }`}
                        >
                          <span className={`text-sm sm:text-base font-bold ${tile.type === 'target' ? 'font-latin' : ''}`}>
                            {tile.text}
                          </span>

                          {isMatched && (
                            <span className="absolute top-2 right-2 text-emerald-600 dark:text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}

                          <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                            {tile.type === 'target' ? 'مقصد' : 'فارسی'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 2. FILL IN THE BLANK (جای خالی با گزینه‌ها + قابلیت تایپ مستقیم) */}
            {currentEx.type === 'fill_in_blank' && (
              <div className="space-y-4">
                {/* Typing Input Box if typing mode is active */}
                {isTypingMode ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={freeText}
                        onChange={(e) => setFreeText(e.target.value)}
                        placeholder="پاسخ جای خالی را اینجا تایپ کنید..."
                        className="w-full p-4 pr-11 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-400 dark:border-indigo-600 text-gray-900 dark:text-slate-100 font-latin font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                        autoFocus
                      />
                      <Edit3 className="w-5 h-5 text-indigo-500 absolute right-3.5 top-4 pointer-events-none" />
                      {freeText && (
                        <button
                          onClick={() => setFreeText('')}
                          className="absolute left-3.5 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
                        >
                          <Eraser className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Special characters bar */}
                    {specialChars.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center justify-center p-2 rounded-xl bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                        {specialChars.map((ch) => (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => setFreeText((prev) => prev + ch)}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-gray-300 dark:border-slate-600 font-latin font-bold text-sm shadow-2xs active:scale-95"
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Selectable Option Chips / Buttons */
                  <div className="space-y-3">
                    <div className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                      یکی از گزینه‌های زیر را برای جایگذاری در جای خالی انتخاب کنید:
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {computedOptions.map((opt, i) => {
                        const isSelected = selectedOption === opt;
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              setSelectedOption(opt);
                              audioService.playClickSound();
                            }}
                            className={`p-4 rounded-2xl border text-center transition-all flex items-center justify-between gap-2 shadow-xs ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-600 dark:border-indigo-400 text-indigo-900 dark:text-indigo-200 font-bold scale-[1.02]'
                                : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200'
                            }`}
                          >
                            <span className="text-sm sm:text-base font-latin font-bold flex-1 text-center">{opt}</span>
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400' : 'border-gray-300 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Word Tiles / Sentence Builder OR Keyboard Typing */}
            {(currentEx.type === 'translate_to_target' ||
              currentEx.type === 'word_jumble' ||
              currentEx.type === 'listening_dictation') && (
              <div className="space-y-4">
                {isTypingMode ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={freeText}
                        onChange={(e) => setFreeText(e.target.value)}
                        placeholder="جمله ترجمه شده را اینجا تایپ کنید..."
                        className="w-full p-4 pr-11 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-400 dark:border-indigo-600 text-gray-900 dark:text-slate-100 font-latin font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                        autoFocus
                      />
                      <Edit3 className="w-5 h-5 text-indigo-500 absolute right-3.5 top-4 pointer-events-none" />
                      {freeText && (
                        <button
                          onClick={() => setFreeText('')}
                          className="absolute left-3.5 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
                        >
                          <Eraser className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Special characters bar */}
                    {specialChars.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center justify-center p-2 rounded-xl bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                        {specialChars.map((ch) => (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => setFreeText((prev) => prev + ch)}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-gray-300 dark:border-slate-600 font-latin font-bold text-sm shadow-2xs active:scale-95"
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Word Tile Bank */
                  <div className="space-y-5">
                    {/* Selected Slots Area */}
                    <div className="min-h-16 p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border-2 border-dashed border-gray-300 dark:border-slate-700 flex flex-wrap items-center gap-2">
                      {selectedTiles.length === 0 ? (
                        <span className="text-xs text-gray-400 dark:text-slate-500">کلمات زیر را برای ساخت جمله انتخاب کنید...</span>
                      ) : (
                        selectedTiles.map((tile, idx) => (
                          <button
                            key={`${tile}-${idx}`}
                            onClick={() => handleTileClick(tile, true)}
                            className="px-3.5 py-2 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white font-latin font-bold text-sm shadow-xs transition-all active:scale-95"
                          >
                            {tile}
                          </button>
                        ))
                      )}
                    </div>

                    {/* Available Bank */}
                    <div className="flex flex-wrap justify-center gap-2.5">
                      {availableTiles.map((tile, idx) => (
                        <button
                          key={`avail-${tile}-${idx}`}
                          onClick={() => handleTileClick(tile, false)}
                          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 font-latin font-semibold text-sm shadow-xs transition-all active:scale-95"
                        >
                          {tile}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Multiple Choice Options (MCQ, spot mistake, grammar quiz, roleplay) */}
            {(currentEx.type === 'listening_mcq' ||
              currentEx.type === 'translate_to_native' ||
              currentEx.type === 'spot_the_mistake' ||
              currentEx.type === 'roleplay_chat' ||
              currentEx.type === 'grammar_explanation_quiz' ||
              currentEx.type === 'image_word_match') && (
              <div className="grid grid-cols-1 gap-2.5">
                {computedOptions.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedOption(opt);
                        audioService.playClickSound();
                      }}
                      className={`w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 shadow-xs ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-600 dark:border-indigo-400 text-indigo-900 dark:text-indigo-200 font-bold scale-[1.01]'
                          : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="text-sm sm:text-base leading-relaxed font-latin font-medium">{opt}</span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400' : 'border-gray-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white dark:bg-slate-900"></span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 5. Speaking Pronunciation */}
            {currentEx.type === 'speaking_pronunciation' && (
              <div className="flex flex-col items-center justify-center py-6 space-y-5">
                <div className="relative">
                  {isSpeaking && (
                    <div className="absolute -inset-4 bg-indigo-500/20 rounded-full animate-ping pointer-events-none" />
                  )}
                  <button
                    onClick={handleToggleMic}
                    className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-lg ${
                      isSpeaking
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-[#4F46E5] hover:bg-indigo-700 text-white hover:scale-105 active:scale-95 shadow-indigo-200 dark:shadow-none'
                    }`}
                  >
                    {isSpeaking ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">
                    {isSpeaking ? 'در حال شنیدن صدای شما... صحبت کنید!' : 'برای شروع صحبت روی میکروفون ضربه بزنید'}
                  </p>
                  {spokenTranscript && (
                    <div className="mt-3 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-latin text-gray-800 dark:text-slate-200 text-sm shadow-xs">
                      "{spokenTranscript}"
                    </div>
                  )}
                </div>

                {/* Speaking Evaluation Score */}
                {speakingResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`w-full p-4 rounded-2xl border text-center shadow-xs ${
                      speakingResult.score >= 70
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                        : 'bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                    }`}
                  >
                    <div className="text-2xl font-bold font-latin mb-1">{speakingResult.score}%</div>
                    <p className="text-xs font-bold">{speakingResult.feedbackFa}</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* 6. Free Writing */}
            {currentEx.type === 'free_writing' && (
              <div className="space-y-4">
                <textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="اینجا به زبان مقصد بنویسید..."
                  rows={4}
                  className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 font-latin text-sm focus:outline-none focus:border-indigo-600 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500 shadow-xs"
                />

                {/* Special characters bar */}
                {specialChars.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center justify-center p-2 rounded-xl bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                    {specialChars.map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setFreeText((prev) => prev + ch)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-gray-300 dark:border-slate-600 font-latin font-bold text-sm shadow-2xs active:scale-95"
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                )}

                {aiWritingFeedback && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-indigo-700 dark:text-indigo-300">نمره تصحیح هوش مصنوعی:</span>
                      <span className="font-latin text-sm px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                        {aiWritingFeedback.score} / 100
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{aiWritingFeedback.overallFeedback}</p>
                    {aiWritingFeedback.correctedText && (
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 text-xs font-latin text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-700">
                        <strong>نگارش پیشنهادی:</strong> {aiWritingFeedback.correctedText}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Lesson Completed Celebration View */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-white shadow-xl shadow-amber-100 dark:shadow-none animate-bounce">
              <Trophy className="w-12 h-12" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-2">
                {lesson.unitId === 'exam' || lesson.id.includes('exam') ? 'آزمون تسلط با موفقیت به پایان رسید!' : 'درس با موفقیت تکمیل شد!'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {lesson.unitId === 'exam' || lesson.id.includes('exam')
                  ? `کارنامه آزمون ${lesson.title} (${Math.round((correctCount / Math.max(lesson.exercises.length, 1)) * 100)}%) محاسبه و در پیشرفت شما ثبت گردید.`
                  : `تبریک! شما تمام ${lesson.exercises.length} تمرین این بخش را به پایان رساندید.`}
              </p>
            </div>

            {/* Reward Stats */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xs flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-lg font-latin">
                  <Zap className="w-5 h-5 fill-amber-500" />
                  <span>+{lesson.unitId === 'exam' ? Math.round(((correctCount / Math.max(lesson.exercises.length, 1)) * 100) * 1.5) + 30 : lesson.xpReward} XP</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-slate-400 mt-1">امتیاز تجربه</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xs flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-lg font-latin">
                  <Gem className="w-5 h-5 fill-blue-600" />
                  <span>+{lesson.unitId === 'exam' ? 25 : lesson.gemReward}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-slate-400 mt-1">جواهر پاداش</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full max-w-sm py-4 rounded-2xl bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-base shadow-md shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
            >
              ادامه مسیر یادگیری
            </button>
          </motion.div>
        )}
      </div>

      {/* Educational Slide / Guidebook Drawer Modal */}
      {showGuidebook && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 p-5 sm:p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100">اسلایدهای آموزشی درس (Guidebook)</h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">{lesson.titleFa}</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuidebook(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Grammar and Concepts */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 space-y-2">
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                نکات کلیدی و گرامر این بخش:
              </h4>
              <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
                {lesson.descriptionFa}
              </p>
            </div>

            {/* Quick Vocabulary List in this lesson */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100">واژگان و عبارات مهم این درس:</h4>
              <div className="space-y-1.5">
                {lesson.exercises.slice(0, 6).map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-bold font-latin text-indigo-700 dark:text-indigo-300 block">{ex.promptText}</span>
                      <span className="text-[11px] text-gray-500 dark:text-slate-400">{ex.explanationFa}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {ex.targetAudioText && (
                        <button
                          onClick={() => audioService.speak(ex.targetAudioText!, user.targetLanguage)}
                          title="پخش زبان مقصد"
                          className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 hover:bg-indigo-100"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {ex.persianAudioText && (
                        <button
                          onClick={() => audioService.speakPersian(ex.persianAudioText!)}
                          title="پخش فارسی"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-100"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowGuidebook(false)}
              className="w-full py-3 rounded-2xl bg-[#4F46E5] text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-sm"
            >
              متوجه شدم، ادامه تمرین
            </button>
          </motion.div>
        </div>
      )}

      {/* Bottom Action Footer & Explanation Sheet */}
      {!isCompleted && (
        <div
          className={`border-t transition-all p-4 pb-[max(1rem,env(safe-area-inset-bottom))] max-w-2xl w-full mx-auto shadow-sm ${
            status === 'correct'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800'
              : status === 'wrong'
              ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800'
              : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'
          }`}
        >
          {/* Correction / Explanation Banner */}
          {status !== 'idle' && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-4 space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-base">
                {status === 'correct' ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-800 dark:text-emerald-200">عالی! پاسخ کاملاً درست است.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    <span className="text-rose-800 dark:text-rose-200">پاسخ نادرست بود!</span>
                  </>
                )}
              </div>

              {status === 'wrong' && (
                <div className="text-xs text-rose-700 dark:text-rose-300">
                  <strong>پاسخ صحیح: </strong>
                  <span className="font-latin font-bold">
                    {Array.isArray(currentEx.correctAnswer) ? currentEx.correctAnswer.join(', ') : currentEx.correctAnswer}
                  </span>
                </div>
              )}

              {/* Explanations in Persian / Selected language */}
              <div className="text-xs text-gray-800 dark:text-slate-200 leading-relaxed bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-200 dark:border-slate-700 flex items-start justify-between gap-2 shadow-xs">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>توضیح آموزشی: </strong>
                    {currentEx.explanationFa}
                  </div>
                </div>

                <button
                  onClick={() => audioService.speakPersian(currentEx.explanationFa)}
                  title="پخش صوت فارسی توضیح"
                  className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0 hover:bg-emerald-100"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Action Button */}
          {status === 'idle' ? (
            <button
              onClick={handleCheck}
              disabled={isCheckingAi}
              className="w-full py-4 rounded-2xl bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-base shadow-md shadow-indigo-100 dark:shadow-none transition-all active:scale-98 disabled:opacity-50"
            >
              {isCheckingAi ? 'در حال بررسی توسط هوش مصنوعی...' : 'بررسی پاسخ'}
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className={`w-full py-4 rounded-2xl text-white font-bold text-base shadow-md transition-all active:scale-98 ${
                status === 'correct'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 dark:shadow-none'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100 dark:shadow-none'
              }`}
            >
              ادامه
            </button>
          )}
        </div>
      )}
    </div>
  );
};

