import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Volume2,
  VolumeX,
  Languages,
  Moon,
  Sun,
  Laptop,
  Sparkles,
  Download,
  Upload,
  Trash2,
  Share2,
  Info,
  CheckCircle2,
  RotateCcw,
  Sliders,
  ShieldCheck,
  User,
  Heart,
  Bell,
  BellRing,
  Clock,
  Database,
  CloudUpload,
  Smartphone,
  Award,
  Code2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EXPLANATION_LANGUAGES, SUPPORTED_LANGUAGES, ALL_UNITS_BY_LANG } from '../../data/curriculumData';
import { DIALOGUE_ROLEPLAY_SCENARIOS } from '../../data/dialogueRoleplayData';
import { TargetLanguageCode, ExplanationLanguageCode } from '../../types';
import { audioService } from '../../services/audioService';
import { audioCacheDB } from '../../services/audioCacheDB';
import { notificationService } from '../../services/notificationService';
import { PWAInstallModal } from '../PWA/PWAInstallModal';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const SettingsView: React.FC = () => {
  const {
    user,
    setUser,
    profiles,
    switchProfile,
    createProfile,
    updateCurrentProfileName,
    setIsProfileModalOpen,
    setTargetLanguage,
    setExplanationLanguage,
    updateSettings,
    resetProgress,
    isOnline,
    pendingSyncCount,
    setIsSyncModalOpen,
  } = useApp();

  const { isInstallable, isInstalled } = usePWAInstall();
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [firstNameInput, setFirstNameInput] = useState(user.firstName || '');
  const [lastNameInput, setLastNameInput] = useState(user.lastName || '');
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [bgSyncRegistered, setBgSyncRegistered] = useState(false);
  const [audioCacheCount, setAudioCacheCount] = useState(0);
  const [isCachingAudio, setIsCachingAudio] = useState(false);
  const [audioCacheSuccess, setAudioCacheSuccess] = useState(false);
  const [isTestingPersianVoice, setIsTestingPersianVoice] = useState(false);
  const [isTestingTargetVoice, setIsTestingTargetVoice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync inputs whenever active user profile changes
  useEffect(() => {
    setFirstNameInput(user.firstName || '');
    setLastNameInput(user.lastName || '');
    audioCacheDB.getCacheCount().then(setAudioCacheCount);
  }, [user.id, user.firstName, user.lastName]);

  const handlePreloadAllAudioAssets = async () => {
    audioService.playClickSound();
    setIsCachingAudio(true);
    try {
      const phrases: { text: string; lang: string }[] = [];

      // 1. Collect from roleplay scenarios
      DIALOGUE_ROLEPLAY_SCENARIOS.forEach((sc) => {
        sc.starterMessages.forEach((sm) => phrases.push({ text: sm.text, lang: sc.targetLanguage }));
        if (sc.suggestedPhrases) {
          sc.suggestedPhrases.forEach((sp) => phrases.push({ text: sp, lang: sc.targetLanguage }));
        }
        if (sc.dialogueScript) {
          sc.dialogueScript.forEach((ds) => phrases.push({ text: ds.text, lang: sc.targetLanguage }));
        }
      });

      // 2. Collect from curriculum data
      Object.entries(ALL_UNITS_BY_LANG).forEach(([langCode, units]) => {
        units.forEach((unit) => {
          unit.lessons.forEach((lesson) => {
            lesson.exercises.forEach((ex) => {
              if (ex.targetAudioText) phrases.push({ text: ex.targetAudioText, lang: langCode });
              if (ex.correctAnswer) {
                if (typeof ex.correctAnswer === 'string') {
                  phrases.push({ text: ex.correctAnswer, lang: langCode });
                } else if (Array.isArray(ex.correctAnswer)) {
                  ex.correctAnswer.forEach((ans) => phrases.push({ text: String(ans), lang: langCode }));
                }
              }
              if (ex.wordTiles) {
                ex.wordTiles.forEach((tile) => phrases.push({ text: tile, lang: langCode }));
              }
            });
          });
        });
      });

      // Save to IndexedDB
      await audioCacheDB.preloadEssentialOfflinePhrases(phrases);
      const count = await audioCacheDB.getCacheCount();
      setAudioCacheCount(count);
      setAudioCacheSuccess(true);
      audioService.playFanfareSound();
      setTimeout(() => setAudioCacheSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to cache audio in IndexedDB:', err);
    } finally {
      setIsCachingAudio(false);
    }
  };

  const handleClearAudioCache = async () => {
    audioService.playClickSound();
    await audioCacheDB.clearCache();
    setAudioCacheCount(0);
  };

  const handleSaveName = () => {
    const fName = firstNameInput.trim();
    const lName = lastNameInput.trim();
    if (!fName && !lName) return;
    updateCurrentProfileName(fName || user.name || 'کاربر', lName);
    setNameSavedSuccess(true);
    audioService.playCorrectSound();
    setTimeout(() => setNameSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    audioService.playClickSound();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hossein_fatemeh_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.id || parsed.name || parsed.xp !== undefined)) {
          setUser(parsed);
          setImportSuccess(true);
          audioService.playFanfareSound();
          setTimeout(() => setImportSuccess(false), 4000);
        } else {
          alert('فرمت فایل پشتیبان نامعتبر است.');
        }
      } catch {
        alert('خطا در بارگذاری یا خواندن فایل پشتیبان.');
      }
    };
    reader.readAsText(file);
  };

  const handleSimulateOfflineDownload = () => {
    audioService.playClickSound();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleRequestNotificationPermission = async () => {
    audioService.playClickSound();
    const permission = await notificationService.requestPermission();
    if (permission === 'granted') {
      updateSettings({ notificationsEnabled: true });
      await notificationService.showNotification({
        title: '🔔 یادآور هوشمند آموزش زبان',
        body: `سلام ${user.firstName || user.name}! یادآور روزانه فعال شد. زنجیره مطالعه ${user.streak || 0} روزه خود را حفظ کنید.`,
        tag: 'daily-reminder',
        actions: [
          { action: 'open_lesson', title: '🚀 شروع درس ۵۲ هفته' },
          { action: 'open_flashcards', title: '🃏 مرور لایتنر' },
        ],
      });
      await notificationService.registerBackgroundSync('sync-progress');
      await notificationService.registerPeriodicSync('daily-reminder-sync');
      setTestNotificationSent(true);
      audioService.playCorrectSound();
      setTimeout(() => setTestNotificationSent(false), 4000);
    } else if (permission === 'denied') {
      updateSettings({ notificationsEnabled: false });
      alert('دسترسی به اعلان‌ها مسدود شده است. لطفاً در تنظیمات مرورگر اجازه اعلان (Notification) را صادر کنید.');
    } else {
      updateSettings({ notificationsEnabled: true });
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 4000);
    }
  };

  const handleTriggerBackgroundSync = async () => {
    audioService.playClickSound();
    await notificationService.registerBackgroundSync('sync-progress');
    setBgSyncRegistered(true);
    audioService.playCorrectSound();
    setTimeout(() => setBgSyncRegistered(false), 3500);
  };

  const currentTargetLangInfo = SUPPORTED_LANGUAGES[user.targetLanguage] || SUPPORTED_LANGUAGES.en;

  return (
    <div className="pb-28 max-w-xl mx-auto px-4 pt-4 space-y-6 select-none">
      {/* Profile Card & Multi-User Switcher */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
              {user.avatar && (user.avatar.startsWith('data:') || user.avatar.startsWith('http') || user.avatar.startsWith('/') || user.avatar.length > 10) ? (
                <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl leading-none">{user.avatar || '🦁'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">
                  {user.firstName ? `${user.firstName} ${user.lastName}` : user.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                  کاربر فعال
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                سطح علمی: {user.currentLevel} • لول {user.level} • {user.xp} XP
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsProfileModalOpen(true);
              audioService.playClickSound();
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>مدیریت کاربران</span>
          </button>
        </div>

        {/* Edit Name / Surname */}
        <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-3">
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
            ویرایش نام و نام خانوادگی اختصاصی:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={firstNameInput}
              onChange={(e) => setFirstNameInput(e.target.value)}
              placeholder="نام (مثال: حسین)"
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
            />
            <input
              type="text"
              value={lastNameInput}
              onChange={(e) => setLastNameInput(e.target.value)}
              placeholder="نام خانوادگی (مثال: اسدی)"
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={handleSaveName}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              ذخیره نام و نام خانوادگی
            </button>
            {nameSavedSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                اطلاعات ذخیره شد
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Target Language Selection (زبان در حال یادگیری) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
            <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            زبان در حال یادگیری شما
          </h4>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <span>{currentTargetLangInfo.flag}</span>
            <span>{currentTargetLangInfo.nameFa}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.values(SUPPORTED_LANGUAGES).map((lang) => {
            const isSelected = user.targetLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setTargetLanguage(lang.code as TargetLanguageCode);
                  audioService.playClickSound();
                }}
                className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-xs ring-1 ring-indigo-500'
                    : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="text-right leading-tight">
                  <div className="font-extrabold">{lang.nameFa}</div>
                  <div className="text-[10px] text-gray-400 dark:text-slate-500 font-latin">{lang.nameNative}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme / OS System Preference */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
          <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          تم ظاهری و هماهنگی با سیستم‌عامل
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              updateSettings({ theme: 'light' });
              audioService.playClickSound();
            }}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              user.settings.theme === 'light'
                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-700 dark:text-indigo-300'
                : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>روشن</span>
          </button>

          <button
            onClick={() => {
              updateSettings({ theme: 'dark' });
              audioService.playClickSound();
            }}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              user.settings.theme === 'dark'
                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-700 dark:text-indigo-300'
                : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>تاریک (Dark)</span>
          </button>

          <button
            onClick={() => {
              updateSettings({ theme: 'system' });
              audioService.playClickSound();
            }}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              user.settings.theme === 'system'
                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-700 dark:text-indigo-300'
                : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
            }`}
          >
            <Laptop className="w-4 h-4 text-slate-500" />
            <span>سیستم‌عامل</span>
          </button>
        </div>
      </div>

      {/* 24-Hour Daily Practice Reminder Notifications */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-500" />
            اعلان یادآوری تمرین در پایان ۲۴ ساعت
          </h4>
          <button
            onClick={() => {
              const nextVal = !user.settings.notificationsEnabled;
              updateSettings({ notificationsEnabled: nextVal });
              if (nextVal) {
                handleRequestNotificationPermission();
              }
            }}
            className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
              user.settings.notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-all absolute top-1 ${
                user.settings.notificationsEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
          برای حفظ استریک (Streak) و پیشگیری از فراموشی، در پایان هر ۲۴ ساعت یک پیام یادآوری دریافت خواهید کرد.
        </p>

        {user.settings.notificationsEnabled && (
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                هدف زمان مطالعه روزانه:
              </span>
              <span className="font-latin font-bold text-indigo-600 dark:text-indigo-400">
                {user.settings.dailyGoalMinutes || 15} دقیقه در روز
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    updateSettings({ dailyGoalMinutes: mins });
                    audioService.playClickSound();
                  }}
                  className={`py-2 rounded-xl text-xs font-latin font-bold transition-all cursor-pointer ${
                    (user.settings.dailyGoalMinutes || 15) === mins
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {mins} دقیقه {mins === 15 && '⭐'}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-gray-600 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                ساعت یادآوری روزانه:
              </span>
              <span className="font-latin font-bold text-indigo-600 dark:text-indigo-400">
                {String(user.settings.dailyReminderHour ?? 20).padStart(2, '0')}:00 (ساعت {user.settings.dailyReminderHour ?? 20})
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[8, 14, 20, 22].map((hour) => (
                <button
                  key={hour}
                  onClick={() => {
                    updateSettings({ dailyReminderHour: hour });
                    audioService.playClickSound();
                  }}
                  className={`py-2 rounded-xl text-xs font-latin font-bold transition-all cursor-pointer ${
                    user.settings.dailyReminderHour === hour
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {String(hour).padStart(2, '0')}:00
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRequestNotificationPermission}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-100 transition-all cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>ارسال تست اعلان</span>
                </button>

                <button
                  onClick={handleTriggerBackgroundSync}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-100 transition-all cursor-pointer"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>ثبت همگام‌سازی پس‌زمینه (Sync)</span>
                </button>
              </div>

              {testNotificationSent && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  اعلان با موفقیت ارسال شد!
                </span>
              )}

              {bgSyncRegistered && (
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  همگام‌سازی خودکار در پس‌زمینه ثبت شد!
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Language & Voice Settings */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-4 shadow-xs">
        <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
          <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          تنظیمات زبان و صوت آموزشی (پخش سریع و روان)
        </h4>

        {/* Explanation Language */}
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500 dark:text-slate-400">زبان راهنما و توضیحات گرامری:</label>
          <div className="grid grid-cols-2 gap-2">
            {EXPLANATION_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setExplanationLanguage(lang.code as ExplanationLanguageCode)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  user.explanationLanguage === lang.code
                    ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-900 dark:text-indigo-200'
                    : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Speaker Tests */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Persian Voice Test */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Volume2 className={`w-4 h-4 text-emerald-600 ${isTestingPersianVoice ? 'animate-bounce' : ''}`} />
                تلفظ صوتی فارسی
              </span>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">تست خواندن فارسی</p>
            </div>
            <button
              onClick={() => {
                setIsTestingPersianVoice(true);
                audioService.speakPersian(
                  'سلام! صدای فارسی پلتفرم آموزشی حسین و فاطمه فعال و آماده است.',
                  0.95,
                  () => setIsTestingPersianVoice(false),
                );
                // Fallback timeout in case onEnd is delayed
                setTimeout(() => setIsTestingPersianVoice(false), 3500);
              }}
              disabled={isTestingPersianVoice}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                isTestingPersianVoice
                  ? 'bg-emerald-700 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <span>{isTestingPersianVoice ? 'در حال پخش...' : 'تست فارسی'}</span>
            </button>
          </div>

          {/* Target Language Voice Test */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Volume2 className={`w-4 h-4 text-indigo-600 ${isTestingTargetVoice ? 'animate-bounce' : ''}`} />
                تلفظ {currentTargetLangInfo.nameFa}
              </span>
              <p className="text-[10px] text-indigo-700 dark:text-indigo-400">تست تلفظ زبان هدف</p>
            </div>
            <button
              onClick={() => {
                setIsTestingTargetVoice(true);
                audioService.speak(
                  currentTargetLangInfo.greeting,
                  currentTargetLangInfo.defaultVoiceLocale,
                  user.settings.ttsSpeed,
                  () => setIsTestingTargetVoice(false),
                );
                setTimeout(() => setIsTestingTargetVoice(false), 3000);
              }}
              disabled={isTestingTargetVoice}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                isTestingTargetVoice
                  ? 'bg-indigo-700 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <span>{isTestingTargetVoice ? 'در حال پخش...' : `تست ${currentTargetLangInfo.flag}`}</span>
            </button>
          </div>
        </div>

        {/* TTS Speed */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-slate-400">سرعت پیش‌فرض پخش تلفظ و ویس معلم:</span>
            <span className="font-latin font-bold text-indigo-600 dark:text-indigo-400">{user.settings.ttsSpeed}x</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[0.5, 0.75, 1.0, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  updateSettings({ ttsSpeed: speed });
                  audioService.playClickSound();
                }}
                className={`py-2 rounded-xl text-xs font-latin font-bold transition-all cursor-pointer ${
                  user.settings.ttsSpeed === speed
                    ? 'bg-[#4F46E5] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Sound Effects Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800 text-xs">
          <span className="text-gray-700 dark:text-slate-300">افکت‌های صوتی کلیک و تشویق (Sound Effects)</span>
          <button
            onClick={() => updateSettings({ soundEffects: !user.settings.soundEffects })}
            className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
              user.settings.soundEffects ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-all absolute top-1 ${
                user.settings.soundEffects ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Toggle Auto Play */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800 text-xs">
          <span className="text-gray-700 dark:text-slate-300">پخش خودکار صدای سوالات و کلمات</span>
          <button
            onClick={() => updateSettings({ autoPlayAudio: !user.settings.autoPlayAudio })}
            className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
              user.settings.autoPlayAudio ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-all absolute top-1 ${
                user.settings.autoPlayAudio ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Offline Audio Assets & IndexedDB Storage */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>کش صوتی آفلاین معلم هوشمند (IndexedDB Audio Cache)</span>
          </h4>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-latin">
            {audioCacheCount} صوت ذخیره‌شده
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
          برای امکان تمرین مکالمه، سناریوهای نقش‌آفرینی و شنیدن تلفظ کلمات حتی در زمان قطع کامل اینترنت، صداها و فایل‌های گفتاری در پایگاه داده داخلی مرورگر (IndexedDB) کش می‌شوند.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePreloadAllAudioAssets}
            disabled={isCachingAudio}
            className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isCachingAudio ? 'در حال ذخیره‌سازی در IndexedDB...' : 'دانلود و کش تمام صداهای سناریوها و دروس'}</span>
          </button>

          {audioCacheCount > 0 && (
            <button
              onClick={handleClearAudioCache}
              className="py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاکسازی کش</span>
            </button>
          )}
        </div>

        {audioCacheSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تمامی دارایی‌های صوتی با موفقیت در حافظه IndexedDB ذخیره شدند!</span>
          </div>
        )}
      </div>

      {/* Offline Storage & Cloud Sync */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>پایش شبکه و همگام‌سازی پس‌زمینه (Background Cloud Sync)</span>
          </h4>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isOnline
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
            }`}
          >
            {isOnline ? 'شبکه فعال ✓' : 'حالت آفلاین'}
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
          تمام درس‌ها، فلش‌کارت‌ها و نتایج آزمون‌های شما ابتدا به صورت ایمن در حافظه محلی ثبت شده و به محض پایداری یا بازگشت اتصال اینترنت، به صورت خودکار به دیتابیس سرور ابری منتقل می‌گردند.
        </p>

        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-500 dark:text-slate-400 block text-[11px]">موارد در صف همگام‌سازی:</span>
            <span className="font-latin font-bold text-gray-900 dark:text-slate-100">{pendingSyncCount} مورد در صف</span>
          </div>
          <button
            onClick={() => {
              setIsSyncModalOpen(true);
              audioService.playClickSound();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>مدیریت صف و همگام‌سازی</span>
          </button>
        </div>

        <button
          onClick={handleSimulateOfflineDownload}
          className="w-full py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>{downloadSuccess ? 'پک کامل داده‌ها آفلاین است ✓' : 'بررسی و بارگذاری داده‌های آفلاین'}</span>
        </button>
      </div>

      {/* PWA Direct Installation Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 space-y-3 shadow-lg text-right">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 p-1.5 flex items-center justify-center text-white shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>نصب اپلیکیشن روی گوشی و ویندوز (PWA)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-latin font-bold border border-emerald-500/30">
                  Native
                </span>
              </h4>
              <p className="text-[11px] text-indigo-200/80">
                اجرای بدون مرورگر، تمام‌صفحه و با پشتیبانی کامل آفلاین
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          با نصب نسخه PWA، آیکون برنامه در صفحه اصلی گوشی شما (اندروید و آیفون) یا دسکتاپ قرار گرفته و می‌توانید بدون نیاز به دانلود از بازار یا گوگل‌پلی مستقیماً از آن استفاده کنید.
        </p>

        <button
          onClick={() => {
            setShowPwaModal(true);
            audioService.playClickSound();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 active:scale-98 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{isInstalled ? 'مشاهده اطلاعات و تنظیمات نسخه نصب‌شده PWA' : 'نصب مستقیم اپلیکیشن PWA روی دستگاه'}</span>
        </button>
      </div>

      {/* Direct Source & Android Project Download */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-700/50 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-indigo-100">
              دانلود مستقیم فایل زیپ (ZIP) برای موبایل و اندروید
            </h4>
            <p className="text-[11px] text-indigo-200/80">
              پکیج کامل و آماده انتشار شامل پروژه اندروید (Capacitor) با شناسه ir.hosseinfateme.app و تمام فایل‌های وب و دارایی‌ها
            </p>
          </div>
        </div>

        <a
          id="btn-direct-source-download"
          href="/api/download-zip"
          download="hossein-fateme-mobile-app.zip"
          className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-900/40 active:scale-98 transition-all cursor-pointer no-underline"
        >
          <Download className="w-4 h-4" />
          <span>دانلود فایل زیپ پروژه موبایل (ZIP - ۵.۲ مگابایت)</span>
        </a>
      </div>

      {/* Backup & Restore */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          پشتیبان‌گیری و بازیابی داده‌ها
        </h4>

        {/* Hidden file input for restore */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportBackup}
          accept=".json"
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportBackup}
            className="py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>دانلود پشتیبان (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>بازیابی فایل پشتیبان</span>
          </button>
        </div>

        {importSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>اطلاعات پشتیبان با موفقیت بازیابی شد!</span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={() => setConfirmReset(!confirmReset)}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{confirmReset ? 'آیا مطمئنید؟' : 'شروع مجدد و ریست کل پیشرفت'}</span>
          </button>
        </div>

        {confirmReset && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-2">
            <p>با ریست کردن، تمام پیشرفت، امتیازها و نمرات آزمون‌ها پاک می‌شود.</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs cursor-pointer"
              >
                بله، بازنشانی شود
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        )}
      </div>

      {/* About App & Creator Attribution */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 font-bold text-2xl mx-auto flex items-center justify-center shadow-xs">
          🌟
        </div>
        
        <div className="space-y-1">
          <h4 className="text-base font-extrabold text-gray-900 dark:text-slate-100">
            اپلیکیشن آموزش زبان «حسین و فاطمه»
          </h4>
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            پلتفرم هوشمند، جامع و ۵۲ هفته‌ای آموزش زبان با متدولوژی‌های روز، معلم هوش مصنوعی و آزمون‌های بین‌المللی.
          </p>
        </div>

        {/* Creator Attribution Section */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/70 dark:via-purple-950/70 dark:to-pink-950/70 border border-indigo-200/80 dark:border-indigo-800/80 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-indigo-900 dark:text-indigo-200">
            <Award className="w-4 h-4 text-amber-500" />
            <span>سازنده برنامه: حسین اسدی</span>
          </div>
          <p className="text-[11px] text-gray-700 dark:text-slate-300 font-medium">
            سازنده برنامه حسین اسدی هست
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-indigo-700 dark:text-indigo-400 font-latin font-bold pt-1">
            <span>Developed & Designed by Hossein Asadi</span>
          </div>
        </div>

        <div className="text-[10px] text-gray-400 dark:text-slate-500 font-latin pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <span>Version 2.5.0 Pro</span>
          <span>© All Rights Reserved</span>
        </div>
      </div>

      {/* PWA Progressive Web App Install Modal */}
      <PWAInstallModal
        isOpen={showPwaModal}
        onClose={() => setShowPwaModal(false)}
      />
    </div>
  );
};

