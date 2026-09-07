import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Flame,
  Gem,
  Languages,
  Volume2,
  Sparkles,
  RefreshCw,
  X,
  ChevronDown,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  Zap,
  Signal,
  SignalMedium,
  SignalLow,
  Sun,
  Moon,
  Monitor,
  Globe2,
  Users,
  CloudUpload,
  CloudCheck,
  Database,
  Activity,
  Download,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_LANGUAGES, EXPLANATION_LANGUAGES } from '../../data/curriculumData';
import { audioService } from '../../services/audioService';
import { TargetLanguageCode, ExplanationLanguageCode, LanguageCategory } from '../../types';
import { useDeviceStatus } from '../../hooks/useDeviceStatus';
import { DeviceDiagnosticsModal } from '../Device/DeviceDiagnosticsModal';
import { PWAInstallModal } from '../PWA/PWAInstallModal';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const AppHeader: React.FC = () => {
  const {
    user,
    setTargetLanguage,
    setExplanationLanguage,
    refillHearts,
    updateSettings,
    isDarkMode,
    toggleTheme,
    setIsProfileModalOpen,
    isCapacityModalOpen,
    setIsCapacityModalOpen,
    realCapacity,
    isOnline,
    syncStatus,
    pendingSyncCount,
    setIsSyncModalOpen,
  } = useApp();

  const { battery, network } = useDeviceStatus();

  const [showHeartModal, setShowHeartModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<LanguageCategory>('all');

  const currentLang = SUPPORTED_LANGUAGES[user.targetLanguage] || SUPPORTED_LANGUAGES.en;

  const handleRefillHearts = () => {
    const success = refillHearts();
    if (success) {
      setShowHeartModal(false);
    }
  };

  const handleSpeakPersianSample = () => {
    audioService.speakPersian(`سلام ${user.firstName || user.name}! صدای فارسی فعال است.`);
  };

  const filteredLanguages = Object.values(SUPPORTED_LANGUAGES).filter((lang) => {
    if (selectedCategory === 'all') return true;
    return lang.category === selectedCategory;
  });

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 select-none shadow-xs transition-colors duration-200 pt-[max(0px,env(safe-area-inset-top))]">
        {/* Status Bar / User Profile Bar */}
        <div className="flex items-center justify-between px-2 sm:px-4 py-1 sm:py-1.5 text-[11px] text-gray-500 dark:text-slate-400 font-latin border-b border-gray-100 dark:border-slate-800/80 bg-gray-50/80 dark:bg-slate-950/70 overflow-x-auto no-scrollbar gap-2">
          {/* User Profile Switch Button & Live Capacity */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                setIsProfileModalOpen(true);
                audioService.playClickSound();
              }}
              className="flex items-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 px-1.5 sm:px-2 py-0.5 rounded-full transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 group shrink-0"
            >
              <span className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                {user.avatar && (user.avatar.startsWith('data:') || user.avatar.startsWith('http') || user.avatar.startsWith('/') || user.avatar.length > 10) ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm leading-none">{user.avatar || '🦁'}</span>
                )}
              </span>
              <span className="font-bold text-xs text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 max-w-[90px] sm:max-w-none truncate">
                {user.firstName ? `${user.firstName} ${user.lastName}` : user.name}
              </span>
              <span className="text-[9px] sm:text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded-full font-semibold hidden xs:inline">
                تغییر
              </span>
            </button>

            {/* Real Capacity Live Badge */}
            <button
              onClick={() => {
                setIsCapacityModalOpen(true);
                audioService.playClickSound();
              }}
              title="مشاهده ظرفیت واقعی و ثبت‌نام نفر جدید"
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-[9px] sm:text-[10px] transition-all cursor-pointer shadow-2xs shrink-0"
            >
              <Users className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>ظرفیت: {realCapacity}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          </div>

          {/* System Indicators & Cloud Sync Badge */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* PWA Install Button */}
            <button
              onClick={() => {
                setShowPwaModal(true);
                audioService.playClickSound();
              }}
              title="نصب اپلیکیشن PWA روی صفحه اصلی گوشی یا رایانه"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-[9px] sm:text-[10px] transition-all cursor-pointer shadow-2xs group shrink-0"
            >
              <Download className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400 group-hover:animate-bounce" />
              <span>نصب PWA</span>
            </button>

            {/* Live Sync Status Pill */}
            <button
              onClick={() => {
                setIsSyncModalOpen(true);
                audioService.playClickSound();
              }}
              title="مشاهده وضعیت اتصال، صف همگام‌سازی و دیتابیس ابری"
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold transition-all border shadow-2xs shrink-0 ${
                !isOnline
                  ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : syncStatus === 'syncing'
                  ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                  : pendingSyncCount > 0
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {!isOnline ? (
                <>
                  <WifiOff className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                  <span>آفلاین {pendingSyncCount > 0 ? `(${pendingSyncCount})` : ''}</span>
                </>
              ) : syncStatus === 'syncing' ? (
                <>
                  <CloudUpload className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 animate-bounce" />
                  <span className="hidden sm:inline">همگام‌سازی...</span>
                  <span className="sm:hidden">همگام...</span>
                </>
              ) : pendingSyncCount > 0 ? (
                <>
                  <CloudUpload className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{pendingSyncCount} در صف</span>
                </>
              ) : (
                <>
                  <Database className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span>همگام ✓</span>
                </>
              )}
            </button>

            {/* Real Network & Hardware Status Group */}
            <button
              onClick={() => {
                setShowDeviceModal(true);
                audioService.playClickSound();
              }}
              title={`وضعیت دستگاه: باتری ${battery.level}% (${battery.isCharging ? 'در حال شارژ' : 'استفاده از باتری'}) | شبکه: ${network.typeLabelFa}${network.pingLatency ? ` (پینگ: ${network.pingLatency}ms)` : ''}`}
              className="flex items-center gap-1.5 sm:gap-2 hover:bg-gray-200/60 dark:hover:bg-slate-800/80 px-1.5 sm:px-2 py-0.5 rounded-full transition-all cursor-pointer group shrink-0"
            >
              {/* Network Generation Badge */}
              <span className={`text-[9px] sm:text-[10px] font-bold font-latin hidden md:inline ${
                !network.isOnline
                  ? 'text-amber-500'
                  : network.effectiveType === '5g'
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : 'text-gray-600 dark:text-slate-300'
              }`}>
                {network.typeLabelFa}
              </span>

              {/* Signal Bars Indicator */}
              <div className="flex items-center">
                {!network.isOnline ? (
                  <WifiOff className="w-3 h-3 text-amber-500 animate-pulse" />
                ) : (
                  <div className="flex items-end gap-0.5 h-2.5">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`w-0.5 rounded-xs transition-all ${
                          bar <= network.signalBars
                            ? network.signalBars >= 3
                              ? 'bg-emerald-600 dark:bg-emerald-400'
                              : 'bg-amber-500'
                            : 'bg-gray-300 dark:bg-slate-700'
                        }`}
                        style={{ height: `${bar * 25}%` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Wi-Fi Icon with real online status */}
              <Wifi
                className={`w-3 h-3 transition-colors ${
                  !network.isOnline
                    ? 'text-amber-500'
                    : network.signalBars >= 3
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-500'
                }`}
              />

              {/* Real Battery Indicator */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                <span className={`text-[9px] sm:text-[10px] font-bold font-latin ${
                  battery.level <= 15 && !battery.isCharging
                    ? 'text-rose-500 font-extrabold'
                    : battery.level <= 30 && !battery.isCharging
                    ? 'text-amber-500'
                    : 'text-gray-700 dark:text-slate-300'
                }`}>
                  {battery.level}%
                </span>

                {battery.isCharging ? (
                  <div className="flex items-center text-emerald-500">
                    <Zap className="w-3 h-3 fill-emerald-500 animate-pulse" />
                  </div>
                ) : battery.level > 80 ? (
                  <BatteryFull className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : battery.level > 30 ? (
                  <BatteryMedium className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                ) : battery.level > 15 ? (
                  <BatteryLow className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <BatteryWarning className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Main Header Row */}
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Target Language Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <button
              onClick={() => {
                setIsProfileModalOpen(true);
                audioService.playClickSound();
              }}
              title="پروفایل کاربری"
              className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center text-white text-base shadow-sm shrink-0 hover:scale-105 active:scale-95 transition-all overflow-hidden"
            >
              {user.avatar && (user.avatar.startsWith('data:') || user.avatar.startsWith('http') || user.avatar.startsWith('/') || user.avatar.length > 10) ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{user.avatar || '🦁'}</span>
              )}
            </button>

            {/* Target Language Selector Dropdown */}
            <div className="relative">
              <button
                id="target-lang-dropdown-btn"
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  audioService.playClickSound();
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/70 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-100 text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-xs"
              >
                <span className="text-base leading-none">{currentLang.flag}</span>
                <span className="hidden xs:inline text-xs font-bold text-gray-800 dark:text-slate-100">{currentLang.nameFa}</span>
                <span className="xs:hidden text-[11px] font-bold uppercase">{currentLang.code}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
              </button>

              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-2.5 shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="px-2 py-1 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 mb-2">
                      <span className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        انتخاب زبان برای یادگیری:
                      </span>
                      <span className="text-[10px] text-gray-400 font-latin">۱۰ زبان برتر جهان</span>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex gap-1 overflow-x-auto pb-2 mb-2 no-scrollbar border-b border-gray-100 dark:border-slate-800">
                      {[
                        { id: 'all', label: 'همه' },
                        { id: 'popular', label: 'پرطرفدار' },
                        { id: 'european', label: 'اروپایی' },
                        { id: 'migration', label: 'مهاجرت' },
                        { id: 'asian_middle_east', label: 'آسیا / خاورمیانه' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id as LanguageCategory)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                            selectedCategory === cat.id
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Language Options List */}
                    <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                      {filteredLanguages.map((lang) => {
                        const isSelected = lang.code === user.targetLanguage;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setTargetLanguage(lang.code as TargetLanguageCode);
                              setShowLangMenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800'
                                : 'text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{lang.flag}</span>
                              <div className="text-right">
                                <div className="text-xs font-bold">{lang.nameFa}</div>
                                <div className="text-[10px] text-gray-500 dark:text-slate-400 font-latin">
                                  {lang.nameNative} • {lang.speakersCount}
                                </div>
                              </div>
                            </div>
                            {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Persian Voice Quick Button (قابلیت پخش صوت و تست گوینده فارسی) */}
          <button
            id="persian-tts-preview-btn"
            onClick={handleSpeakPersianSample}
            title="تست صوت و گوینده فارسی (Persian TTS)"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all active:scale-95 shadow-xs"
          >
            <span className="text-xs">🇮🇷</span>
            <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline text-[11px]">صوت فارسی</span>
          </button>

          {/* Theme Switcher Toggle Button (Dark / Light / System) */}
          <button
            id="theme-switcher-header-btn"
            onClick={toggleTheme}
            title={`تغییر حالت تم: ${user.settings?.theme === 'dark' ? 'حالت تاریک' : user.settings?.theme === 'light' ? 'حالت روشن' : 'هماهنگ با سیستم عامل'}`}
            className="flex items-center justify-center p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 transition-all active:scale-95 shadow-xs"
          >
            {user.settings?.theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
            ) : user.settings?.theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            ) : (
              <Monitor className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            )}
          </button>

          {/* Gamification Stats: Streak, Gems, Hearts */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Daily Streak */}
            <div
              title={`استریک روزانه: ${user.streak} روز`}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/60 text-orange-700 dark:text-orange-300 text-xs font-bold font-latin shadow-xs cursor-default"
            >
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>{user.streak}</span>
            </div>

            {/* Gems */}
            <div
              title={`جواهرات شما: ${user.gems}`}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold font-latin shadow-xs cursor-default"
            >
              <Gem className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
              <span>{user.gems}</span>
            </div>

            {/* Hearts Button */}
            <button
              id="hearts-modal-trigger-btn"
              onClick={() => {
                setShowHeartModal(true);
                audioService.playClickSound();
              }}
              title="قلب‌ها (انرژی تمرین)"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold font-latin shadow-xs transition-all active:scale-95"
            >
              <Heart className={`w-3.5 h-3.5 text-rose-500 ${user.hearts > 0 ? 'fill-rose-500' : ''}`} />
              <span>{user.hearts}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hearts Refill Modal */}
      <AnimatePresence>
        {showHeartModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  مدیریت قلب‌ها
                </h3>
                <button
                  onClick={() => setShowHeartModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center gap-2 my-4">
                {Array.from({ length: user.maxHearts }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-7 h-7 transition-all ${
                      i < user.hearts
                        ? 'text-rose-500 fill-rose-500 scale-110'
                        : 'text-gray-300 dark:text-slate-700 fill-transparent stroke-1'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-gray-600 dark:text-slate-300 mb-5 leading-relaxed">
                هر پاسخ اشتباه در درس‌ها یک قلب از شما کم می‌کند. قلب‌ها هر چند ساعت یک‌بار پر می‌شوند یا می‌توانید با
                جواهر شارژ کنید.
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleRefillHearts}
                  disabled={user.hearts === user.maxHearts || user.gems < 50}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    user.hearts === user.maxHearts
                      ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed'
                      : user.gems < 50
                      ? 'bg-gray-100 dark:bg-slate-800 text-rose-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-none active:scale-95'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  {user.hearts === user.maxHearts ? (
                    'قلب‌های شما پر است'
                  ) : (
                    <>
                      <span>شارژ کامل قلب‌ها</span>
                      <span className="flex items-center gap-1 font-latin text-xs bg-black/10 px-2 py-0.5 rounded-lg">
                        50 <Gem className="w-3 h-3 text-cyan-400" />
                      </span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowHeartModal(false)}
                  className="w-full py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                >
                  بستن
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Device & Hardware Real-Time Diagnostics Modal */}
      <DeviceDiagnosticsModal
        isOpen={showDeviceModal}
        onClose={() => setShowDeviceModal(false)}
      />

      {/* PWA Progressive Web App Install Modal */}
      <PWAInstallModal
        isOpen={showPwaModal}
        onClose={() => setShowPwaModal(false)}
      />
    </>
  );
};
