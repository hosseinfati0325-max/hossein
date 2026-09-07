import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProgress,
  TargetLanguageCode,
  ExplanationLanguageCode,
  CEFRLevel,
  UserSettings,
  SRSCard,
  WeaknessRecord,
  ExamResultRecord,
  SyncStatus,
  SyncLogEntry,
} from '../types';
import { storageService, DEFAULT_USER_PROGRESS } from '../services/storageService';
import { audioService } from '../services/audioService';
import { syncService } from '../services/syncService';
import { confettiService } from '../services/confettiService';
import { CelebrationModal, CelebrationModalData } from '../components/Gamification/CelebrationModal';

interface AppContextType {
  user: UserProgress;
  setUser: React.Dispatch<React.SetStateAction<UserProgress>>;
  profiles: UserProgress[];
  switchProfile: (profileId: string) => void;
  createProfile: (
    firstName: string,
    lastName: string,
    avatar: string,
    targetLang: TargetLanguageCode,
  ) => UserProgress;
  updateCurrentProfileName: (firstName: string, lastName: string, avatar?: string) => void;
  deleteProfile: (profileId: string) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isCapacityModalOpen: boolean;
  setIsCapacityModalOpen: (open: boolean) => void;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (open: boolean) => void;
  realCapacity: number;
  getCapacityData: () => {
    totalRegistered: number;
    activeToday: number;
    byLanguage: Record<string, number>;
    members: UserProgress[];
  };
  setTargetLanguage: (lang: TargetLanguageCode) => void;
  setExplanationLanguage: (lang: ExplanationLanguageCode) => void;
  setCurrentLevel: (level: CEFRLevel) => void;
  addXP: (amount: number) => void;
  addGems: (amount: number) => void;
  deductHeart: () => boolean;
  refillHearts: () => boolean;
  completeLesson: (lessonId: string, xp: number, gems: number) => void;
  rateSRSCard: (cardId: string, rating: 1 | 2 | 3 | 4) => void;
  addSRSCard: (card: SRSCard) => void;
  addSRSCards: (cards: SRSCard[]) => void;
  resetSRSDeck: (language?: TargetLanguageCode) => void;
  deleteSRSCard: (cardId: string) => void;
  recordExamResult: (
    examId: string,
    examTitle: string,
    examSubtitleFa: string,
    level: CEFRLevel,
    score: number,
    correctCount: number,
    totalQuestions: number,
    bandResultFa: string,
  ) => ExamResultRecord;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  addStudyTime: (seconds: number) => void;
  triggerCelebration: (type?: 'standard' | 'lesson' | 'grammar' | 'exam' | 'streak' | 'levelup' | 'battle') => void;
  showCelebrationModal: (data: {
    title: string;
    subtitle?: string;
    xpReward?: number;
    gemReward?: number;
    streakDays?: number;
    badge?: string;
    scorePercent?: number;
    category?: 'grammar' | 'exam' | 'lesson' | 'duel' | 'srs' | 'general';
  }) => void;
  markGrammarLessonMastered: (ruleId: string, ruleTitleFa: string) => void;
  recordMistakeTopic: (topic: string) => void;
  improveWeaknessMastery: (weaknessId: string, boostPercent?: number) => void;
  deleteWeakness: (weaknessId: string) => void;
  addCustomWeakness: (weakness: WeaknessRecord) => void;
  resetWeaknesses: (language?: TargetLanguageCode) => void;
  recordAiBattle: (won: boolean, xpGained: number, gemsGained: number) => void;
  resetProgress: () => void;
  // Background Sync state & methods
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingSyncCount: number;
  lastSyncedAt: string | null;
  lastSyncMessage: string;
  syncLogs: SyncLogEntry[];
  syncNow: () => Promise<{ success: boolean; syncedCount: number; error?: string }>;
  clearSyncQueue: () => void;
  checkConnectivity: () => Promise<boolean>;
  isDarkMode: boolean;
  toggleTheme: () => void;
  activeTab: 'learn' | 'grammar' | 'ai_tutor' | 'srs' | 'exams' | 'league' | 'settings';
  setActiveTab: (tab: 'learn' | 'grammar' | 'ai_tutor' | 'srs' | 'exams' | 'league' | 'settings') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProgress>(() => storageService.loadProgress());
  const [profiles, setProfiles] = useState<UserProgress[]>(() => storageService.getAllProfiles());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'learn' | 'grammar' | 'ai_tutor' | 'srs' | 'exams' | 'league' | 'settings'>('learn');
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    xpReward?: number;
    gemReward?: number;
    streakDays?: number;
    badge?: string;
    scorePercent?: number;
    category?: 'grammar' | 'exam' | 'lesson' | 'duel' | 'srs' | 'general';
  }>({
    isOpen: false,
    title: '',
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Background sync state reactive listener
  const [syncState, setSyncState] = useState(() => syncService.getState());
  const [networkCapacity, setNetworkCapacity] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = syncService.subscribe((state) => {
      setSyncState(state);
      if (state.isOnline) {
        syncService.registerUserToNetwork(user).then((cap) => {
          if (cap) setNetworkCapacity(cap);
        });
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Initial network registration and capacity fetch
  useEffect(() => {
    syncService.registerUserToNetwork(user).then((cap) => {
      if (cap) setNetworkCapacity(cap);
    });

    const handleCapacityUpdate = (event: any) => {
      if (event.detail) {
        setNetworkCapacity(event.detail);
      }
    };

    window.addEventListener('network-capacity-updated', handleCapacityUpdate);
    return () => window.removeEventListener('network-capacity-updated', handleCapacityUpdate);
  }, [user.id]);

  const realCapacity = networkCapacity?.totalRegistered || profiles.length;

  const getCapacityData = useCallback(() => {
    if (networkCapacity) {
      return {
        totalProfiles: networkCapacity.totalRegistered,
        activeProfiles: networkCapacity.activeToday,
        activeOnlineNow: networkCapacity.activeOnlineNow,
        byLanguage: networkCapacity.byLanguage || {},
        allProfiles: networkCapacity.members || profiles,
      };
    }
    return storageService.getRealCapacityData();
  }, [networkCapacity, profiles]);

  // Listen to system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode =
    user.settings.theme === 'dark' || (user.settings.theme === 'system' && systemPrefersDark);

  // Apply dark mode class to document element and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save progress locally & queue background sync
  useEffect(() => {
    storageService.saveProgress(user);
    // Queue snapshot to syncService for auto-push
    syncService.enqueue(
      user.id,
      'progress_snapshot',
      {
        id: user.id,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        gems: user.gems,
        completedLessonIds: user.completedLessonIds,
        examResults: user.examResults || [],
        dailyStudyTimeSeconds: user.dailyStudyTimeSeconds,
      },
      'ذخیره پیشرفت تحصیلی',
      user,
    );
  }, [user]);

  // Switch profile
  const switchProfile = useCallback((profileId: string) => {
    const target = storageService.switchProfile(profileId);
    if (target) {
      setUser(target);
      setProfiles(storageService.getAllProfiles());
    }
  }, []);

  // Create new profile
  const createProfile = useCallback(
    (
      firstName: string,
      lastName: string,
      avatar: string,
      targetLang: TargetLanguageCode,
    ): UserProgress => {
      const newProfile = storageService.createProfile(firstName, lastName, avatar, targetLang);
      setProfiles(storageService.getAllProfiles());
      setUser(newProfile);
      return newProfile;
    },
    [],
  );

  // Update profile name & avatar
  const updateCurrentProfileName = useCallback((firstName: string, lastName: string, avatar?: string) => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    setUser((prev) => {
      const updated = {
        ...prev,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: fullName,
        ...(avatar ? { avatar } : {}),
      };
      return updated;
    });
    setProfiles((prevList) => {
      return prevList.map((p) =>
        p.id === user.id
          ? {
              ...p,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              name: fullName,
              ...(avatar ? { avatar } : {}),
            }
          : p,
      );
    });
  }, [user.id]);

  // Delete profile
  const deleteProfile = useCallback(
    (profileId: string) => {
      const nextActive = storageService.deleteProfile(profileId);
      setProfiles(storageService.getAllProfiles());
      setUser(nextActive);
    },
    [],
  );

  const toggleTheme = useCallback(() => {
    setUser((prev) => {
      const current = prev.settings.theme;
      const nextTheme = current === 'dark' ? 'light' : current === 'light' ? 'system' : 'dark';
      return {
        ...prev,
        settings: {
          ...prev.settings,
          theme: nextTheme,
        },
      };
    });
  }, []);

  // Daily streak check
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const isConsecutive = user.lastActiveDate === yesterday;

      setUser((prev) => {
        const newStreak = isConsecutive ? prev.streak + 1 : 1;
        const newStreakDays = prev.streakDays.includes(today)
          ? prev.streakDays
          : [...prev.streakDays.slice(-30), today];

        return {
          ...prev,
          streak: newStreak,
          lastActiveDate: today,
          streakDays: newStreakDays,
        };
      });
    }
  }, [user.lastActiveDate]);

  // Switch target language (English, German, French)
  const setTargetLanguage = useCallback((lang: TargetLanguageCode) => {
    setUser((prev) => ({
      ...prev,
      targetLanguage: lang,
    }));
    audioService.playClickSound();
  }, []);

  // Switch explanation language (Persian, English, German, French)
  const setExplanationLanguage = useCallback((lang: ExplanationLanguageCode) => {
    setUser((prev) => ({
      ...prev,
      explanationLanguage: lang,
      settings: {
        ...prev.settings,
        explanationLanguage: lang,
      },
    }));
    audioService.playClickSound();
  }, []);

  const setCurrentLevel = useCallback((level: CEFRLevel) => {
    setUser((prev) => ({
      ...prev,
      currentLevel: level,
    }));
  }, []);

  const addXP = useCallback((amount: number) => {
    setUser((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      const newLeagueXp = prev.leagueXp + amount;
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        leagueXp: newLeagueXp,
      };
    });
  }, []);

  const addGems = useCallback((amount: number) => {
    setUser((prev) => ({
      ...prev,
      gems: prev.gems + amount,
    }));
  }, []);

  const deductHeart = useCallback((): boolean => {
    let hasHeartsLeft = true;
    setUser((prev) => {
      if (prev.hearts > 1) {
        audioService.playHeartLossSound();
        return {
          ...prev,
          hearts: prev.hearts - 1,
          lastHeartLossTime: Date.now(),
        };
      } else {
        hasHeartsLeft = false;
        audioService.playHeartLossSound();
        return {
          ...prev,
          hearts: 0,
          lastHeartLossTime: Date.now(),
        };
      }
    });
    return hasHeartsLeft;
  }, []);

  const refillHearts = useCallback((): boolean => {
    let success = false;
    setUser((prev) => {
      if (prev.gems >= 50 && prev.hearts < prev.maxHearts) {
        audioService.playFanfareSound();
        success = true;
        return {
          ...prev,
          gems: prev.gems - 50,
          hearts: prev.maxHearts,
        };
      }
      return prev;
    });
    return success;
  }, []);

  const triggerCelebration = useCallback((type: 'standard' | 'lesson' | 'grammar' | 'exam' | 'streak' | 'levelup' | 'battle' = 'standard') => {
    confettiService.triggerCelebration(type);
  }, []);

  const showCelebrationModal = useCallback((data: {
    title: string;
    subtitle?: string;
    xpReward?: number;
    gemReward?: number;
    streakDays?: number;
    badge?: string;
    scorePercent?: number;
    category?: 'grammar' | 'exam' | 'lesson' | 'duel' | 'srs' | 'general';
  }) => {
    setCelebrationData({
      isOpen: true,
      ...data,
    });
  }, []);

  const markGrammarLessonMastered = useCallback((ruleId: string, ruleTitleFa: string) => {
    const xpReward = 25;
    const gemReward = 5;
    setUser((prev) => {
      const isAlreadyCompleted = prev.completedLessonIds.includes(`grammar_${ruleId}`);
      const newCompleted = isAlreadyCompleted ? prev.completedLessonIds : [...prev.completedLessonIds, `grammar_${ruleId}`];
      const newXp = prev.xp + (isAlreadyCompleted ? 5 : xpReward);
      const newGems = prev.gems + (isAlreadyCompleted ? 1 : gemReward);
      const newLevel = Math.floor(newXp / 100) + 1;
      const newStudySeconds = (prev.dailyStudyTimeSeconds || 0) + 240;

      return {
        ...prev,
        completedLessonIds: newCompleted,
        xp: newXp,
        gems: newGems,
        level: newLevel,
        dailyStudyTimeSeconds: newStudySeconds,
      };
    });

    showCelebrationModal({
      title: 'تسلط بر مبحث گرامر!',
      subtitle: `شما مبحث «${ruleTitleFa}» را با موفقیت بررسی و مسلط شدید.`,
      xpReward,
      gemReward,
      category: 'grammar',
    });
  }, [showCelebrationModal]);

  const completeLesson = useCallback((lessonId: string, xpReward: number, gemReward: number) => {
    setUser((prev) => {
      const isAlreadyCompleted = prev.completedLessonIds.includes(lessonId);
      const newCompleted = isAlreadyCompleted ? prev.completedLessonIds : [...prev.completedLessonIds, lessonId];
      const newXp = prev.xp + xpReward;
      const newGems = prev.gems + gemReward;
      const newLevel = Math.floor(newXp / 100) + 1;
      const newStudySeconds = (prev.dailyStudyTimeSeconds || 0) + 180; // +3 minutes per lesson

      return {
        ...prev,
        completedLessonIds: newCompleted,
        xp: newXp,
        gems: newGems,
        level: newLevel,
        totalWordsLearned: prev.totalWordsLearned + 4,
        dailyStudyTimeSeconds: newStudySeconds,
      };
    });
    triggerCelebration('lesson');
  }, [triggerCelebration]);

  const rateSRSCard = useCallback((cardId: string, rating: 1 | 2 | 3 | 4) => {
    setUser((prev) => {
      const cardIndex = prev.srsCards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return prev;

      const updatedCard = storageService.processSRSRating(prev.srsCards[cardIndex], rating);
      const updatedCards = [...prev.srsCards];
      updatedCards[cardIndex] = updatedCard;

      return {
        ...prev,
        srsCards: updatedCards,
        xp: prev.xp + (rating >= 3 ? 5 : 2),
        dailyStudyTimeSeconds: (prev.dailyStudyTimeSeconds || 0) + 30, // +30s per SRS card review
      };
    });
  }, []);

  const addSRSCard = useCallback((card: SRSCard) => {
    setUser((prev) => {
      const existing = prev.srsCards.some((c) => c.id === card.id);
      if (existing) return prev;
      return {
        ...prev,
        srsCards: [card, ...prev.srsCards],
        gems: prev.gems + 2,
      };
    });
  }, []);

  const addSRSCards = useCallback((cards: SRSCard[]) => {
    setUser((prev) => {
      const existingIds = new Set(prev.srsCards.map((c) => c.id));
      const newCards = cards.filter((c) => !existingIds.has(c.id));
      return {
        ...prev,
        srsCards: [...newCards, ...prev.srsCards],
        gems: prev.gems + (newCards.length * 2),
      };
    });
  }, []);

  const resetSRSDeck = useCallback((language?: TargetLanguageCode) => {
    setUser((prev) => {
      const targetLang = language || prev.targetLanguage;
      const nowIso = new Date().toISOString();
      const updatedCards = prev.srsCards.map((c) => {
        if (c.language === targetLang) {
          return {
            ...c,
            nextReviewDate: nowIso,
            state: 'learning' as const,
          };
        }
        return c;
      });
      return {
        ...prev,
        srsCards: updatedCards,
      };
    });
  }, []);

  const deleteSRSCard = useCallback((cardId: string) => {
    setUser((prev) => ({
      ...prev,
      srsCards: prev.srsCards.filter((c) => c.id !== cardId),
    }));
  }, []);

  // Record Exam Result and queue for cloud sync
  const recordExamResult = useCallback(
    (
      examId: string,
      examTitle: string,
      examSubtitleFa: string,
      level: CEFRLevel,
      score: number,
      correctCount: number,
      totalQuestions: number,
      bandResultFa: string,
    ): ExamResultRecord => {
      const record: ExamResultRecord = {
        id: `exam_res_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: user.id,
        userName: user.firstName ? `${user.firstName} ${user.lastName}` : user.name,
        examId,
        examTitle,
        examSubtitleFa,
        targetLanguage: user.targetLanguage,
        level,
        score,
        correctCount,
        totalQuestions,
        passed: score >= 60,
        bandResultFa,
        timestamp: new Date().toISOString(),
        syncedToServer: syncState.isOnline,
      };

      const xpGained = Math.round(score * 1.5) + 30;
      const gemsGained = score >= 80 ? 25 : score >= 60 ? 15 : 5;

      setUser((prev) => {
        const existingResults = prev.examResults || [];
        return {
          ...prev,
          examResults: [record, ...existingResults],
          xp: prev.xp + xpGained,
          gems: prev.gems + gemsGained,
          leagueXp: prev.leagueXp + xpGained,
          dailyStudyTimeSeconds: (prev.dailyStudyTimeSeconds || 0) + 600, // +10 minutes for exam
        };
      });

      // Queue in sync service for immediate push or offline sync on reconnection
      syncService.enqueue(
        user.id,
        'exam_result',
        record,
        `ثبت کارنامه آزمون ${examTitle} (${score}%)`,
        user,
      );

      triggerCelebration();
      return record;
    },
    [user, syncState.isOnline, triggerCelebration],
  );

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setUser((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
      },
    }));
  }, []);

  const addStudyTime = useCallback((seconds: number) => {
    setUser((prev) => {
      const newStudySeconds = (prev.dailyStudyTimeSeconds || 0) + seconds;
      const targetSeconds = (prev.settings?.dailyGoalMinutes || 15) * 60;
      const wasAchieved = (prev.dailyStudyTimeSeconds || 0) >= targetSeconds;
      const nowAchieved = newStudySeconds >= targetSeconds;

      if (!wasAchieved && nowAchieved) {
        triggerCelebration();
      }

      return {
        ...prev,
        dailyStudyTimeSeconds: newStudySeconds,
      };
    });
  }, [triggerCelebration]);

  const recordMistakeTopic = useCallback((topic: string) => {
    setUser((prev) => {
      const updatedWeaknesses = storageService.recordMistake(prev.weaknesses, topic, prev.targetLanguage);
      return {
        ...prev,
        weaknesses: updatedWeaknesses,
      };
    });
  }, []);

  const improveWeaknessMastery = useCallback((weaknessId: string, boostPercent: number = 25) => {
    setUser((prev) => {
      const weaknesses = Array.isArray(prev.weaknesses) ? prev.weaknesses : [];
      const updated = weaknesses.map((w) => {
        if (w.id === weaknessId) {
          const newMastery = Math.min(100, (w.masteryPercent || 0) + boostPercent);
          return {
            ...w,
            masteryPercent: newMastery,
            mistakeCount: Math.max(0, (w.mistakeCount || 1) - 1),
          };
        }
        return w;
      });
      return {
        ...prev,
        weaknesses: updated,
        xp: prev.xp + 15,
        gems: prev.gems + 3,
      };
    });
  }, []);

  const deleteWeakness = useCallback((weaknessId: string) => {
    setUser((prev) => {
      const weaknesses = Array.isArray(prev.weaknesses) ? prev.weaknesses : [];
      return {
        ...prev,
        weaknesses: weaknesses.filter((w) => w.id !== weaknessId),
      };
    });
  }, []);

  const addCustomWeakness = useCallback((weakness: WeaknessRecord) => {
    setUser((prev) => {
      const weaknesses = Array.isArray(prev.weaknesses) ? prev.weaknesses : [];
      const existing = weaknesses.some((w) => w.id === weakness.id);
      if (existing) return prev;
      return {
        ...prev,
        weaknesses: [weakness, ...weaknesses],
        gems: prev.gems + 2,
      };
    });
  }, []);

  const resetWeaknesses = useCallback((language?: TargetLanguageCode) => {
    setUser((prev) => {
      const targetLang = language || prev.targetLanguage;
      const starter: WeaknessRecord = {
        id: `weak_${targetLang}_${Date.now()}`,
        topicFa: 'حروف اضافه و ساختار جملات',
        topicNative: 'Prepositions & Sentence Structures',
        language: targetLang,
        category: 'Grammar',
        mistakeCount: 1,
        masteryPercent: 45,
        lastMistakeDate: new Date().toISOString(),
        recommendationFa: 'تمرین نقش‌آفرینی و ساخت جملات کوتاه روزمره',
      };
      const filtered = (prev.weaknesses || []).filter((w) => w.language !== targetLang);
      return {
        ...prev,
        weaknesses: [starter, ...filtered],
      };
    });
  }, []);

  const recordAiBattle = useCallback((won: boolean, xpGained: number, gemsGained: number) => {
    setUser((prev) => ({
      ...prev,
      xp: prev.xp + xpGained,
      gems: prev.gems + gemsGained,
      leagueXp: prev.leagueXp + xpGained,
      aiBattleWins: won ? (prev.aiBattleWins || 0) + 1 : (prev.aiBattleWins || 0),
      aiBattleLosses: !won ? (prev.aiBattleLosses || 0) + 1 : (prev.aiBattleLosses || 0),
    }));
    if (won) {
      triggerCelebration();
    }
  }, [triggerCelebration]);

  const resetProgress = useCallback(() => {
    setUser(DEFAULT_USER_PROGRESS);
    storageService.saveProgress(DEFAULT_USER_PROGRESS);
    syncService.clearQueue();
    audioService.playClickSound();
  }, []);

  const syncNow = useCallback(async () => {
    return await syncService.syncPendingQueue(user);
  }, [user]);

  const clearSyncQueue = useCallback(() => {
    syncService.clearQueue();
  }, []);

  const checkConnectivity = useCallback(async () => {
    return await syncService.checkConnectivity();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        profiles,
        switchProfile,
        createProfile,
        updateCurrentProfileName,
        deleteProfile,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isCapacityModalOpen,
        setIsCapacityModalOpen,
        isSyncModalOpen,
        setIsSyncModalOpen,
        realCapacity,
        getCapacityData,
        setTargetLanguage,
        setExplanationLanguage,
        setCurrentLevel,
        addXP,
        addGems,
        deductHeart,
        refillHearts,
        completeLesson,
        rateSRSCard,
        addSRSCard,
        addSRSCards,
        resetSRSDeck,
        deleteSRSCard,
        recordExamResult,
        updateSettings,
        addStudyTime,
        triggerCelebration,
        showCelebrationModal,
        markGrammarLessonMastered,
        recordMistakeTopic,
        improveWeaknessMastery,
        deleteWeakness,
        addCustomWeakness,
        resetWeaknesses,
        recordAiBattle,
        resetProgress,
        // Sync props
        isOnline: syncState.isOnline,
        syncStatus: syncState.syncStatus,
        pendingSyncCount: syncState.pendingCount,
        lastSyncedAt: syncState.lastSyncedAt,
        lastSyncMessage: syncState.lastSyncMessage || '',
        syncLogs: syncState.syncLogs,
        syncNow,
        clearSyncQueue,
        checkConnectivity,
        isDarkMode,
        toggleTheme,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
      <CelebrationModal
        isOpen={celebrationData.isOpen}
        title={celebrationData.title}
        subtitle={celebrationData.subtitle}
        xpReward={celebrationData.xpReward}
        gemReward={celebrationData.gemReward}
        streakDays={celebrationData.streakDays || user.streak}
        badge={celebrationData.badge}
        scorePercent={celebrationData.scorePercent}
        category={celebrationData.category}
        onClose={() => setCelebrationData((prev) => ({ ...prev, isOpen: false }))}
      />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
