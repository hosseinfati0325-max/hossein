import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Compass,
  CheckCircle2,
  Trophy,
  Volume2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Globe2,
  Check,
  RotateCcw,
  GraduationCap,
  Zap,
  HelpCircle,
  Award,
} from 'lucide-react';
import { PLACEMENT_TESTS_BY_LANG } from '../../data/placementTestsData';
import { SUPPORTED_LANGUAGES } from '../../data/curriculumData';
import { Exercise, CEFRLevel, TargetLanguageCode } from '../../types';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';

interface PlacementTestModalProps {
  onClose: () => void;
}

export const PlacementTestModal: React.FC<PlacementTestModalProps> = ({ onClose }) => {
  const { user, setUser, setCurrentLevel, setTargetLanguage, triggerCelebration } = useApp();
  const [selectedLang, setSelectedLang] = useState<TargetLanguageCode>(user.targetLanguage || 'en');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [assessedLevel, setAssessedLevel] = useState<CEFRLevel>('A1');
  const [showExplanation, setShowExplanation] = useState(false);

  // Sync selected language if user changes target language externally
  useEffect(() => {
    if (user.targetLanguage && user.targetLanguage !== selectedLang && currentIndex === 0 && !isFinished) {
      setSelectedLang(user.targetLanguage);
    }
  }, [user.targetLanguage]);

  // Dynamically get question bank for the selected language
  const questions: Exercise[] = PLACEMENT_TESTS_BY_LANG[selectedLang] || PLACEMENT_TESTS_BY_LANG.en || [];
  const currentQ: Exercise = questions[currentIndex] || questions[0] || {
    id: 'fallback_1',
    type: 'fill_in_blank',
    instructionFa: 'سوال تعیین سطح',
    promptText: 'Question',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    explanationFa: 'توضیحات سوال',
    difficulty: 'easy',
  };

  const progressPercent = questions.length > 0
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;

  // When changing language, dynamically switch questions and reset state
  const handleLanguageChange = (lang: TargetLanguageCode) => {
    if (lang === selectedLang) return;
    audioService.playClickSound();
    setSelectedLang(lang);
    setTargetLanguage(lang);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
    setShowExplanation(false);
  };

  const handleOptionSelect = (opt: string) => {
    setSelectedOption(opt);
    audioService.playClickSound();
  };

  const handleNext = () => {
    if (!selectedOption) return;

    let isCorrect = false;
    if (Array.isArray(currentQ.correctAnswer)) {
      isCorrect = currentQ.correctAnswer.includes(selectedOption);
    } else {
      isCorrect = selectedOption === currentQ.correctAnswer;
    }

    if (isCorrect) {
      audioService.playCorrectSound();
    } else {
      audioService.playWrongSound();
    }

    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Calculate CEFR level based on score ratio
      const total = questions.length;
      const ratio = total > 0 ? newScore / total : 0;
      let level: CEFRLevel = 'A1';

      if (ratio >= 0.85) level = 'C1';
      else if (ratio >= 0.7) level = 'B2';
      else if (ratio >= 0.5) level = 'B1';
      else if (ratio >= 0.3) level = 'A2';
      else level = 'A1';

      setAssessedLevel(level);
      setIsFinished(true);
      setCurrentLevel(level);
      setUser((prev) => ({
        ...prev,
        targetLanguage: selectedLang,
        currentLevel: level,
        placementTestDone: true,
        placementScore: Math.round(ratio * 100),
        xp: prev.xp + 60,
        gems: prev.gems + 30,
      }));
      triggerCelebration();
      audioService.playFanfareSound();
    }
  };

  const handleRestart = () => {
    audioService.playClickSound();
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
    setShowExplanation(false);
  };

  const langInfo = SUPPORTED_LANGUAGES[selectedLang] || SUPPORTED_LANGUAGES.en;

  // Language specific advice
  const getLanguageAdvice = (langCode: TargetLanguageCode, level: CEFRLevel) => {
    switch (langCode) {
      case 'de':
        return `در زبان آلمانی، تمرکز شما در سطح ${level} روی تسلط بر آرتیکل‌ها (der, die, das) و پادژهای دستوری (Akkusativ, Dativ) خواهد بود.`;
      case 'fr':
        return `در زبان فرانسوی، تمرکز شما در سطح ${level} روی ظرافت‌های تلفظ، حروف اضافه، زمان‌های گذشته و وجه التزامی خواهد بود.`;
      case 'es':
        return `در زبان اسپانیایی، تمرکز شما در سطح ${level} روی تمایز افعال Ser و Estar، ضمایر مفعولی و زمان‌های گذشته و التزامی است.`;
      case 'tr':
        return `در زبان ترکی استانبولی، تسلط بر هماهنگی اصوات و زنجیره پسوندهای فعلی و اسمی مسیر پیشرفت شما در سطح ${level} است.`;
      case 'it':
        return `در زبان ایتالیایی، آهنگ کلام، ترکیب ضمایر متصل و کاربرد صیغه‌های التزامی در سطح ${level} به شما آموزش داده خواهد شد.`;
      case 'ar':
        return `در زبان عربی فصیح، شناخت ابواب ثلاثی مزید، اعراب کلمات و ساختارهای نحوی پیشرفته تمرکز سطح ${level} شماست.`;
      case 'ja':
        return `در زبان ژاپنی، یادگیری سیستم کانجی، گرامرهای ذرات و فرم‌های احترام‌آمیز (Keigo) محتوای اصلی سطح ${level} شما خواهند بود.`;
      case 'ru':
        return `در زبان روسی، تمرکز شما در سطح ${level} روی ۶ پادژ دستوری، افعال حرکتی با پیشوند و کاربرد صفت‌های فعلی است.`;
      case 'zh':
        return `در زبان چینی ماندارین، تقویت ۴ تن صوتی، ساختارهای دستوری با 把 و اصطلاحات ۴ حرفی چنگیو در سطح ${level} قرار دارد.`;
      case 'en':
      default:
        return `در زبان انگلیسی، ساختارهای گرامری کاربردی، اصطلاحات روزمره و تقویت مهارت مکالمه طبیعی محور اصلی سطح ${level} شماست.`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F3F4F6] dark:bg-slate-950 text-[#1F2937] dark:text-slate-100 overflow-hidden select-none transition-colors duration-200">
      {/* Top Header */}
      <div className="max-w-2xl w-full mx-auto px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 max-w-xs mx-4 h-3 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-gray-300/60 dark:border-slate-700">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-latin font-bold text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Dynamic Language Selector Bar */}
      <div className="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800 py-2.5 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-slate-400 shrink-0 pl-2">
            <Globe2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>زبان آزمون:</span>
          </div>
          {(Object.keys(SUPPORTED_LANGUAGES) as TargetLanguageCode[]).map((code) => {
            const lang = SUPPORTED_LANGUAGES[code];
            const isSelected = selectedLang === code;
            return (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs scale-102 ring-2 ring-indigo-300 dark:ring-indigo-800'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                }`}
              >
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.nameFa}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 overflow-y-auto flex flex-col justify-between">
        {!isFinished ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedLang}_${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Question Header & Level Tag */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    تعیین سطح {langInfo.nameFa} ({langInfo.nameNative}) {langInfo.flag}
                  </span>
                  <span className="text-[11px] font-latin font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    {currentQ.difficulty === 'easy'
                      ? 'سطح A1 - A2 (پایه)'
                      : currentQ.difficulty === 'medium'
                      ? 'سطح B1 - B2 (متوسط)'
                      : 'سطح C1 - C2 (پیشرفته)'}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-slate-100">
                  {currentQ.instructionFa}
                </h2>
              </div>

              {/* Prompt Card */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs">
                {currentQ.imageUrl && (
                  <div className="rounded-2xl overflow-hidden mb-3 border border-gray-100 dark:border-slate-800 max-h-44 flex items-center justify-center bg-gray-50 dark:bg-slate-950">
                    <img
                      src={currentQ.imageUrl}
                      alt={currentQ.promptText}
                      className="w-full h-40 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 leading-relaxed font-latin" dir="auto">
                  {currentQ.promptText}
                </p>

                {/* Audio and Pronunciation Actions */}
                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  {currentQ.targetAudioText && (
                    <button
                      onClick={() => audioService.speak(currentQ.targetAudioText!, selectedLang, 0.95)}
                      className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 flex items-center gap-2 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>پخش تلفظ {langInfo.nameFa} {langInfo.flag}</span>
                    </button>
                  )}

                  {currentQ.persianAudioText && (
                    <button
                      onClick={() => audioService.speakPersian(currentQ.persianAudioText!)}
                      className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>تلفظ صوتی فارسی</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Multiple Choice Options */}
              {currentQ.options && currentQ.options.length > 0 && (
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, i) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <button
                        key={i}
                        onClick={() => handleOptionSelect(opt)}
                        className={`w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between shadow-xs cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold scale-[1.01] shadow-indigo-100 dark:shadow-none'
                            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-latin text-sm sm:text-base font-medium" dir="auto">
                          {opt}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 transition-colors ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-gray-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Finished Result Screen */
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-5"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-none">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-slate-100 mb-1 flex items-center justify-center gap-2">
                <span>تعیین سطح {langInfo.nameFa}</span>
                <span>{langInfo.flag}</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                پاسخ‌های صحیح شما: <strong className="text-indigo-600 dark:text-indigo-400 font-latin">{score} از {questions.length}</strong> ({questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}٪)
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 w-full max-w-md space-y-3 shadow-sm text-right">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-slate-400">سطح علمی اختصاص‌یافته:</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  استاندارد CEFR
                </span>
              </div>

              <div className="text-center py-2">
                <div className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 font-latin tracking-wider">
                  {assessedLevel}
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-slate-300 mt-1 block">
                  {assessedLevel === 'A1'
                    ? 'مبتدی (A1 Beginner)'
                    : assessedLevel === 'A2'
                    ? 'مقدماتی به بالا (A2 Elementary)'
                    : assessedLevel === 'B1'
                    ? 'متوسط (B1 Intermediate)'
                    : assessedLevel === 'B2'
                    ? 'فوق متوسط (B2 Upper-Intermediate)'
                    : 'پیشرفته (C1 Advanced)'}
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-slate-300 pt-3 border-t border-gray-100 dark:border-slate-800 leading-relaxed text-right">
                {getLanguageAdvice(selectedLang, assessedLevel)}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-4 py-2.5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>پاداش تعیین سطح: +۶۰ امتیاز XP و +۳۰ الماس به حساب شما اضافه شد!</span>
            </div>

            <div className="flex items-center gap-3 w-full max-w-md pt-2">
              <button
                onClick={handleRestart}
                className="py-3.5 px-4 rounded-2xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>آزمون مجدد</span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-100 dark:shadow-none transition-all active:scale-98"
              >
                ورود به مسیر یادگیری {langInfo.nameFa}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Action Button */}
      {!isFinished && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-2xl w-full mx-auto shadow-sm flex items-center gap-3">
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className="flex-1 py-3.5 sm:py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-sm sm:text-base shadow-md shadow-indigo-100 dark:shadow-none transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{currentIndex + 1 === questions.length ? 'مشاهده نتیجه تعیین سطح' : 'ثبت و سوال بعدی'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

