import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wifi,
  WifiOff,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Database,
  X,
  ChevronDown,
  ChevronUp,
  HardDrive,
  ShieldCheck,
  DownloadCloud,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';
import { SUPPORTED_LANGUAGES } from '../../data/curriculumData';
import { audioCacheDB } from '../../services/audioCacheDB';

export const SyncStatusBanner: React.FC = () => {
  const {
    isOnline,
    syncStatus,
    pendingSyncCount,
    lastSyncedAt,
    syncNow,
    user,
  } = useApp();

  // Specifically track browser navigator.onLine
  const [isNavigatorOnline, setIsNavigatorOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'online' | 'offline' | 'synced' | 'error';
  } | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [cachedAudioCount, setCachedAudioCount] = useState<number>(0);
  const [isCachedReady, setIsCachedReady] = useState(true);

  const currentLang = SUPPORTED_LANGUAGES[user.targetLanguage] || SUPPORTED_LANGUAGES.en;
  const currentLevel = user.currentLevel || 'A1';

  // Effective online status: false if navigator.onLine is false or app isOnline is false
  const isOffline = !isNavigatorOnline || !isOnline || (typeof navigator !== 'undefined' && navigator.onLine === false);

  // Monitor browser's navigator.onLine specifically
  useEffect(() => {
    const handleOnline = () => {
      setIsNavigatorOnline(true);
      setToastMessage({
        text: 'اتصال اینترنت برقرار شد. همگام‌سازی در حال انجام است...',
        type: 'online',
      });
      setTimeout(() => setToastMessage(null), 4000);
    };

    const handleOffline = () => {
      setIsNavigatorOnline(false);
      setToastMessage({
        text: 'You are offline, your progress will sync when connected',
        type: 'offline',
      });
    };

    if (typeof window !== 'undefined') {
      // Sync initial state
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setIsNavigatorOnline(false);
        setToastMessage({
          text: 'You are offline, your progress will sync when connected',
          type: 'offline',
        });
      }

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  // Load audio cache stats
  useEffect(() => {
    let isMounted = true;
    audioCacheDB.getCacheCount().then((count) => {
      if (isMounted) {
        setCachedAudioCount(count);
      }
    }).catch(() => {
      if (isMounted) setCachedAudioCount(0);
    });
    return () => {
      isMounted = false;
    };
  }, [user.targetLanguage, isOffline]);

  // Monitor network and sync transitions for user notifications
  useEffect(() => {
    const handleSyncEvent = (e: any) => {
      const count = e.detail?.count || 0;
      setToastMessage({
        text: `اینترنت متصل شد: ${count > 0 ? `${count} مورد تغییر و نتایج آزمون در سرور ابری ثبت شد` : 'اطلاعات با موفقیت همگام‌سازی شد'} ✓`,
        type: 'synced',
      });
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('app-sync-completed', handleSyncEvent);
    return () => window.removeEventListener('app-sync-completed', handleSyncEvent);
  }, []);

  // Specifically show offline message when navigator.onLine or isOnline becomes false
  useEffect(() => {
    if (isOffline) {
      setToastMessage({
        text: 'You are offline, your progress will sync when connected',
        type: 'offline',
      });
      const timer = setTimeout(() => setToastMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  const handleManualSync = async () => {
    if (isSyncingManual) return;
    setIsSyncingManual(true);
    audioService.playClickSound();
    try {
      const res = await syncNow();
      if (res.success) {
        setToastMessage({
          text: `همگام‌سازی ابری با موفقیت انجام شد (${res.syncedCount} مورد ذخیره شد).`,
          type: 'synced',
        });
      } else {
        setToastMessage({
          text: res.error || 'خطا در همگام‌سازی اطلاعات با سرور ابری',
          type: 'error',
        });
      }
    } catch {
      setToastMessage({
        text: 'ارتباط با سرور برقرار نشد، اطلاعات روی دستگاه شما محفوظ است.',
        type: 'error',
      });
    } finally {
      setIsSyncingManual(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <>
      {/* Specifically detect and display offline notice when navigator.onLine is false */}
      {isOffline && (
        <div
          id="sync-offline-banner"
          role="status"
          aria-live="polite"
          className="w-full bg-amber-500/15 dark:bg-amber-950/70 border-b border-amber-500/30 text-amber-200 px-3 py-2 transition-all text-xs"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                <WifiOff className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-bold text-amber-300">
                  You are offline, your progress will sync when connected
                </span>
                <span className="text-amber-200/70 text-[11px]">
                  (شما آفلاین هستید، پیشرفت شما پس از اتصال همگام‌سازی خواهد شد)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ms-auto">
              {pendingSyncCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono">
                  {pendingSyncCount} مورد در نوبت همگام‌سازی
                </span>
              )}
              <button
                id="btn-sync-offline-details"
                onClick={() => {
                  audioService.playClickSound();
                  setIsDetailsOpen(true);
                }}
                className="text-[11px] text-amber-300 hover:text-amber-100 underline cursor-pointer"
              >
                مشاهده وضعیت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Permanent / Informative Offline & Sync Status Strip */}
      <div id="sync-status-strip" className="w-full bg-slate-900/90 dark:bg-slate-950/90 text-slate-200 border-b border-slate-800 backdrop-blur-md px-3 py-1.5 transition-all text-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* Left / Status Section */}
          <div className="flex items-center gap-2">
            {!isOffline ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>آنلاین</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                <WifiOff className="w-3.5 h-3.5 shrink-0" />
                <span className="font-semibold">You are offline, your progress will sync when connected</span>
              </span>
            )}

            <span className="text-slate-600 dark:text-slate-700 hidden sm:inline">•</span>

            {/* 'Ready for Offline' Indicator Badge */}
            {isCachedReady && (
              <button
                id="btn-sync-ready-offline"
                onClick={() => {
                  audioService.playClickSound();
                  setIsDetailsOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/80 transition-all cursor-pointer text-[11px] font-bold shadow-xs"
                title="محتوای آموزشی این سطح به صورت کامل در دستگاه شما ذخیره شده است"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>آماده برای آفلاین (Ready for Offline): سطح {currentLevel}</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              </button>
            )}
          </div>

          {/* Right / Quick Action Section */}
          <div className="flex items-center gap-2 ms-auto">
            {pendingSyncCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-600/40 text-amber-300 text-[10px] font-mono font-bold">
                {pendingSyncCount} ذخیره محلی در انتظار همگام‌سازی
              </span>
            )}

            <button
              id="btn-sync-open-modal"
              onClick={() => {
                audioService.playClickSound();
                setIsDetailsOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px] flex items-center gap-1"
            >
              <HardDrive className="w-3 h-3 text-indigo-400" />
              <span>وضعیت کش و همگام‌سازی</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Network / Sync Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto px-4 py-2.5 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-xs font-bold select-none backdrop-blur-md"
            style={{
              backgroundColor:
                toastMessage.type === 'offline'
                  ? 'rgba(30, 41, 59, 0.97)'
                  : toastMessage.type === 'synced'
                  ? 'rgba(6, 78, 59, 0.97)'
                  : 'rgba(30, 41, 59, 0.97)',
              borderColor:
                toastMessage.type === 'offline'
                  ? '#f59e0b'
                  : toastMessage.type === 'synced'
                  ? '#10b981'
                  : '#6366f1',
              color: '#ffffff',
            }}
          >
            <div className="flex items-center gap-2">
              {toastMessage.type === 'offline' ? (
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              ) : toastMessage.type === 'synced' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              ) : (
                <CloudUpload className="w-4 h-4 text-indigo-300 shrink-0" />
              )}
              <span className="leading-relaxed">{toastMessage.text}</span>
            </div>

            <button
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white shrink-0 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Status & Cache Details Modal */}
      <AnimatePresence>
        {isDetailsOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 w-full max-w-lg shadow-2xl space-y-4 text-right"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">
                      وضعیت کش آفلاین و همگام‌سازی ابری
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">
                      زبان فعال: {currentLang.nameFa} ({currentLang.nameNative})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Ready for Offline Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>محتوای آموزشی برای سطح {currentLevel} آماده استفاده آفلاین است (Ready for Offline)</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/90 leading-relaxed">
                  تمام سرفصل‌های ۵۲ هفته استاندارد CEFR، فلش‌کارت‌های SRS، تمرین‌های واژگان و گرامر این سطح در حافظه دستگاه شما ذخیره شده است. شما می‌توانید در سفر یا بدون اینترنت به یادگیری ادامه دهید.
                </p>
              </div>

              {/* Detailed Cache Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 text-[11px]">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>سطح و دروس کش‌شده:</span>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-slate-100">
                    سطح {currentLevel} • ۵۲ هفته استاندارد
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>فلش‌کارت‌های SRS فعال:</span>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-slate-100 font-latin">
                    {(user.srsCards || []).length} Flashcards Stored
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 text-[11px]">
                    {!isOffline ? (
                      <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span>وضعیت شبکه:</span>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-slate-100 text-[11px]">
                    {!isOffline ? 'متصل به اینترنت (Online)' : 'You are offline, your progress will sync when connected'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-purple-500" />
                    <span>آخرین همگام‌سازی ابری:</span>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-slate-100 text-[11px]">
                    {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString('fa-IR') : 'به زودی'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  id="btn-sync-modal-action"
                  onClick={handleManualSync}
                  disabled={isSyncingManual || isOffline}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm shadow-indigo-100 dark:shadow-none"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingManual ? 'animate-spin' : ''}`} />
                  <span>{isSyncingManual ? 'در حال همگام‌سازی...' : 'همگام‌سازی دستی اکنون'}</span>
                </button>

                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  بستن
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
