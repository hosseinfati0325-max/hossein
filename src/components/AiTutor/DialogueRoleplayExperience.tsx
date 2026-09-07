import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Theater,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Trophy,
  Coffee,
  Briefcase,
  Plane,
  Building,
  Utensils,
  ShoppingBag,
  Sparkle,
  MessageSquare,
  Award,
  BookOpen,
  HelpCircle,
  Play,
  Flame,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RoleplayScenario, RoleplayMissionGoal, TargetLanguageCode } from '../../types';
import { DIALOGUE_ROLEPLAY_SCENARIOS } from '../../data/dialogueRoleplayData';
import { SUPPORTED_LANGUAGES } from '../../data/curriculumData';
import { audioService } from '../../services/audioService';
import { audioCacheDB } from '../../services/audioCacheDB';

interface MessageTurn {
  id: string;
  speaker: 'ai' | 'user';
  speakerName: string;
  text: string;
  translationFa?: string;
  phonetic?: string;
  pronunciationScore?: number;
  wordTokens?: { word: string; isMatched: boolean; score: number }[];
  feedbackFa?: string;
  corrections?: { original: string; corrected: string; explanationFa: string }[];
  timestamp: number;
}

interface DialogueRoleplayExperienceProps {
  onScenarioSelect?: (scenario: RoleplayScenario) => void;
}

export const DialogueRoleplayExperience: React.FC<DialogueRoleplayExperienceProps> = () => {
  const { user, addXp, addGems } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeScenario, setActiveScenario] = useState<RoleplayScenario | null>(null);
  const [dialogueHistory, setDialogueHistory] = useState<MessageTurn[]>([]);
  const [goals, setGoals] = useState<RoleplayMissionGoal[]>([]);
  const [currentScriptIndex, setCurrentScriptIndex] = useState<number>(0);
  const [selectedTargetPhrase, setSelectedTargetPhrase] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedSpokenText, setRecordedSpokenText] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showPersianTranslation, setShowPersianTranslation] = useState<boolean>(true);
  const [latestPronunciationResult, setLatestPronunciationResult] = useState<{
    score: number;
    accuracy: 'perfect' | 'great' | 'good' | 'retry';
    feedbackFa: string;
    wordTokens: { word: string; isMatched: boolean; score: number }[];
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [overallScores, setOverallScores] = useState<number[]>([]);
  const [customInputText, setCustomInputText] = useState<string>('');
  const [cachedPhrasesCount, setCachedPhrasesCount] = useState<number>(0);
  const [isPreloadingAudio, setIsPreloadingAudio] = useState<boolean>(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const currentLang = SUPPORTED_LANGUAGES[user.targetLanguage] || SUPPORTED_LANGUAGES.en;

  // Pre-cache scenario dialogue phrases into IndexedDB for 100% offline pronunciation practice
  useEffect(() => {
    const preloadAudioAssets = async () => {
      try {
        const phrasesToCache: { text: string; lang: string }[] = [];
        DIALOGUE_ROLEPLAY_SCENARIOS.forEach((sc) => {
          sc.starterMessages.forEach((sm) => {
            phrasesToCache.push({ text: sm.text, lang: sc.targetLanguage });
          });
          if (sc.suggestedPhrases) {
            sc.suggestedPhrases.forEach((sp) => {
              phrasesToCache.push({ text: sp, lang: sc.targetLanguage });
            });
          }
          if (sc.dialogueScript) {
            sc.dialogueScript.forEach((ds) => {
              phrasesToCache.push({ text: ds.text, lang: sc.targetLanguage });
            });
          }
        });

        await audioCacheDB.preloadEssentialOfflinePhrases(phrasesToCache);
        const count = await audioCacheDB.getCacheCount();
        setCachedPhrasesCount(count);
      } catch (err) {
        console.warn('Audio pre-cache IndexedDB notice:', err);
      }
    };

    preloadAudioAssets();
  }, [user.targetLanguage]);

  // Auto-scroll inside chat

  // Auto-scroll inside chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueHistory, isEvaluating, isRecording]);

  // Filter scenarios for current target language or general
  const availableScenarios = DIALOGUE_ROLEPLAY_SCENARIOS.filter((sc) => {
    const matchesLang = sc.targetLanguage === user.targetLanguage || sc.targetLanguage === 'en';
    const matchesCategory = selectedCategory === 'all' || sc.category === selectedCategory;
    return matchesLang && matchesCategory;
  });

  // Start a scenario
  const handleStartScenario = (scenario: RoleplayScenario) => {
    audioService.playClickSound();
    setActiveScenario(scenario);
    setIsCompleted(false);
    setOverallScores([]);
    setLatestPronunciationResult(null);
    setCurrentScriptIndex(1); // Index 0 is initial AI message

    const initialGoals: RoleplayMissionGoal[] = (scenario.goals || [
      { id: 'g1', titleFa: 'شروع مکالمه و احوالپرسی محترمانه', isCompleted: false },
      { id: 'g2', titleFa: 'انتقال درخواست اصلی در موقعیت', isCompleted: false },
      { id: 'g3', titleFa: 'پاسخ به سوالات طرف مقابل', isCompleted: false },
      { id: 'g4', titleFa: 'خداحافظی و جمع‌بندی مکالمه', isCompleted: false },
    ]).map((g) => ({ ...g, isCompleted: false }));

    setGoals(initialGoals);

    const initialAiMsg: MessageTurn = {
      id: `ai_init_${Date.now()}`,
      speaker: 'ai',
      speakerName: scenario.aiRole,
      text: scenario.starterMessages[0].text,
      translationFa: scenario.starterMessages[0].translationFa,
      timestamp: Date.now(),
    };

    setDialogueHistory([initialAiMsg]);

    // Set first suggested target phrase if available in dialogueScript
    if (scenario.dialogueScript && scenario.dialogueScript.length > 1) {
      setSelectedTargetPhrase(scenario.dialogueScript[1].text);
    } else if (scenario.suggestedPhrases && scenario.suggestedPhrases.length > 0) {
      setSelectedTargetPhrase(scenario.suggestedPhrases[0]);
    } else {
      setSelectedTargetPhrase('');
    }

    if (user.settings.autoPlayAudio) {
      audioService.speak(initialAiMsg.text, scenario.targetLanguage, user.settings.ttsSpeed);
    }
  };

  // Start live voice recording for pronunciation scoring
  const handleToggleRecord = (targetTextToEvaluate?: string) => {
    if (isRecording) {
      audioService.stopListening();
      setIsRecording(false);
      return;
    }

    const phraseToTest = targetTextToEvaluate || selectedTargetPhrase || customInputText;
    setRecordedSpokenText('');
    setLatestPronunciationResult(null);
    setIsRecording(true);
    audioService.playClickSound();

    const success = audioService.startListening(
      activeScenario?.targetLanguage || user.targetLanguage,
      (transcript, isFinal) => {
        setRecordedSpokenText(transcript);
        if (isFinal) {
          setIsRecording(false);
          handleEvaluateAndSend(transcript, phraseToTest);
        }
      },
      (err) => {
        console.warn('Speech recognition error:', err);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      },
    );

    if (!success) {
      setIsRecording(false);
    }
  };

  // Evaluate spoken phrase and advance dialogue
  const handleEvaluateAndSend = async (spokenText: string, targetPhrase: string) => {
    if (!spokenText.trim() || !activeScenario) return;

    setIsEvaluating(true);

    // 1. Immediate local pronunciation score evaluation
    const evalResult = audioService.evaluatePronunciation(
      spokenText,
      targetPhrase || spokenText,
    );
    setLatestPronunciationResult(evalResult);

    if (evalResult.score >= 80) {
      audioService.playCorrectSound();
    } else if (evalResult.score < 50) {
      audioService.playWrongSound();
    }

    setOverallScores((prev) => [...prev, evalResult.score]);

    // 2. Add user message to dialogue history
    const userTurn: MessageTurn = {
      id: `user_${Date.now()}`,
      speaker: 'user',
      speakerName: activeScenario.userRole,
      text: spokenText,
      translationFa: selectedTargetPhrase === targetPhrase && activeScenario.dialogueScript?.[currentScriptIndex]
        ? activeScenario.dialogueScript[currentScriptIndex].translationFa
        : undefined,
      phonetic: evalResult.wordTokens.length > 0 ? undefined : undefined,
      pronunciationScore: evalResult.score,
      wordTokens: evalResult.wordTokens,
      feedbackFa: evalResult.feedbackFa,
      timestamp: Date.now(),
    };

    setDialogueHistory((prev) => [...prev, userTurn]);
    setCustomInputText('');

    // 3. Call AI endpoint for in-character reply and goal progression
    try {
      const response = await fetch('/api/ai-tutor/roleplay-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: activeScenario.titleNative,
          situation: activeScenario.situation,
          userRole: activeScenario.userRole,
          aiRole: activeScenario.aiRole,
          spokenText: spokenText,
          targetPhrase: targetPhrase,
          targetLanguage: activeScenario.targetLanguage,
          explanationLanguage: user.explanationLanguage,
          conversationHistory: dialogueHistory.map((d) => ({
            role: d.speaker === 'user' ? 'user' : 'model',
            content: d.text,
          })),
          goals: goals,
        }),
      });

      const data = await response.json();

      // Update completed goals
      if (data.completedGoalIds && Array.isArray(data.completedGoalIds)) {
        setGoals((prev) =>
          prev.map((g) =>
            data.completedGoalIds.includes(g.id) ? { ...g, isCompleted: true } : g,
          ),
        );
      } else {
        // Fallback goal progress based on turn count
        setGoals((prev) => {
          const firstUncompleted = prev.findIndex((g) => !g.isCompleted);
          if (firstUncompleted !== -1) {
            const nextGoals = [...prev];
            nextGoals[firstUncompleted] = { ...nextGoals[firstUncompleted], isCompleted: true };
            return nextGoals;
          }
          return prev;
        });
      }

      // Add AI Partner reply
      const aiTurn: MessageTurn = {
        id: `ai_${Date.now()}`,
        speaker: 'ai',
        speakerName: activeScenario.aiRole,
        text: data.aiReply || 'Great! Let\'s continue our conversation.',
        translationFa: data.aiReplyFa,
        corrections: data.corrections || [],
        feedbackFa: data.pronunciationFeedbackFa,
        timestamp: Date.now(),
      };

      setDialogueHistory((prev) => [...prev, aiTurn]);

      if (user.settings.autoPlayAudio && aiTurn.text) {
        audioService.speak(aiTurn.text, activeScenario.targetLanguage, user.settings.ttsSpeed);
      }

      // Advance script or update suggested next phrase
      const nextIdx = currentScriptIndex + 2;
      setCurrentScriptIndex(nextIdx);

      if (
        activeScenario.dialogueScript &&
        nextIdx < activeScenario.dialogueScript.length &&
        activeScenario.dialogueScript[nextIdx]?.speaker === 'user'
      ) {
        setSelectedTargetPhrase(activeScenario.dialogueScript[nextIdx].text);
      } else if (data.suggestedNextPhrases && data.suggestedNextPhrases.length > 0) {
        setSelectedTargetPhrase(data.suggestedNextPhrases[0].text);
      }
    } catch (err) {
      console.error('Roleplay turn error:', err);
      // Local fallback turn
      const fallbackAi: MessageTurn = {
        id: `ai_fb_${Date.now()}`,
        speaker: 'ai',
        speakerName: activeScenario.aiRole,
        text: 'Thank you for your response! What else would you like to discuss?',
        translationFa: 'متشکرم از پاسخ شما! مورد دیگری هست که مایل باشید درباره‌اش صحبت کنیم؟',
        timestamp: Date.now(),
      };
      setDialogueHistory((prev) => [...prev, fallbackAi]);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Complete scenario
  const handleFinishScenario = () => {
    audioService.playFanfareSound();
    setIsCompleted(true);
    addXp(45);
    addGems(8);
  };

  const averageScore =
    overallScores.length > 0
      ? Math.round(overallScores.reduce((a, b) => a + b, 0) / overallScores.length)
      : 88;

  const completedGoalsCount = goals.filter((g) => g.isCompleted).length;

  const getScenarioIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee className="w-5 h-5" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5" />;
      case 'Plane':
        return <Plane className="w-5 h-5" />;
      case 'Building':
        return <Building className="w-5 h-5" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5" />;
      default:
        return <Theater className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {!activeScenario ? (
        // -------------------------------------------------------------
        // SCENARIO CATALOG & SELECTION SCREEN
        // -------------------------------------------------------------
        <div className="flex-1 overflow-y-auto space-y-5 p-1">
          {/* Header Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                  <Theater className="w-3.5 h-3.5 text-amber-300" />
                  شبیه‌ساز مکالمات نقش‌آفرینی واقعی (Dialogue Roleplay)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px]">
                  ارزیابی فوری تلفظ صوتی
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">
                در موقعیت‌های روزمره واقعی صحبت کنید و نمره بگیرید
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100/90 max-w-2xl leading-relaxed">
                یک سناریو (سفارش قهوه در کافه، مصاحبه شغلی، گیت پرواز فرودگاه، پذیرش هتل و...) را انتخاب کنید. همگام با گوینده بومی صحبت کنید، نمره تلفظ دقیق خود را مشاهده نمایید و اهداف مکالمه را تکمیل کنید.
              </p>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'همه موقعیت‌ها' },
              { id: 'daily', label: '☕ روزمره و کافه' },
              { id: 'work', label: '💼 مصاحبه و کاری' },
              { id: 'travel', label: '✈️ فرودگاه و هتل' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  audioService.playClickSound();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3.5 py-1.5 rounded-2xl font-bold transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#4F46E5] text-white shadow-sm shadow-indigo-200 dark:shadow-none'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableScenarios.map((scenario) => {
              const scLang = SUPPORTED_LANGUAGES[scenario.targetLanguage] || SUPPORTED_LANGUAGES.en;
              return (
                <motion.div
                  key={scenario.id}
                  whileHover={{ y: -3 }}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Scenario Cover Image */}
                  {scenario.imageUrl && (
                    <div className="h-36 relative overflow-hidden bg-slate-950">
                      <img
                        src={scenario.imageUrl}
                        alt={scenario.titleFa}
                        className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                          {scLang.flag} {scLang.nameFa}
                        </span>
                        <span className="px-2 py-1 rounded-xl bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-bold font-latin">
                          {scenario.level}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 left-3 text-white">
                        <div className="text-xs font-latin text-indigo-200 font-semibold truncate">
                          {scenario.titleNative}
                        </div>
                        <div className="text-base font-bold drop-shadow-sm">{scenario.titleFa}</div>
                      </div>
                    </div>
                  )}

                  {/* Scenario Details */}
                  <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                      {scenario.descriptionFa}
                    </p>

                    {/* Roles Badges */}
                    <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-indigo-950 dark:text-indigo-200 font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          شخصیت مقابل: {scenario.aiRole}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400 font-normal">
                          نقش شما: {scenario.userRole}
                        </span>
                      </div>
                      {scenario.goals && (
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 pt-1 border-t border-indigo-100 dark:border-slate-700">
                          🎯 شامل {scenario.goals.length} ماموریت و سنجش زنده تلفظ
                        </div>
                      )}
                    </div>

                    {/* Start Action Button */}
                    <button
                      onClick={() => handleStartScenario(scenario)}
                      className="w-full py-3 rounded-2xl bg-[#4F46E5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>شروع تمرین و شبیه‌سازی مکالمه</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : isCompleted ? (
        // -------------------------------------------------------------
        // SCENARIO COMPLETION & DEBRIEFING REPORT SCREEN
        // -------------------------------------------------------------
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center max-w-xl mx-auto space-y-5"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-none">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
              آفرین! سناریوی «{activeScenario.titleFa}» کامل شد
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              مهارت مکالمه و تلفظ شما در این موقعیت واقعی با موفقیت ثبت گردید.
            </p>
          </div>

          {/* Score & Rewards Cards */}
          <div className="w-full grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700">
              <div className="text-xs text-gray-500 dark:text-slate-400">میانگین نمره تلفظ</div>
              <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-latin mt-0.5">
                {averageScore}%
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700">
              <div className="text-xs text-gray-500 dark:text-slate-400">پاداش امتیاز XP</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 font-latin mt-0.5 flex items-center justify-center gap-1">
                <Sparkle className="w-4 h-4 fill-amber-500" />
                +45
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700">
              <div className="text-xs text-gray-500 dark:text-slate-400">اهداف محقق شده</div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-latin mt-0.5">
                {completedGoalsCount} / {goals.length}
              </div>
            </div>
          </div>

          {/* Goals Completed Checklist */}
          <div className="w-full p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-gray-900 dark:text-slate-100 mb-2">
              وضعیت اهداف مکالمه در این سناریو:
            </div>
            {goals.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-2 text-xs text-gray-800 dark:text-slate-200 p-2 rounded-xl bg-gray-50 dark:bg-slate-800/60"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{g.titleFa}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="w-full flex items-center gap-3">
            <button
              onClick={() => handleStartScenario(activeScenario)}
              className="flex-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>تکرار مجدد برای نمره ۱۰۰٪</span>
            </button>
            <button
              onClick={() => {
                audioService.playClickSound();
                setActiveScenario(null);
              }}
              className="flex-1 py-3.5 rounded-2xl bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-1.5"
            >
              <span>انتخاب سناریوی بعدی</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ) : (
        // -------------------------------------------------------------
        // ACTIVE INTERACTIVE DIALOGUE & PRONUNCIATION SIMULATION
        // -------------------------------------------------------------
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs justify-between">
          {/* Active Scenario Header Bar */}
          <div className="pb-3 border-b border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  audioService.playClickSound();
                  setActiveScenario(null);
                }}
                className="p-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-600 dark:text-slate-300"
                title="بازگشت به لیست سناریوها"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100">
                    {activeScenario.titleFa}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold font-latin">
                    {activeScenario.aiRole}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 font-latin truncate max-w-xs sm:max-w-md">
                  {activeScenario.situation}
                </p>
              </div>
            </div>

            {/* Goals completion tally & finish button */}
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {completedGoalsCount} از {goals.length} هدف
                </span>
              </div>
              <button
                onClick={handleFinishScenario}
                className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] transition-all"
              >
                پایان و گزارش
              </button>
            </div>
          </div>

          {/* Goal Checklist Accordion Strip */}
          <div className="my-2 p-2.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 text-xs flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-bold text-gray-600 dark:text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3 text-indigo-500" />
              اهداف مکالمه:
            </span>
            {goals.map((goal) => (
              <div
                key={goal.id}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                  goal.isCompleted
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600'
                }`}
              >
                {goal.isCompleted ? (
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                )}
                <span>{goal.titleFa}</span>
              </div>
            ))}
          </div>

          {/* Dialogue Conversation Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 px-1 py-2">
            {dialogueHistory.map((turn) => (
              <div
                key={turn.id}
                className={`flex flex-col ${turn.speaker === 'user' ? 'items-start' : 'items-end'}`}
              >
                <div className="text-[11px] text-gray-400 dark:text-slate-500 mb-1 px-1">
                  {turn.speakerName}
                </div>

                <div
                  className={`max-w-[92%] sm:max-w-[82%] rounded-3xl p-4 shadow-xs ${
                    turn.speaker === 'user'
                      ? 'bg-[#4F46E5] text-white rounded-br-none'
                      : 'bg-gray-50 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm sm:text-base font-latin leading-relaxed font-medium">
                      {turn.text}
                    </p>
                    <button
                      onClick={() =>
                        audioService.speak(
                          turn.text,
                          activeScenario.targetLanguage,
                          user.settings.ttsSpeed,
                        )
                      }
                      title="پخش صوت با تلفظ بومی"
                      className={`p-1.5 rounded-xl border shrink-0 transition-all active:scale-90 ${
                        turn.speaker === 'user'
                          ? 'bg-white/20 hover:bg-white/30 border-white/30 text-white'
                          : 'bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border-gray-200 dark:border-slate-600 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Persian Translation if available */}
                  {turn.translationFa && (
                    <div
                      className={`mt-2 pt-2 border-t text-xs leading-relaxed ${
                        turn.speaker === 'user'
                          ? 'border-white/20 text-indigo-100'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                      }`}
                    >
                      {turn.translationFa}
                    </div>
                  )}

                  {/* Word-level pronunciation breakdown if user scored */}
                  {turn.wordTokens && turn.wordTokens.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-2xl bg-black/20 backdrop-blur-xs border border-white/20 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span className="flex items-center gap-1 text-amber-300">
                          <Sparkles className="w-3.5 h-3.5" />
                          آنالیز کلمه به کلمه تلفظ:
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-latin font-bold">
                          نمره: {turn.pronunciationScore}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1 font-latin">
                        {turn.wordTokens.map((w, wIdx) => (
                          <span
                            key={wIdx}
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                              w.score >= 80
                                ? 'bg-emerald-500 text-white'
                                : w.score >= 50
                                ? 'bg-amber-400 text-gray-950'
                                : 'bg-rose-500 text-white'
                            }`}
                            title={`تطابق: ${w.score}%`}
                          >
                            {w.word}
                          </span>
                        ))}
                      </div>
                      {turn.feedbackFa && (
                        <p className="text-[11px] text-white/90 pt-1 border-t border-white/10">
                          {turn.feedbackFa}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Corrections on AI Turn if any */}
                  {turn.corrections && turn.corrections.length > 0 && (
                    <div className="mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-xs space-y-1 text-gray-900 dark:text-slate-100">
                      <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        نکته بهینه‌سازی لحن و گرامر:
                      </div>
                      {turn.corrections.map((c, i) => (
                        <div key={i} className="text-gray-800 dark:text-slate-200">
                          <span className="line-through text-rose-600 dark:text-rose-400 font-latin">
                            {c.original}
                          </span>
                          <span className="mx-1">→</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-latin font-bold">
                            {c.corrected}
                          </span>
                          <p className="text-[11px] text-gray-600 dark:text-slate-400 mt-0.5">
                            {c.explanationFa}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isEvaluating && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 p-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>در حال تحلیل تلفظ و پاسخ‌گویی در نقش {activeScenario.aiRole}...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Interactive Speaking & Pronunciation Practice Bar */}
          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2.5">
            {/* Suggested Phrase Prompt Card */}
            {selectedTargetPhrase && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                      جمله پیشنهادی برای تلفظ و پاسخ:
                    </span>
                    <button
                      onClick={() =>
                        audioService.speak(
                          selectedTargetPhrase,
                          activeScenario.targetLanguage,
                          user.settings.ttsSpeed,
                        )
                      }
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-slate-600 flex items-center gap-1 active:scale-95"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>شنیدن الگوی بومی</span>
                    </button>
                  </div>
                  <div className="text-sm font-latin font-bold text-gray-900 dark:text-slate-100">
                    "{selectedTargetPhrase}"
                  </div>
                </div>

                {/* Direct Pronounce & Record Action Button */}
                <button
                  onClick={() => handleToggleRecord(selectedTargetPhrase)}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 active:scale-95 shadow-xs shrink-0 ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>در حال ضبط و شنیدن...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>تلفظ این جمله و سنجش نمره</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Free Speech / Custom Input Bar */}
            <div className="flex items-center gap-2">
              {/* Mic toggle for free speaking */}
              <button
                onClick={() => handleToggleRecord()}
                title="صحبت آزاد و ضبط صدا"
                className={`p-3 rounded-2xl transition-all shadow-xs active:scale-90 ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-slate-700'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  handleEvaluateAndSend(customInputText, selectedTargetPhrase || customInputText)
                }
                placeholder={
                  isRecording
                    ? 'در حال گوش دادن به صدای شما...'
                    : 'یا جمله دلخواه خود را در این موقعیت تایپ یا بیان کنید...'
                }
                className="flex-1 py-3 px-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs sm:text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 font-latin focus:outline-none focus:border-indigo-500"
              />

              <button
                onClick={() =>
                  handleEvaluateAndSend(
                    customInputText || selectedTargetPhrase,
                    selectedTargetPhrase || customInputText,
                  )
                }
                disabled={!customInputText.trim() && !selectedTargetPhrase}
                className="px-4 py-3 rounded-2xl bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition-all active:scale-90 shadow-md shadow-indigo-100 dark:shadow-none flex items-center gap-1.5"
              >
                <span>ارسال</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
