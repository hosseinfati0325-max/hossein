import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  X,
  Sparkles,
  Flame,
  Globe2,
  Phone,
  Calendar,
  Award,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TargetLanguageCode } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/curriculumData';
import { audioService } from '../../services/audioService';

interface RealCapacityModalProps {
  onClose: () => void;
}

const AVATARS = ['🦁', '🦉', '🦊', '🐼', '🚀', '🎓', '👑', '⚡', '🌟', '🎯', '💎', '🦄'];

export const RealCapacityModal: React.FC<RealCapacityModalProps> = ({ onClose }) => {
  const {
    user,
    profiles,
    realCapacity,
    getCapacityData,
    createProfile,
    switchProfile,
    triggerCelebration,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'register'>('overview');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🎓');
  const [selectedLanguage, setSelectedLanguage] = useState<TargetLanguageCode>('en');
  const [registeredSuccess, setRegisteredSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const capacityData = getCapacityData();

  const handleRegisterNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('لطفاً نام و نام خانوادگی را وارد نمایید.');
      audioService.playWrongSound();
      return;
    }

    setErrorMsg('');
    const newProf = createProfile(
      firstName.trim(),
      lastName.trim(),
      selectedAvatar,
      selectedLanguage,
    );

    triggerCelebration();
    audioService.playFanfareSound();
    setRegisteredSuccess(
      `زبان‌آموز گرامی «${newProf.firstName} ${newProf.lastName}» با موفقیت ثبت‌نام شد و ظرفیت واقعی به ${profiles.length + 1} نفر افزایش یافت! شماره عضویت شما: #${newProf.memberNumber || profiles.length + 1}`,
    );

    // Reset inputs
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setActiveTab('overview');
  };

  const handleQuickSwitch = (profileId: string) => {
    audioService.playClickSound();
    switchProfile(profileId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Header */}
        <div className="p-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white backdrop-blur-xs shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  ظرفیت واقعی زبان‌آموزان سیستم
                </h2>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  زنده و پویا
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5">
                محاسبه بلادرنگ بر اساس ثبت‌نام واقعی هر فرد در پایگاه داده
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-2 bg-gray-100 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('overview');
              audioService.playClickSound();
            }}
            className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-gray-200 dark:border-slate-700'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>آمار ظرفیت و اعضا ({realCapacity})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('register');
              audioService.playClickSound();
            }}
            className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'register'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-gray-200 dark:border-slate-700'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>ثبت‌نام جدید و افزایش ظرفیت</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {registeredSuccess && (
          <div className="mx-5 mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{registeredSuccess}</span>
            </div>
            <button
              onClick={() => setRegisteredSuccess(null)}
              className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'overview' ? (
            <>
              {/* Main Real Capacity Live Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-slate-800 border border-indigo-200 dark:border-indigo-800/60 text-center">
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400 block mb-1">
                    ظرفیت واقعی کل
                  </span>
                  <div className="text-3xl font-black font-latin text-indigo-700 dark:text-indigo-300">
                    {realCapacity}
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
                    نفر ثبت‌نام‌شده
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-800 border border-emerald-200 dark:border-emerald-800/60 text-center">
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400 block mb-1">
                    فعالیت امروز
                  </span>
                  <div className="text-3xl font-black font-latin text-emerald-600 dark:text-emerald-400">
                    {capacityData.activeToday}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
                    زبان‌آموز آنلاین
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-slate-800 border border-amber-200 dark:border-amber-800/60 text-center col-span-2 sm:col-span-1">
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400 block mb-1">
                    رشد خودکار
                  </span>
                  <div className="text-3xl font-black font-latin text-amber-600 dark:text-amber-400">
                    +100%
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mt-1 block">
                    داده‌های واقعی
                  </span>
                </div>
              </div>

              {/* Language Distribution Breakdown */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Globe2 className="w-4 h-4 text-indigo-600" />
                    توزیع ظرفیت بر حسب زبان‌های آموزشی:
                  </h4>
                  <span className="text-[10px] text-gray-500 font-latin">Real Database</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(capacityData.byLanguage).map(([langCode, count]) => {
                    const l = SUPPORTED_LANGUAGES[langCode as TargetLanguageCode];
                    if (!l) return null;
                    const countNum = Number(count) || 0;
                    const percent = realCapacity > 0 ? Math.round((countNum / realCapacity) * 100) : 0;

                    return (
                      <div
                        key={langCode}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{l.flag}</span>
                          <div>
                            <span className="text-xs font-bold text-gray-800 dark:text-slate-200 block">
                              {l.nameFa}
                            </span>
                            <span className="text-[10px] text-gray-500 font-latin">
                              {percent}% از ظرفیت
                            </span>
                          </div>
                        </div>
                        <span className="font-latin font-bold text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                          {countNum} نفر
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real Registered Members List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    لیست زبان‌آموزان ثبت‌نام‌شده واقعی در ظرفیت ({profiles.length} نفر):
                  </h4>
                  <button
                    onClick={() => setActiveTab('register')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>افزودن عضو</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {profiles.map((p, idx) => {
                    const isActive = p.id === user.id;
                    const lang = SUPPORTED_LANGUAGES[p.targetLanguage] || SUPPORTED_LANGUAGES.en;
                    const memberNo = p.memberNumber || idx + 1;

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleQuickSwitch(p.id)}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xl shadow-xs shrink-0">
                            {p.avatar || '🦁'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-gray-900 dark:text-slate-100">
                                {p.firstName ? `${p.firstName} ${p.lastName}` : p.name}
                              </span>
                              <span className="text-[10px] font-latin font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded-md">
                                #{memberNo}
                              </span>
                              {isActive && (
                                <span className="px-2 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-bold">
                                  شما (فعال)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5 text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <span>{lang.flag}</span>
                                <span>{lang.nameFa}</span>
                              </span>
                              <span>•</span>
                              <span className="font-latin font-semibold">{p.xp} XP</span>
                              <span>•</span>
                              <span className="font-latin font-semibold">سطح {p.currentLevel}</span>
                              {p.registeredAt && (
                                <>
                                  <span>•</span>
                                  <span className="text-[10px] text-gray-400">
                                    ثبت: {new Date(p.registeredAt).toLocaleDateString('fa-IR')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                            {isActive ? 'در حال استفاده' : 'ورود به پنل'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Registration Form View */
            <form onSubmit={handleRegisterNewUser} className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 text-xs leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-indigo-700 dark:text-indigo-300 text-sm">
                  <Zap className="w-4 h-4" />
                  <span>ثبت‌نام مستقیم و افزایش آنی ظرفیت سیستم</span>
                </div>
                <p>
                  با تکمیل فرم زیر، نام زبان‌آموز در پایگاه داده محلی ذخیره شده و ظرفیت کل به صورت خودکار افزایش پیدا می‌کند.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    نام زبان‌آموز *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="مثال: سارا"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="مثال: کریمی"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Target Language Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                  انتخاب زبان آموزشی
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(SUPPORTED_LANGUAGES) as TargetLanguageCode[]).map((code) => {
                    const l = SUPPORTED_LANGUAGES[code];
                    const isSel = selectedLanguage === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setSelectedLanguage(code)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          isSel
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-base">{l.flag}</span>
                        <span className="truncate">{l.nameFa}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                  انتخاب آواتار کاربری
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center shrink-0 border transition-all ${
                        selectedAvatar === av
                          ? 'bg-indigo-100 dark:bg-indigo-950 border-indigo-600 scale-110 shadow-xs'
                          : 'bg-gray-100 dark:bg-slate-800 border-transparent hover:border-gray-300'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  بازگشت به لیست
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-indigo-200 dark:shadow-none transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>ثبت‌نام نهایی و افزایش ظرفیت</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
