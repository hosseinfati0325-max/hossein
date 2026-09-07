import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  Zap,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Activity,
  Gauge,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Database,
  CloudUpload,
  Cpu,
  Smartphone,
} from 'lucide-react';
import { useDeviceStatus } from '../../hooks/useDeviceStatus';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';

interface DeviceDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceDiagnosticsModal: React.FC<DeviceDiagnosticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { battery, network, measurePing, isMeasuringPing } = useDeviceStatus();
  const { syncStatus, pendingSyncCount, setIsSyncModalOpen } = useApp();

  if (!isOpen) return null;

  const handleTestPing = async () => {
    audioService.playClickSound();
    const result = await measurePing();
    if (result !== null) {
      audioService.playCorrectSound();
    }
  };

  // Battery icon selection
  const getBatteryIcon = () => {
    if (battery.isCharging) {
      return <BatteryCharging className="w-7 h-7 text-emerald-500 animate-pulse" />;
    }
    if (battery.level > 80) {
      return <BatteryFull className="w-7 h-7 text-emerald-500" />;
    }
    if (battery.level > 30) {
      return <BatteryMedium className="w-7 h-7 text-blue-500" />;
    }
    if (battery.level > 15) {
      return <BatteryLow className="w-7 h-7 text-amber-500" />;
    }
    return <BatteryWarning className="w-7 h-7 text-rose-500 animate-bounce" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <span>وضعیت زنده سخت‌افزار و شبکه</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                پایش لحظه‌ای میزان شارژ باتری و پایداری اتصال اینترنت
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

        {/* Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Real Battery Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getBatteryIcon()}
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-slate-100 block">
                    سطح شارژ باتری دستگاه
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">
                    {battery.isCharging ? 'متصل به شارژر (در حال شارژ)' : 'در حال مصرف انرژی باتری'}
                  </span>
                </div>
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1">
                  {battery.isCharging && <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />}
                  <span className="font-latin text-xl font-black text-gray-900 dark:text-slate-100">
                    {battery.level}%
                  </span>
                </div>
              </div>
            </div>

            {/* Battery Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${battery.level}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    battery.isCharging
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : battery.level > 30
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : battery.level > 15
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                      : 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse'
                  }`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-latin">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Real Network Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    network.isOnline
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {network.isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-slate-100">
                      وضعیت ارتباط با اینترنت
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        network.isOnline
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {network.isOnline ? 'متصل' : 'قطع'}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">
                    نسل شبکه: {network.typeLabelFa}
                  </span>
                </div>
              </div>

              {/* Signal bars */}
              <div className="flex items-end gap-1 h-5 px-2 py-1 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`w-1 rounded-xs transition-all ${
                      bar <= network.signalBars
                        ? network.signalBars >= 3
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                        : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                    style={{ height: `${bar * 25}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Network Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200/80 dark:border-slate-700">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                <span className="text-[10px] text-gray-400 block">پینگ و تاخیر سرور:</span>
                <span className="font-latin font-bold text-gray-900 dark:text-slate-100 text-xs">
                  {network.pingLatency !== null ? `${network.pingLatency} ms` : 'محاسبه نشده'}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                <span className="text-[10px] text-gray-400 block">سرعت پهنای باند:</span>
                <span className="font-latin font-bold text-gray-900 dark:text-slate-100 text-xs">
                  {network.downlink ? `${network.downlink} Mbps` : 'حداکثر (Wi-Fi)'}
                </span>
              </div>
            </div>

            {/* Ping Test Button */}
            <button
              onClick={handleTestPing}
              disabled={isMeasuringPing || !network.isOnline}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Activity className={`w-3.5 h-3.5 ${isMeasuringPing ? 'animate-spin' : ''}`} />
              <span>{isMeasuringPing ? 'در حال سنجش پینگ...' : 'تست زنده پینگ و سرعت اتصال'}</span>
            </button>
          </div>

          {/* Sync status link */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <div>
                <span className="font-bold text-indigo-950 dark:text-indigo-200 block">
                  دیتابیس و صف همگام‌سازی ابری
                </span>
                <span className="text-[11px] text-indigo-800 dark:text-indigo-300">
                  {pendingSyncCount > 0 ? `${pendingSyncCount} مورد در صف ارسال` : 'تمام داده‌ها با سرور همگام است'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                setIsSyncModalOpen(true);
                audioService.playClickSound();
              }}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 transition-colors"
            >
              مدیریت
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={() => {
              audioService.playClickSound();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs transition-all"
          >
            بستن
          </button>
        </div>
      </motion.div>
    </div>
  );
};
