import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Trophy,
  Star,
  CheckCircle2,
  Lock,
  Play,
  Volume2,
  BookOpen,
  Sparkles,
  Zap,
  Gem,
  Check,
  Calendar,
  Layers,
  Award,
  FileText,
  Lightbulb,
  Globe,
  Share2,
} from 'lucide-react';
import {
  CurriculumWeek,
  WeekStageLesson,
  Lesson,
  TargetLanguageCode,
  WeekProgressRecord,
} from '../../types';
import { audioService } from '../../services/audioService';
import { curriculumStorageService } from '../../services/curriculumStorageService';

interface WeekDetailModalProps {
  week: CurriculumWeek;
  targetLanguage: TargetLanguageCode;
  userId: string;
  weekProgress?: WeekProgressRecord;
  isUnlocked: boolean;
  onClose: () => void;
  onStartStage: (stage: WeekStageLesson) => void;
  onRefreshDB: () => void;
}

export const WeekDetailModal: React.FC<WeekDetailModalProps> = ({
  week,
  targetLanguage,
  userId,
  weekProgress,
  isUnlocked,
  onClose,
  onStartStage,
  onRefreshDB,
}) => {
  const [activeTab, setActiveTab] = useState<'stages' | 'vocab' | 'grammar' | 'notes'>('stages');
  const [notesText, setNotesText] = useState(weekProgress?.notes || '');
  const [notesSaved, setNotesSaved] = useState(false);

  const completedStageIds = weekProgress?.completedStageIds || [];
  const isMastered = weekProgress?.isWeekMastered || completedStageIds.length >= 5;

  const difficultyColors = {
    easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    hard: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    expert: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    master: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  const difficultyLabels = {
    easy: 'سطح آسان (Easy)',
    medium: 'سطح متوسط (Medium)',
    hard: 'سطح چالشی (Hard)',
    expert: 'سطح تخصصی (Expert)',
    master: 'سطح استادی (Mastery)',
  };

  const handlePlayVoice = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    audioService.speak(text, targetLanguage);
  };

  const handlePlayPersianVoice = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    audioService.speakPersian(text);
  };

  const handleSaveNotes = () => {
    curriculumStorageService.saveWeekNotes(userId, targetLanguage, week.weekNumber, notesText);
    setNotesSaved(true);
    audioService.playCorrectSound();
    onRefreshDB();
    setTimeout(() => setNotesSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[11px] shadow-xs">
                هفته {week.weekNumber} از ۵۲
              </span>
              <span className="px-2.5 py-0.5 rounded-full font-latin font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                سطح {week.level}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                فصل {week.quarter} • ماه {week.monthNumber}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${difficultyColors[week.difficulty]}`}
              >
                {difficultyLabels[week.difficulty]}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span>{week.titleFa}</span>
              {isMastered && (
                <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تکمیل شد</span>
                </span>
              )}
            </h2>
            <p className="text-xs font-latin text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
              {week.titleNative}
            </p>
          </div>

          <button
            onClick={() => {
              audioService.playClickSound();
              onClose();
            }}
            className="p-2 rounded-2xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Milestone Banner (If week is milestone) */}
        {week.isMilestone && (
          <div className="px-5 py-2.5 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border-b border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{week.milestoneTitleFa}</span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
              سنگ‌بنای سطح {week.level}
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <button
            onClick={() => {
              setActiveTab('stages');
              audioService.playClickSound();
            }}
            className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'stages'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>مراحل درس ({completedStageIds.length}/۵)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('vocab');
              audioService.playClickSound();
            }}
            className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'vocab'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>واژگان و جملات طلایی</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('grammar');
              audioService.playClickSound();
            }}
            className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'grammar'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>گرامر و فرهنگ</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('notes');
              audioService.playClickSound();
            }}
            className={`pb-2.5 px-3 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'notes'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>یادداشت شخصی</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: 5 STAGES OF THE WEEK */}
          {activeTab === 'stages' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-indigo-50/60 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200 font-bold">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>برنامه مرحله‌بندی شده ۵ روزه (روز ۱ تا ۵)</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-slate-300">
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>+{week.xpTotal} XP</span>
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Gem className="w-3.5 h-3.5" />
                    <span>+{week.gemTotal} الماس</span>
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {week.stages.map((stage, sIdx) => {
                  const isStageCompleted = completedStageIds.includes(stage.id);
                  // Stage is unlocked if week is unlocked and (it's stage 1 or previous stage is completed)
                  const isStageUnlocked =
                    isUnlocked && (sIdx === 0 || completedStageIds.includes(week.stages[sIdx - 1].id));

                  return (
                    <div
                      key={stage.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isStageCompleted
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                          : isStageUnlocked
                          ? 'bg-white dark:bg-slate-800/90 border-indigo-200 dark:border-indigo-800 shadow-xs hover:border-indigo-400'
                          : 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
                            isStageCompleted
                              ? 'bg-emerald-500 text-white'
                              : isStageUnlocked
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
                          }`}
                        >
                          {isStageCompleted ? <Check className="w-4 h-4" /> : sIdx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-slate-100">
                              {stage.titleFa}
                            </h4>
                            <span className="text-[10px] font-latin font-bold text-gray-400 dark:text-slate-500">
                              {stage.durationMinutes} دقیقه
                            </span>
                          </div>
                          <p className="text-[11px] font-latin text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                            {stage.titleNative}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-500 dark:text-slate-400">
                            <span>+{stage.xpReward} XP</span>
                            <span>+{stage.gemReward} الماس</span>
                            <span>{stage.exercises.length} تمرین تعاملی</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center shrink-0">
                        {isStageCompleted ? (
                          <button
                            onClick={() => {
                              audioService.playClickSound();
                              onStartStage(stage);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>مرور مجدد</span>
                          </button>
                        ) : isStageUnlocked ? (
                          <button
                            onClick={() => {
                              audioService.playClickSound();
                              onStartStage(stage);
                            }}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>شروع مرحله</span>
                          </button>
                        ) : (
                          <div className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 text-xs font-bold flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" />
                            <span>قفل</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: VOCABULARY & KEY SENTENCES */}
          {activeTab === 'vocab' && (
            <div className="space-y-5">
              {/* Key Native Phrases */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>جملات کلیدی و اصطلاحات طلایی این هفته:</span>
                </h4>
                <div className="space-y-2">
                  {week.keyPhrases.map((phrase, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs sm:text-sm font-extrabold font-latin text-indigo-700 dark:text-indigo-300">
                          {phrase.target}
                        </div>
                        {phrase.phonetic && (
                          <div className="text-[10px] text-gray-400 dark:text-slate-500 font-latin">
                            /{phrase.phonetic}/
                          </div>
                        )}
                        <div className="text-xs text-gray-700 dark:text-slate-300 mt-1 font-semibold">
                          معنی: {phrase.fa}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => handlePlayVoice(phrase.target, e)}
                          className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 transition-all"
                          title="تلفظ به زبان هدف"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handlePlayPersianVoice(phrase.fa, e)}
                          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 transition-all text-[10px] font-bold"
                          title="تلفظ صوتی فارسی"
                        >
                          🇮🇷 FA
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vocabulary Chips */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>دامنه واژگان هدف هفته:</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {week.vocabularyFocusFa.map((vocab, vIdx) => (
                    <span
                      key={vIdx}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700"
                    >
                      {vocab}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GRAMMAR & CULTURAL INSIGHTS */}
          {activeTab === 'grammar' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-900 dark:text-indigo-200">
                  <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>تمرکز گرامری و ساختار زبانی:</span>
                </div>
                <p className="text-xs text-gray-800 dark:text-slate-200 font-semibold leading-relaxed">
                  {week.grammarFocusFa}
                </p>
                <div className="text-[11px] font-latin text-indigo-700 dark:text-indigo-300 font-bold">
                  Rule: {week.grammarFocusNative}
                </div>
              </div>

              {week.culturalNoteFa && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 dark:text-amber-200">
                    <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>نکته فرهنگی و بین‌المللی:</span>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-100/90 leading-relaxed font-semibold">
                    {week.culturalNoteFa}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: USER NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                  یادداشت‌ها و نکات شخصی شما برای هفته {week.weekNumber}:
                </label>
                <span className="text-[10px] text-gray-400 dark:text-slate-500">ذخیره در دیتابیس محلی</span>
              </div>
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="نکات مهم، گرامر شخصی، یادآوری لغات سخت..."
                rows={4}
                className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-slate-100 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs active:scale-95 transition-all shadow-xs"
                >
                  ذخیره یادداشت در دیتابیس
                </button>
                {notesSaved && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    یادداشت ذخیره شد
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-900 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>نقشه جامع ۵۲ هفته (۱ ساله) • سطح {week.level}</span>
          </div>

          <button
            onClick={() => {
              audioService.playClickSound();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold text-xs hover:bg-gray-300 dark:hover:bg-slate-700 transition-all"
          >
            بستن
          </button>
        </div>
      </motion.div>
    </div>
  );
};
