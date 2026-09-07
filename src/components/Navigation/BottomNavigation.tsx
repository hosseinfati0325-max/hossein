import React from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap,
  BookOpen,
  Bot,
  BrainCircuit,
  Trophy,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, user } = useApp();

  const navItems = [
    {
      id: 'learn' as const,
      label: 'یادگیری',
      icon: GraduationCap,
      badge: user.hearts === 0 ? '!' : undefined,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'grammar' as const,
      label: 'گرامر',
      icon: BookOpen,
      badge: 'جدید',
      badgeColor: 'bg-indigo-500',
    },
    {
      id: 'ai_tutor' as const,
      label: 'معلم AI',
      icon: Bot,
      isAi: true,
      badge: 'AI',
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'srs' as const,
      label: 'فلش‌کارت',
      icon: BrainCircuit,
      badge: user.srsCards.filter((c) => c.state !== 'mastered').length > 0 ? String(user.srsCards.length) : undefined,
      badgeColor: 'bg-purple-500',
    },
    {
      id: 'exams' as const,
      label: 'لیگ',
      icon: Trophy,
      badge: user.leagueRank ? `#${user.leagueRank}` : undefined,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'settings' as const,
      label: 'تنظیمات',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-slate-800 px-1 sm:px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] max-w-md mx-auto sm:max-w-2xl md:max-w-4xl shadow-lg transition-colors">
      <div className="flex items-center justify-around gap-0.5 sm:gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-${item.id}-btn`}
              onClick={() => {
                setActiveTab(item.id);
                audioService.playClickSound();
              }}
              className={`relative flex-1 min-w-0 flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-3 rounded-2xl transition-all cursor-pointer select-none active:scale-95 touch-manipulation ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active Indicator Background */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800/80 rounded-2xl -z-10 shadow-xs"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400'}`} />

                {/* Badge if present */}
                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 text-[8px] sm:text-[9px] font-latin font-bold text-white px-1.5 py-0.2 rounded-full ${
                      item.badgeColor === 'bg-emerald-500' ? 'bg-indigo-600' : item.badgeColor
                    } shadow-xs`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] sm:text-[11px] mt-0.5 sm:mt-1 truncate max-w-full leading-tight ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
