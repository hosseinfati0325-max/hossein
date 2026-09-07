import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Plus,
  Check,
  Globe2,
  Trash2,
  Edit2,
  Award,
  Sparkles,
  ArrowRight,
  LogOut,
  Users,
  Upload,
  Camera,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TargetLanguageCode, UserProgress } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/curriculumData';
import { audioService } from '../../services/audioService';

interface ProfileModalProps {
  onClose: () => void;
}

const AVATARS = ['🦁', '🦉', '🦊', '🐼', '🚀', '🎓', '👑', '⚡', '🌟', '🎯', '💎', '🦄'];

export const renderAvatarElement = (avatar?: string, className = "w-full h-full object-cover rounded-2xl") => {
  if (avatar && (avatar.startsWith('data:') || avatar.startsWith('http') || avatar.startsWith('/') || avatar.length > 10)) {
    return <img src={avatar} alt="User Avatar" className={className} />;
  }
  return <span className="text-2xl select-none leading-none">{avatar || '🦁'}</span>;
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { user, profiles, switchProfile, createProfile, updateCurrentProfileName, deleteProfile } = useApp();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '🦁');
  const [selectedLanguage, setSelectedLanguage] = useState<TargetLanguageCode>(user.targetLanguage || 'en');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle switching to another profile
  const handleSelectProfile = (profileId: string) => {
    if (profileId === user.id) return;
    audioService.playFanfareSound();
    switchProfile(profileId);
    onClose();
  };

  // Process and optimize uploaded image to Base64 (max 256x256)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('لطفاً یک فایل تصویری معتبر (JPG, PNG, WebP) انتخاب فرمایید.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setSelectedAvatar(dataUrl);
          audioService.playCorrectSound();
        }
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle creating or saving profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('لطفاً نام و نام خانوادگی را به صورت کامل وارد نمایید.');
      audioService.playWrongSound();
      return;
    }

    setErrorMsg('');
    audioService.playFanfareSound();

    if (isCreatingNew) {
      createProfile(firstName.trim(), lastName.trim(), selectedAvatar, selectedLanguage);
      setIsCreatingNew(false);
    } else {
      updateCurrentProfileName(firstName.trim(), lastName.trim(), selectedAvatar);
    }
    onClose();
  };

  // Start creating new
  const handleStartNew = () => {
    setIsCreatingNew(true);
    setFirstName('');
    setLastName('');
    setSelectedAvatar('🦊');
    setSelectedLanguage('en');
    setErrorMsg('');
    audioService.playClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/30 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-slate-100">
                {isCreatingNew ? 'افزودن پروفایل زبان‌آموز جدید' : 'مدیریت پروفایل و تصویر کاربری'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                تنظیم نام، نام خانوادگی و عکس اختصاصی زبان‌آموز
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {!isCreatingNew ? (
            /* Profiles List View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                  پروفایل‌های موجود ({profiles.length}):
                </span>
                <button
                  onClick={handleStartNew}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>کاربر جدید</span>
                </button>
              </div>

              {/* Profiles Grid */}
              <div className="grid grid-cols-1 gap-3">
                {profiles.map((p) => {
                  const isActive = p.id === user.id;
                  const lang = SUPPORTED_LANGUAGES[p.targetLanguage] || SUPPORTED_LANGUAGES.en;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProfile(p.id)}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 shadow-xs ring-2 ring-indigo-600/20'
                          : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                          {renderAvatarElement(p.avatar)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-gray-900 dark:text-slate-100">
                              {p.firstName || ''} {p.lastName || ''}
                            </span>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                                کاربر فعال
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <span>{lang.flag}</span>
                              <span>{lang.nameFa}</span>
                            </span>
                            <span>•</span>
                            <span className="font-latin font-semibold">{p.xp} XP</span>
                            <span>•</span>
                            <span className="font-latin font-semibold">سطح {p.currentLevel}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {profiles.length > 1 && !isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`آیا از حذف پروفایل "${p.firstName} ${p.lastName}" اطمینان دارید؟`)) {
                                deleteProfile(p.id);
                              }
                            }}
                            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="حذف پروفایل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {isActive && <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Edit Current Profile Form */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                  ویرایش اطلاعات و عکس پروفایل ({user.name}):
                </h3>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-slate-400 mb-1">
                        نام
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="مثال: حسین"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-slate-400 mb-1">
                        نام خانوادگی
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="مثال: رضایی"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Custom Photo Upload & Avatar Picker Box */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300">
                        تصویر و آواتار پروفایل:
                      </label>
                      <span className="text-[10px] text-gray-400">عکس شخصی یا آیکون</span>
                    </div>

                    {/* Preview + Upload Button */}
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500 shadow-md flex items-center justify-center overflow-hidden shrink-0">
                        {renderAvatarElement(selectedAvatar)}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{isUploading ? 'در حال بارگذاری...' : 'بارگذاری عکس از گالری / دوربین'}</span>
                        </button>

                        {selectedAvatar && selectedAvatar.startsWith('data:') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAvatar('🦁');
                              audioService.playClickSound();
                            }}
                            className="text-[10px] text-rose-500 hover:underline flex items-center gap-1 font-bold"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>بازنشانی به ایموجی آواتار</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Preset Emoji Row */}
                    <div>
                      <span className="text-[10px] text-gray-500 dark:text-slate-400 block mb-1">
                        یا انتخاب سریع از آیکون‌های پیش‌فرض:
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {AVATARS.map((av) => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => {
                              setSelectedAvatar(av);
                              audioService.playClickSound();
                            }}
                            className={`w-8 h-8 rounded-xl text-base flex items-center justify-center shrink-0 border transition-all ${
                              selectedAvatar === av
                                ? 'bg-indigo-100 dark:bg-indigo-950 border-indigo-600 scale-110'
                                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:border-gray-300'
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 dark:shadow-none transition-all active:scale-98"
                  >
                    ذخیره تغییرات مشخصات و عکس پروفایل
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Create New Profile View */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 text-xs leading-relaxed flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>با ساخت پروفایل جدید، هر شخص مسیر یادگیری، تعیین سطح و امتیازات مجزا خواهد داشت.</span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                    نام زبان‌آموز *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="مثال: حسین"
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-hidden"
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
                    placeholder="مثال: حسینی"
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-hidden"
                  />
                </div>
              </div>

              {/* Target Language Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                  زبان هدف اولیه برای یادگیری
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

              {/* Avatar Selector & Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">
                  انتخاب نماد کاربری یا عکس شخصی
                </label>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-500 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    {renderAvatarElement(selectedAvatar)}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>بارگذاری عکس شخصی</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
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

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  انصراف و بازگشت
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 dark:shadow-none transition-all active:scale-98"
                >
                  ایجاد و ورود به پنل اختصاصی
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
