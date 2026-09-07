import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Share2,
  PlusSquare,
  Sparkles,
  Copy,
  ExternalLink,
  Laptop,
  X,
  Zap,
  ShieldCheck,
  WifiOff,
  FileJson,
  Cpu,
  ArrowDownToLine,
  Check,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { audioService } from '../../services/audioService';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, platform, triggerInstall } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'direct_download' | 'features' | 'manifest'>('guide');

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    audioService.playCorrectSound();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeInstall = async () => {
    audioService.playClickSound();
    const success = await triggerInstall();
    if (success) {
      audioService.playFanfareSound();
    }
  };

  const handleDownloadManifest = () => {
    audioService.playClickSound();
    const link = document.createElement('a');
    link.href = '/manifest.json';
    link.download = 'hosein-fatemeh-language-pwa.webmanifest';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenDirect = () => {
    audioService.playClickSound();
    window.open(appUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 overflow-hidden text-white shadow-md shadow-indigo-200 dark:shadow-none flex items-center justify-center shrink-0 border border-indigo-400/30">
              <img src="/app-logo.jpg" alt="App Icon" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>نصب و دانلود اپلیکیشن PWA</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-latin font-bold">
                  PWA Real
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                نصب مستقیم با یک کلیک و دسترسی آفلاین دائمی
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

        {/* Status / Quick Install Notification */}
        {isInstalled ? (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>اپلیکیشن روی این دستگاه با موفقیت نصب شده و به صورت تمام‌صفحه فعال است!</span>
          </div>
        ) : isInstallable ? (
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                مرورگر شما آماده نصب خودکار است!
              </span>
            </div>
            <button
              onClick={handleNativeInstall}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              نصب فوری
            </button>
          </div>
        ) : null}

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-slate-800 p-1 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'guide'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-gray-500 dark:text-slate-400'
            }`}
          >
            راهنمای نصب
          </button>
          <button
            onClick={() => setActiveTab('direct_download')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'direct_download'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-gray-500 dark:text-slate-400'
            }`}
          >
            دانلود و لینک مستقیم
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'features'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-gray-500 dark:text-slate-400'
            }`}
          >
            مزایای آفلاین
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'manifest'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-gray-500 dark:text-slate-400'
            }`}
          >
            مانیفست PWA
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1 text-xs">
          {activeTab === 'guide' && (
            <>
              {/* Android Guide */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    <span>نصب در گوشی‌های اندروید (Chrome / Samsung):</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-latin font-bold">
                    Android
                  </span>
                </div>
                <ol className="space-y-1.5 list-decimal list-inside text-gray-600 dark:text-slate-300 leading-relaxed">
                  <li>لینک مستقیم برنامه را در مرورگر <strong>Chrome</strong> باز کنید.</li>
                  <li>روی منوی سه‌نقطه بالا سمت راست (یا کادر پاپ‌آپ) بزنید.</li>
                  <li>گزینه <strong>«نصب اپلیکیشن» (Install App)</strong> یا <strong>«افزودن به صفحه اصلی» (Add to Home screen)</strong> را لمس کنید.</li>
                  <li>آیکون اختصاصی برنامه روی صفحه گوشی شما قرار می‌گیرد و بدون اینترنت هم کار می‌کند.</li>
                </ol>
              </div>

              {/* iOS Guide */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <span>نصب در آیفون و آیپد (Safari iOS):</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-latin font-bold">
                    iOS / Safari
                  </span>
                </div>
                <ol className="space-y-1.5 list-decimal list-inside text-gray-600 dark:text-slate-300 leading-relaxed">
                  <li>لینک برنامه را در مرورگر اختصاصی <strong>Safari</strong> باز کنید.</li>
                  <li>در نوار پایین مرورگر، دکمه <strong>Share (اشتراک‌گذاری ⎋)</strong> را بزنید.</li>
                  <li>کمی اسکرول کرده و گزینه <strong>«Add to Home Screen» (افزودن به صفحه اصلی)</strong> را انتخاب کنید.</li>
                  <li>در گوشه بالا روی <strong>Add</strong> بزنید.</li>
                </ol>
              </div>

              {/* Desktop / PC Guide */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-purple-500" />
                    <span>نصب در کامپیوتر و لپ‌تاپ (Windows / Mac):</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-latin font-bold">
                    Desktop
                  </span>
                </div>
                <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
                  در مرورگر Chrome یا Edge روی آیکون <strong>«نصب رایانه» (Install icon ⊕)</strong> در انتهای نوار آدرس کلیک کنید تا برنامه به عنوان نرم‌افزار مستقل دسکتاپ اجرا شود.
                </p>
              </div>
            </>
          )}

          {activeTab === 'direct_download' && (
            <div className="space-y-3">
              {/* Direct Launch / Install Action Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/70 dark:to-blue-950/50 border border-indigo-200 dark:border-indigo-800 space-y-3">
                <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-100 font-extrabold text-xs">
                  <ArrowDownToLine className="w-4 h-4 text-indigo-600" />
                  <span>دسترسی مستقیم و دانلود فایل‌های وب‌اپ:</span>
                </div>
                <p className="text-[11px] text-gray-700 dark:text-slate-300 leading-relaxed">
                  می‌توانید برنامه را مستقیماً در تب جدید باز کنید، لینک را در مرورگر موبایل خود بارگذاری نمایید یا فایل پیکربندی مانیفست استاندارد PWA را ذخیره کنید.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleOpenDirect}
                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>باز کردن لینک مستقیم</span>
                  </button>

                  <button
                    onClick={handleDownloadManifest}
                    className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود مانیفست PWA</span>
                  </button>
                </div>
              </div>

              {/* Copy URL Box */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-800 dark:text-slate-200">
                    آدرس مستقیم دانلود و اجرای اپلیکیشن:
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'کپی شد!' : 'کپی لینک'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-[11px] font-latin text-gray-700 dark:text-slate-300 break-all select-all font-mono">
                  {appUrl}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 flex items-start gap-2.5">
                <WifiOff className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-slate-100">کارکرد کامل آفلاین (Offline Ready)</h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                    دسترسی همیشگی به تمام ۵۲ هفته درسی، واژگان و جعبه لایتنر حتی در صورت قطعی اینترنت
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 flex items-start gap-2.5">
                <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-slate-100">سرعت فوق‌العاده بدون لگ</h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                    ذخیره هوشمند اجزا و موتور صوتی در حافظه کش محلی با شروع آنی
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-slate-100">تجربه تمام‌صفحه Native</h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                    حذف کادرهای اضافی مرورگر، آیکون اختصاصی در صفحه اصلی و عملکرد مشابه برنامه‌های بومی
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manifest' && (
            <div className="space-y-3">
              {/* Web Manifest Definition Box */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-extrabold text-xs">
                  <FileJson className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>وب‌مانیفست (Web App Manifest) چیست؟</span>
                </div>
                <blockquote className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 font-latin text-[11px] text-indigo-950 dark:text-indigo-200 font-medium italic leading-relaxed">
                  &ldquo;A web manifest is a JSON text file that provides information about a web app.&rdquo;
                </blockquote>
                <p className="text-[11px] text-gray-700 dark:text-slate-300 leading-relaxed">
                  وب مانیفست یک فایل با ساختار JSON است که اطلاعات بنیادی برنامه (مانند نام، آیکون‌ها، جهت راست‌به‌چپ RTL، رنگ تم، و نحوه اجرای تمام‌صفحه) را به مرورگر و سیستم‌عامل اطلاع می‌دهد.
                </p>
              </div>

              {/* Service Worker Definition Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-gray-900 dark:text-slate-100 font-extrabold text-xs">
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  <span>سرویس ورکر (Service Worker) چیست؟</span>
                </div>
                <blockquote className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 font-latin text-[11px] text-gray-800 dark:text-slate-200 font-medium italic leading-relaxed">
                  &ldquo;Service Workers sit between your web app and the network. They are intended to enable the creation of effective offline experiences, intercept network requests, and take appropriate action based on whether the network is available. They also allow access to push notifications and background sync APIs.&rdquo;
                </blockquote>
                <p className="text-[11px] text-gray-600 dark:text-slate-300 leading-relaxed">
                  سرویس ورکر مانند یک پروکسی قدرتمند میان کلاینت و سرور عمل می‌کند؛ درخواست‌ها را بررسی کرده، محتوای دروس را کش می‌کند و دسترسی آفلاین کامل را برای شما رقم می‌زند.
                </p>
              </div>

              {/* Manifest JSON File Link */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-[11px]">
                <span className="font-mono text-gray-600 dark:text-slate-400">/public/manifest.json</span>
                <a
                  href="/manifest.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  <span>مشاهده فایل خام JSON</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2 shrink-0">
          {isInstallable && (
            <button
              onClick={handleNativeInstall}
              className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-200 dark:shadow-none active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>نصب مستقیم PWA روی دستگاه</span>
            </button>
          )}

          <button
            onClick={() => {
              audioService.playClickSound();
              onClose();
            }}
            className={`py-3 px-5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs transition-all ${
              !isInstallable ? 'w-full' : ''
            }`}
          >
            متوجه شدم
          </button>
        </div>
      </motion.div>
    </div>
  );
};
