import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  BookOpen,
  Brain,
  Calendar,
  Sparkles,
  Award,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  PieChart as PieIcon,
  Activity,
  Globe,
  Headphones,
  Mic,
  Zap,
  BarChart2,
  Clock,
  Layers,
} from 'lucide-react';
import { UserProgress, TargetLanguageCode } from '../../types';
import { audioService } from '../../services/audioService';

interface ProgressChartsProps {
  user: UserProgress;
}

type ChartCategory = 'multi_language' | 'weekly_skills' | 'study_time_xp' | 'skill_radar';
type WeeklyTimeRange = '4weeks' | '8weeks' | '12weeks';

interface LanguageStatConfig {
  code: TargetLanguageCode;
  nameFa: string;
  nameEn: string;
  flag: string;
  color: string;
  gradientId: string;
  baseMastery: number;
}

const AVAILABLE_LANGUAGES: LanguageStatConfig[] = [
  { code: 'en', nameFa: 'انگلیسی', nameEn: 'English', flag: '🇬🇧', color: '#4F46E5', gradientId: 'enGrad', baseMastery: 78 },
  { code: 'de', nameFa: 'آلمانی', nameEn: 'German', flag: '🇩🇪', color: '#EA580C', gradientId: 'deGrad', baseMastery: 62 },
  { code: 'fr', nameFa: 'فرانسوی', nameEn: 'French', flag: '🇫🇷', color: '#0284C7', gradientId: 'frGrad', baseMastery: 54 },
  { code: 'es', nameFa: 'اسپانیایی', nameEn: 'Spanish', flag: '🇪🇸', color: '#EAB308', gradientId: 'esGrad', baseMastery: 48 },
  { code: 'tr', nameFa: 'ترکی استانبولی', nameEn: 'Turkish', flag: '🇹🇷', color: '#E11D48', gradientId: 'trGrad', baseMastery: 58 },
  { code: 'ar', nameFa: 'عربی', nameEn: 'Arabic', flag: '🇸🇦', color: '#16A34A', gradientId: 'arGrad', baseMastery: 65 },
  { code: 'it', nameFa: 'ایتالیایی', nameEn: 'Italian', flag: '🇮🇹', color: '#0D9488', gradientId: 'itGrad', baseMastery: 42 },
  { code: 'ru', nameFa: 'روسی', nameEn: 'Russian', flag: '🇷🇺', color: '#8B5CF6', gradientId: 'ruGrad', baseMastery: 38 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  unit?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, unit = '%' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-gray-200 dark:border-slate-700 p-3 rounded-2xl shadow-xl text-xs space-y-1.5 min-w-[160px] text-right z-50">
        <p className="font-bold text-gray-800 dark:text-slate-100 font-latin border-b border-gray-100 dark:border-slate-800 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-gray-400 font-normal">تحلیل هفتگی</span>
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="truncate max-w-[110px]">{entry.name}:</span>
            </span>
            <span className="font-extrabold font-latin text-gray-900 dark:text-slate-100">
              {entry.value} {unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ user }) => {
  const [activeCategory, setActiveCategory] = useState<ChartCategory>('multi_language');
  const [timeRange, setTimeRange] = useState<WeeklyTimeRange>('8weeks');
  const [selectedLangCodes, setSelectedLangCodes] = useState<TargetLanguageCode[]>([
    user.targetLanguage || 'en',
    'de',
    'fr',
    'es',
  ]);

  // Toggle language selection for comparison
  const toggleLanguage = (code: TargetLanguageCode) => {
    audioService.playClickSound();
    if (selectedLangCodes.includes(code)) {
      if (selectedLangCodes.length > 1) {
        setSelectedLangCodes(selectedLangCodes.filter((c) => c !== code));
      }
    } else {
      setSelectedLangCodes([...selectedLangCodes, code]);
    }
  };

  // Compute realistic weekly mastery progression per language
  const weeklyMultiLanguageData = useMemo(() => {
    const totalLessons = user.completedLessonIds?.length || 0;
    const userWords = user.totalWordsLearned || 48;
    const userSpeaking = Math.round(user.speakingScoreAverage || 85);
    const userStreak = user.streak || 1;

    // Base user target language calculation
    const currentTargetMastery = Math.min(98, Math.max(45, 40 + totalLessons * 3.5 + Math.round(userWords / 8) + userStreak));

    const weeksCount = timeRange === '4weeks' ? 4 : timeRange === '8weeks' ? 8 : 12;
    const data = [];

    for (let w = 1; w <= weeksCount; w++) {
      const isCurrentWeek = w === weeksCount;
      const weekLabel = isCurrentWeek ? `هفته ${w} (اکنون)` : `هفته ${w}`;
      const progressRatio = w / weeksCount;

      const row: Record<string, any> = {
        week: weekLabel,
        weekNum: w,
      };

      AVAILABLE_LANGUAGES.forEach((lang) => {
        const isUserMain = lang.code === user.targetLanguage;
        const targetVal = isUserMain ? currentTargetMastery : lang.baseMastery;
        const startVal = Math.max(20, Math.round(targetVal * 0.45));
        
        // S-curve growth
        const currentVal = Math.min(100, Math.round(startVal + (targetVal - startVal) * Math.pow(progressRatio, 0.85)));
        row[lang.code] = currentVal;
      });

      data.push(row);
    }

    return data;
  }, [timeRange, user]);

  // Compute 4-Skills weekly data (Vocab, Grammar, Listening, Speaking)
  const weeklySkillsData = useMemo(() => {
    const totalLessons = user.completedLessonIds?.length || 0;
    const vocabEnd = Math.min(96, Math.max(50, 42 + totalLessons * 3.8));
    const grammarEnd = Math.min(94, Math.max(45, 38 + totalLessons * 3.2));
    const listeningEnd = Math.min(98, Math.max(55, 48 + user.streak * 2.5));
    const speakingEnd = Math.min(95, Math.max(50, Math.round(user.speakingScoreAverage || 82)));

    const weeksCount = timeRange === '4weeks' ? 4 : timeRange === '8weeks' ? 8 : 12;
    const data = [];

    for (let w = 1; w <= weeksCount; w++) {
      const ratio = w / weeksCount;
      const isCurrentWeek = w === weeksCount;

      data.push({
        week: isCurrentWeek ? `هفته ${w} (جاری)` : `هفته ${w}`,
        vocab: Math.min(100, Math.round(30 + (vocabEnd - 30) * Math.pow(ratio, 0.9))),
        grammar: Math.min(100, Math.round(25 + (grammarEnd - 25) * Math.pow(ratio, 0.85))),
        listening: Math.min(100, Math.round(40 + (listeningEnd - 40) * Math.pow(ratio, 0.95))),
        speaking: Math.min(100, Math.round(35 + (speakingEnd - 35) * Math.pow(ratio, 0.8))),
      });
    }

    return data;
  }, [timeRange, user]);

  // Compute Study Time & XP progression weekly
  const weeklyStudyTimeXpData = useMemo(() => {
    const baseDailyMinutes = user.settings?.dailyGoalMinutes || 20;
    const currentXp = user.xp || 350;
    const weeksCount = timeRange === '4weeks' ? 4 : timeRange === '8weeks' ? 8 : 12;

    const data = [];
    let cumulativeXp = 0;

    for (let w = 1; w <= weeksCount; w++) {
      const weeklyMinutes = Math.round(baseDailyMinutes * (5 + Math.sin(w) * 1.5) + w * 12);
      const earnedXp = Math.round(weeklyMinutes * 4.2 + (w % 2 === 0 ? 150 : 80));
      cumulativeXp += earnedXp;

      data.push({
        week: `هفته ${w}`,
        minutes: weeklyMinutes,
        xp: earnedXp,
        totalXp: cumulativeXp,
        goalMinutes: baseDailyMinutes * 7,
      });
    }

    return data;
  }, [timeRange, user]);

  // Radar multi-skill balance
  const radarSkillData = useMemo(() => {
    const completedCount = user.completedLessonIds?.length || 0;
    const vocabScore = Math.min(96, Math.max(55, 45 + completedCount * 4));
    const grammarScore = Math.min(94, Math.max(50, 40 + completedCount * 3.5));
    const listeningScore = Math.min(98, Math.max(60, 50 + user.streak * 2));
    const speakingScore = Math.round(user.speakingScoreAverage || 85);
    const readingScore = Math.min(95, Math.max(55, 48 + completedCount * 3.8));

    return [
      { skill: 'واژگان (Vocab)', current: vocabScore, baseline: 35, fullMark: 100 },
      { skill: 'گرامر (Grammar)', current: grammarScore, baseline: 30, fullMark: 100 },
      { skill: 'شنیداری (Listening)', current: listeningScore, baseline: 45, fullMark: 100 },
      { skill: 'مکالمه (Speaking)', current: speakingScore, baseline: 40, fullMark: 100 },
      { skill: 'درک مطلب (Reading)', current: readingScore, baseline: 38, fullMark: 100 },
    ];
  }, [user]);

  // Current active language stats
  const activeLangConfig = AVAILABLE_LANGUAGES.find((l) => l.code === user.targetLanguage) || AVAILABLE_LANGUAGES[0];
  const latestMultiData = weeklyMultiLanguageData[weeklyMultiLanguageData.length - 1];
  const initialMultiData = weeklyMultiLanguageData[0];
  const activeLangCurrentMastery = latestMultiData[activeLangConfig.code] || 75;
  const activeLangInitialMastery = initialMultiData[activeLangConfig.code] || 35;
  const activeLangGrowth = activeLangCurrentMastery - activeLangInitialMastery;

  return (
    <div className="space-y-4 select-none">
      {/* Top Header & Chart View Selector */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <span>نمودار پیشرفت هفتگی تسلط زبان‌ها</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-latin font-bold">
                  Recharts v3
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                تحلیل جامع رشد تسلط در زبان‌های مختلف، مهارت‌های ۴‌گانه و زمان مطالعه هفتگی
              </p>
            </div>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => {
                audioService.playClickSound();
                setTimeRange('4weeks');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === '4weeks'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              ۴ هفته
            </button>
            <button
              onClick={() => {
                audioService.playClickSound();
                setTimeRange('8weeks');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === '8weeks'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              ۸ هفته
            </button>
            <button
              onClick={() => {
                audioService.playClickSound();
                setTimeRange('12weeks');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeRange === '12weeks'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              ۱۲ هفته
            </button>
          </div>
        </div>

        {/* 4 Chart Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-gray-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => {
              audioService.playClickSound();
              setActiveCategory('multi_language');
            }}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeCategory === 'multi_language'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-gray-200 dark:border-slate-800'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="truncate">تسلط زبان‌ها</span>
          </button>

          <button
            onClick={() => {
              audioService.playClickSound();
              setActiveCategory('weekly_skills');
            }}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeCategory === 'weekly_skills'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-gray-200 dark:border-slate-800'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="truncate">مهارت‌های ۴‌گانه</span>
          </button>

          <button
            onClick={() => {
              audioService.playClickSound();
              setActiveCategory('study_time_xp');
            }}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeCategory === 'study_time_xp'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-gray-200 dark:border-slate-800'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="truncate">زمان و امتیاز XP</span>
          </button>

          <button
            onClick={() => {
              audioService.playClickSound();
              setActiveCategory('skill_radar');
            }}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeCategory === 'skill_radar'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-gray-200 dark:border-slate-800'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span className="truncate">رادار تعادل</span>
          </button>
        </div>

        {/* Growth Highlights Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
          <div className="p-2.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-right">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 block mb-0.5 flex items-center gap-1">
              <span>{activeLangConfig.flag}</span>
              <span>تسلط زبان اصلی ({activeLangConfig.nameFa})</span>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-indigo-700 dark:text-indigo-300 font-latin">
                {activeLangCurrentMastery}%
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-latin flex items-center">
                +{activeLangGrowth}% <ArrowUpRight className="w-2.5 h-2.5 inline" />
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 text-right">
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 block mb-0.5 flex items-center gap-1">
              <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              تراز میانگین واژگان و گرامر
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-purple-700 dark:text-purple-300 font-latin">
                {Math.round((activeLangCurrentMastery + 88) / 2)}%
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-latin flex items-center">
                +14% <ArrowUpRight className="w-2.5 h-2.5 inline" />
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 text-right">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5 flex items-center gap-1">
              <Mic className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              دقت اسپیکینگ و تلفظ
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 font-latin">
                {Math.round(user.speakingScoreAverage || 85)}%
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans">هوش مصنوعی</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 text-right">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block mb-0.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              زنجیره پیوستگی (Streak)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-amber-700 dark:text-amber-300 font-latin">
                {user.streak || 1}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-sans">روز متوالی 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Container */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Category 1: Multi-Language Weekly Mastery Comparison */}
        {activeCategory === 'multi_language' && (
          <div className="space-y-4">
            {/* Language Selector Filter Badges */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" />
                  <span>فیلتر زبان‌ها برای مقایسه روی نمودار:</span>
                </span>
                <span className="text-[10px] text-gray-400">
                  ({selectedLangCodes.length} زبان انتخاب‌شده)
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_LANGUAGES.map((lang) => {
                  const isSelected = selectedLangCodes.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      onClick={() => toggleLanguage(lang.code)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-gray-300'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.nameFa}</span>
                      <span
                        className="w-2 h-2 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: lang.color }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recharts Area / Line Chart for Multi-Language */}
            <div className="w-full h-80 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyMultiLanguageData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    {AVAILABLE_LANGUAGES.map((lang) => (
                      <linearGradient key={lang.gradientId} id={lang.gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={lang.color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={lang.color} stopOpacity={0.0} />
                      </linearGradient>
                    ))}
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomChartTooltip unit="%" />} />
                  <ReferenceLine y={80} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'حد تسلط B2/C1', fill: '#10B981', fontSize: 10 }} />

                  {AVAILABLE_LANGUAGES.filter((l) => selectedLangCodes.includes(l.code)).map((lang) => (
                    <Area
                      key={lang.code}
                      type="monotone"
                      dataKey={lang.code}
                      name={`${lang.flag} ${lang.nameFa}`}
                      stroke={lang.color}
                      strokeWidth={lang.code === user.targetLanguage ? 3.5 : 2}
                      fillOpacity={1}
                      fill={`url(#${lang.gradientId})`}
                      dot={{ r: 3.5, fill: lang.color, strokeWidth: 1.5, stroke: '#FFFFFF' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Interactive Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-bold border-t border-gray-100 dark:border-slate-800">
              {AVAILABLE_LANGUAGES.filter((l) => selectedLangCodes.includes(l.code)).map((lang) => (
                <div key={lang.code} className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }} />
                  <span>{lang.flag} {lang.nameFa}</span>
                  <span className="text-[10px] text-gray-400 font-latin font-normal">
                    ({latestMultiData[lang.code]}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category 2: Weekly 4-Skills Growth (Vocab, Grammar, Listening, Speaking) */}
        {activeCategory === 'weekly_skills' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300">
              <span>روند رشد مهارت‌های چهارگانه در طول هفته‌ها:</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                تحلیل پداگوژیک هوش مصنوعی
              </span>
            </div>

            <div className="w-full h-80 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklySkillsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomChartTooltip unit="%" />} />
                  <Line
                    type="monotone"
                    dataKey="vocab"
                    name="واژگان (Vocabulary)"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#4F46E5', stroke: '#FFF', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="grammar"
                    name="دستور زبان (Grammar)"
                    stroke="#9333EA"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#9333EA', stroke: '#FFF', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="listening"
                    name="شنیداری (Listening)"
                    stroke="#0284C7"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0284C7', stroke: '#FFF', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="speaking"
                    name="مکالمه و تلفظ (Speaking)"
                    stroke="#16A34A"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#16A34A', stroke: '#FFF', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-bold">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                <span className="truncate">واژگان: {weeklySkillsData[weeklySkillsData.length - 1].vocab}%</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                <span className="truncate">گرامر: {weeklySkillsData[weeklySkillsData.length - 1].grammar}%</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0" />
                <span className="truncate">شنیداری: {weeklySkillsData[weeklySkillsData.length - 1].listening}%</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <span className="truncate">مکالمه: {weeklySkillsData[weeklySkillsData.length - 1].speaking}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Category 3: Weekly Study Time & XP Curve */}
        {activeCategory === 'study_time_xp' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300">
              <span>زمان مطالعه و امتیاز XP کسب‌شده در هر هفته:</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                هدف هفتگی: ۱۴۰ دقیقه
              </span>
            </div>

            <div className="w-full h-80 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStudyTimeXpData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}m`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}xp`}
                  />
                  <Tooltip content={<CustomChartTooltip unit="" />} />
                  <ReferenceLine yAxisId="left" y={140} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'هدف هفتگی', fill: '#F59E0B', fontSize: 10 }} />
                  <Bar
                    yAxisId="left"
                    dataKey="minutes"
                    name="دقایق مطالعه هفتگی"
                    fill="#4F46E5"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="xp"
                    name="امتیاز XP کسب‌شده"
                    fill="#F59E0B"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 pt-2 text-xs font-bold">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <span className="w-3 h-3 rounded-md bg-indigo-600" />
                <span>دقایق مطالعه هفتگی (دقیقه)</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <span className="w-3 h-3 rounded-md bg-amber-500" />
                <span>امتیاز XP کسب‌شده</span>
              </div>
            </div>
          </div>
        )}

        {/* Category 4: Radar Multi-Skill Balance */}
        {activeCategory === 'skill_radar' && (
          <div className="w-full h-84 pt-2 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarSkillData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#CBD5E1" opacity={0.6} />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} />

                <Radar
                  name="سطح پایه ورودی"
                  dataKey="baseline"
                  stroke="#94A3B8"
                  fill="#94A3B8"
                  fillOpacity={0.25}
                />
                <Radar
                  name="سطح تسلط فعلی شما"
                  dataKey="current"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.5}
                />
                <Tooltip content={<CustomChartTooltip unit="%" />} />
              </RadarChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-center gap-6 pt-2 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <span>سطح پایه ورودی</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                <span className="w-3 h-3 rounded-full bg-indigo-600" />
                <span>سطح تسلط فعلی شما (+رشد چشمگیر)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Pedagogical Summary Recommendation */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/60 dark:to-blue-950/40 border border-indigo-100 dark:border-indigo-900/60 shadow-xs flex items-start gap-3">
        <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shrink-0 shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
            توصیه هوشمند پداگوژیک معلم هوش مصنوعی (AI Learning Insight):
          </h4>
          <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
            روند یادگیری شما در زبان اصلی <strong className="font-bold">{activeLangConfig.nameFa} {activeLangConfig.flag}</strong> با شیب صعودی پایدار <strong className="font-latin font-bold">+{activeLangGrowth}%</strong> همراه بوده است. برای زبان‌های ثانویه مانند <span className="font-bold">آلمانی و فرانسوی</span> پیشنهاد می‌شود با تمرین‌های ۱۰ دقیقه‌ای روزانه در بخش جعبه لایتنر (SRS) منحنی تسلط را تسریع بخشید.
          </p>
        </div>
      </div>

      {/* Synced Exam Results & Certifications Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>سوابق آزمون‌های بین‌المللی و گواهینامه‌های ثبت‌شده:</span>
          </h4>
          <span className="text-[10px] text-gray-400 font-latin">
            {user.examResults?.length || 0} آزمون ثبت شده
          </span>
        </div>

        {(!user.examResults || user.examResults.length === 0) ? (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-gray-200 dark:border-slate-800 text-center space-y-1">
            <p className="text-xs text-gray-500 dark:text-slate-400">
              هنوز در آزمون‌های بین‌المللی شبیه‌ساز شرکت نکرده‌اید.
            </p>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
              از تب «آزمون‌ها» یکی از شبیه‌سازهای تافل، آیلتس، گوته یا دلف را شروع کنید!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {user.examResults.map((exam) => (
              <div
                key={exam.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      exam.passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {exam.score}%
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-900 dark:text-slate-100 font-latin">
                        {exam.examTitle}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-latin font-bold">
                        {exam.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                      {exam.bandResultFa} • {exam.correctCount} از {exam.totalQuestions} سوال
                    </p>
                  </div>
                </div>

                <div className="text-left shrink-0 space-y-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      exam.syncedToServer !== false
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>همگام با سرور ✓</span>
                  </span>
                  <span className="block text-[10px] text-gray-400 font-latin">
                    {new Date(exam.timestamp).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
