import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wifi,
  WifiOff,
  CloudUpload,
  CloudCheck,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  X,
  FileText,
  Sparkles,
  Award,
  Activity,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';

interface SyncManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncManagerModal: React.FC<SyncManagerModalProps> = ({ isOpen, onClose }) => {
  const {
    isOnline,
    syncStatus,
    pendingSyncCount,
    lastSyncedAt,
    lastSyncMessage,
    syncLogs,
    syncNow,
    clearSyncQueue,
    checkConnectivity,
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsRefreshing(true);
    audioService.playClickSound();
    const res = await syncNow();
    setIsRefreshing(false);
    if (res.success) {
      audioService.playCorrectSound();
      setTestResult(`همگام‌سازی با موفقیت انجام شد (${res.syncedCount} مورد ثبت شد).`);
    } else {
      audioService.playWrongSound();
      setTestResult(`خطا در همگام‌سازی: ${res.error || 'ارتباط با سرور برقرار نشد'}`);
    }
    setTimeout(() => setTestResult(null), 4000);
  };

  const handleTestConnection = async () => {
    setIsRefreshing(true);
    audioService.playClickSound();
    const online = await checkConnectivity();
    setIsRefreshing(false);
    if (online) {
      setTestResult('ارتباط با سرور و دیتابیس پایدار و فعال است ✓');
    } else {
      setTestResult('سرور یا اینترنت در دسترس نیست (حالت آفلاین)');
    }
    setTimeout(() => setTestResult(null), 4000);
  };

  const formatPersianTime = (iso?: string | null) => {
    if (!iso) return 'هنوز ثبت نشده است';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + d.toLocaleDateString('fa-IR');
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <span>همگام‌سازی پس‌زمینه و دیتابیس ابری</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                پایش لحظه‌ای شبکه، ذخیره‌سازی آفلاین و همگام‌سازی خودکار نتایج
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioService.playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Status Summary Banner */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">وضعیت اتصال:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isOnline
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {isOnline ? (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                      <span>آنلاین و متصل به سرور</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                      <span>آفلاین (Offline Mode)</span>
                    </>
                  )}
                </span>
              </div>

              {/* Status Pill */}
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg font-latin ${
                  syncStatus === 'synced'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : syncStatus === 'syncing'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 animate-pulse'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                }`}
              >
                {syncStatus === 'synced'
                  ? 'Cloud Synced ✓'
                  : syncStatus === 'syncing'
                  ? 'Syncing...'
                  : syncStatus === 'offline'
                  ? 'Local Queued'
                  : 'Pending'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200/80 dark:border-slate-700">
              <div>
                <span className="text-gray-500 dark:text-slate-400 block text-[11px]">موارد در صف همگام‌سازی:</span>
                <span className="font-latin font-bold text-gray-900 dark:text-slate-100 text-sm">
                  {pendingSyncCount} مورد
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400 block text-[11px]">آخرین همگام‌سازی ابری:</span>
                <span className="font-latin font-semibold text-gray-800 dark:text-slate-200 text-xs">
                  {formatPersianTime(lastSyncedAt)}
                </span>
              </div>
            </div>

            {testResult && (
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 font-bold flex items-center gap-1.5 animate-fadeIn">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>{testResult}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleManualSync}
              disabled={isRefreshing || !isOnline}
              className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>همگام‌سازی اکنون (Sync Now)</span>
            </button>

            <button
              onClick={handleTestConnection}
              disabled={isRefreshing}
              className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-gray-200 dark:border-slate-700 active:scale-95 transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-gray-500" />
              <span>تست پایداری ارتباط</span>
            </button>
          </div>

          {/* How Background Sync Works Info */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>مکانیزم پایش هوشمند اتصال (Offline-to-Cloud Sync)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800/90 dark:text-blue-300">
              هر زمان اتصال اینترنت قطع شود، تمام پیشرفت‌های شما (شامل نتایج آزمون‌های بین‌المللی، امتیازات XP، کارت‌های لایتنر و مراحل درس‌ها) در صف ایمن محلی ذخیره می‌شوند و به محض اتصال مجدد به اینترنت، به صورت خودکار به پایگاه داده سرور منتقل می‌گردند.
            </p>
          </div>

          {/* Sync Activity Logs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                تاریخچه رویدادهای همگام‌سازی:
              </span>
              {pendingSyncCount > 0 && (
                <button
                  onClick={() => {
                    audioService.playClickSound();
                    clearSyncQueue();
                  }}
                  className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>تخلیه صف</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {syncLogs.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  هنوز رویداد همگام‌سازی ثبت نشده است.
                </div>
              ) : (
                syncLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200/70 dark:border-slate-800 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            log.status === 'success'
                              ? 'bg-emerald-500'
                              : log.status === 'failed'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span className="font-bold text-gray-900 dark:text-slate-100">{log.titleFa}</span>
                      </div>
                      {log.details && (
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 pr-3.5">
                          {log.details}
                        </p>
                      )}
                    </div>

                    <span className="text-[10px] text-gray-400 font-latin shrink-0 pt-0.5">
                      {formatPersianTime(log.timestamp).split(' - ')[0]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={() => {
              audioService.playClickSound();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs transition-all"
          >
            بستن پنجره
          </button>
        </div>
      </motion.div>
    </div>
  );
};
