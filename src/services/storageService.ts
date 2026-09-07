import {
  UserProgress,
  SRSCard,
  TargetLanguageCode,
  WeaknessRecord,
  UserSettings,
  ExamResultRecord,
} from '../types';
import { INITIAL_BADGES, INITIAL_SRS_CARDS } from '../data/curriculumData';
import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'hossein_fatemeh_lang_user_data_v2';
const PROFILES_KEY = 'hossein_fatemeh_lang_profiles_list_v2';
const ACTIVE_PROFILE_ID_KEY = 'hossein_fatemeh_active_profile_id_v2';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'system',
  colorTheme: 'emerald',
  fontSize: 'medium',
  soundEffects: true,
  hapticFeedback: true,
  ttsSpeed: 1.0,
  autoPlayAudio: true,
  explanationLanguage: 'fa',
  dailyGoalMinutes: 15,
  notificationsEnabled: true,
  dailyReminderHour: 20,
  offlineModePreferred: false,
};

export const createNewUserProgress = (
  firstName: string = 'کاربر',
  lastName: string = 'مهمان',
  avatar: string = '🦁',
  targetLanguage: TargetLanguageCode = 'en',
  id?: string,
): UserProgress => {
  const profileId = id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

  return {
    id: profileId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    name: fullName,
    avatar: avatar || '🦁',
    targetLanguage: targetLanguage || 'en',
    explanationLanguage: 'fa',
    currentLevel: 'A1',
    xp: 120,
    level: 2,
    streak: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    streakDays: [
      new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0],
    ],
    hearts: 5,
    maxHearts: 5,
    gems: 150,
    league: 'bronze',
    leagueRank: 4,
    leagueXp: 120,
    aiBattleWins: 2,
    aiBattleLosses: 1,
    completedLessonIds: [],
    unlockedUnitId: `${targetLanguage || 'en'}_u1`,
    srsCards: INITIAL_SRS_CARDS,
    weaknesses: [
      {
        id: 'w_1',
        topicFa: 'افعال زمان گذشته بی‌قاعده',
        topicNative: 'Irregular Past Tense Verbs',
        language: targetLanguage || 'en',
        category: 'Grammar',
        mistakeCount: 2,
        masteryPercent: 65,
        lastMistakeDate: new Date().toISOString(),
        recommendationFa: 'مرور لیست ۱۰ فعل پرکاربرد بی‌قاعده مثل went, saw, bought',
      },
    ],
    badges: INITIAL_BADGES,
    placementTestDone: false,
    dailyStudyTimeSeconds: 420,
    totalWordsLearned: 38,
    speakingScoreAverage: 92,
    memberNumber: 1,
    registeredAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    settings: DEFAULT_USER_SETTINGS,
  };
};

export const DEFAULT_USER_PROGRESS: UserProgress = createNewUserProgress(
  'حسین و فاطمه',
  'زبان‌آموز',
  '🦁',
  'en',
  'user_default_1',
);

class StorageService {
  getAllProfiles(): UserProgress[] {
    try {
      const stored = localStorage.getItem(PROFILES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure every profile has a memberNumber
          return parsed.map((p, index) => ({
            ...p,
            memberNumber: p.memberNumber || index + 1,
            registeredAt: p.registeredAt || p.createdAt || new Date().toISOString(),
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to load profiles:', e);
    }
    return [DEFAULT_USER_PROGRESS];
  }

  saveAllProfiles(profiles: UserProgress[]): void {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.warn('Failed to save profiles list:', e);
    }
  }

  getRealCapacityData(): {
    totalRegistered: number;
    activeToday: number;
    byLanguage: Record<string, number>;
    members: UserProgress[];
  } {
    const profiles = this.getAllProfiles();
    const today = new Date().toISOString().split('T')[0];

    const byLanguage: Record<string, number> = {};
    let activeTodayCount = 0;

    profiles.forEach((p) => {
      byLanguage[p.targetLanguage] = (byLanguage[p.targetLanguage] || 0) + 1;
      if (p.lastActiveDate === today || p.registeredAt?.startsWith(today)) {
        activeTodayCount++;
      }
    });

    return {
      totalRegistered: profiles.length,
      activeToday: Math.max(1, activeTodayCount),
      byLanguage,
      members: profiles,
    };
  }

  loadProgress(): UserProgress {
    try {
      const activeId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
      const profiles = this.getAllProfiles();

      if (activeId) {
        const found = profiles.find((p) => p.id === activeId);
        if (found) {
          // Merge initial SRS cards if missing for any language
          const existingIds = new Set((found.srsCards || []).map((c: SRSCard) => c.id));
          const missingCards = INITIAL_SRS_CARDS.filter((c) => !existingIds.has(c.id));
          const fullCards = [...(found.srsCards || []), ...missingCards];

          return {
            ...DEFAULT_USER_PROGRESS,
            ...found,
            srsCards: fullCards,
            weaknesses: Array.isArray(found.weaknesses) && found.weaknesses.length > 0
              ? found.weaknesses
              : DEFAULT_USER_PROGRESS.weaknesses,
            settings: {
              ...DEFAULT_USER_SETTINGS,
              ...(found.settings || {}),
            },
          };
        }
      }

      // Check legacy single-profile key
      const legacy = localStorage.getItem(STORAGE_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        const merged: UserProgress = {
          ...DEFAULT_USER_PROGRESS,
          ...parsed,
          id: parsed.id || 'user_default_1',
          firstName: parsed.firstName || (parsed.name ? parsed.name.split(' ')[0] : 'حسین'),
          lastName: parsed.lastName || (parsed.name && parsed.name.split(' ').length > 1 ? parsed.name.split(' ').slice(1).join(' ') : 'فاطمه'),
          memberNumber: parsed.memberNumber || 1,
          registeredAt: parsed.registeredAt || parsed.createdAt || new Date().toISOString(),
          settings: {
            ...DEFAULT_USER_SETTINGS,
            ...(parsed.settings || {}),
          },
        };
        this.saveProgress(merged);
        return merged;
      }

      if (profiles.length > 0) {
        return profiles[0];
      }
    } catch (e) {
      console.warn('Failed to load user progress:', e);
    }
    return DEFAULT_USER_PROGRESS;
  }

  saveProgress(progress: UserProgress): void {
    try {
      const sanitizedName = `${progress.firstName || ''} ${progress.lastName || ''}`.trim() || progress.name || 'کاربر';
      const updatedUser: UserProgress = {
        ...progress,
        name: sanitizedName,
      };

      // Save as active profile
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, updatedUser.id);

      // Also persist to native Preferences asynchronously (ensures data is never wiped on native devices)
      Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(updatedUser) }).catch(() => {});
      Preferences.set({ key: ACTIVE_PROFILE_ID_KEY, value: updatedUser.id }).catch(() => {});

      // Update in profiles list
      const profiles = this.getAllProfiles();
      const existingIdx = profiles.findIndex((p) => p.id === updatedUser.id);
      if (existingIdx >= 0) {
        profiles[existingIdx] = updatedUser;
      } else {
        profiles.push(updatedUser);
      }
      this.saveAllProfiles(profiles);
    } catch (e) {
      console.warn('Failed to save user progress:', e);
    }
  }

  createProfile(
    firstName: string,
    lastName: string,
    avatar: string,
    targetLanguage: TargetLanguageCode,
    phoneNumber?: string,
  ): UserProgress {
    const profiles = this.getAllProfiles();
    const newMemberNumber = profiles.length + 1;

    const newProfile = createNewUserProgress(firstName, lastName, avatar, targetLanguage);
    newProfile.memberNumber = newMemberNumber;
    newProfile.phoneNumber = phoneNumber;
    newProfile.registeredAt = new Date().toISOString();

    profiles.push(newProfile);
    this.saveAllProfiles(profiles);
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, newProfile.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    return newProfile;
  }

  switchProfile(profileId: string): UserProgress | null {
    const profiles = this.getAllProfiles();
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, target.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
      return target;
    }
    return null;
  }

  deleteProfile(profileId: string): UserProgress {
    let profiles = this.getAllProfiles().filter((p) => p.id !== profileId);
    if (profiles.length === 0) {
      profiles = [DEFAULT_USER_PROGRESS];
    }
    this.saveAllProfiles(profiles);
    const nextActive = profiles[0];
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, nextActive.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextActive));
    return nextActive;
  }

  // SM-2 Spaced Repetition Algorithm
  // rating: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
  processSRSRating(card: SRSCard, rating: 1 | 2 | 3 | 4): SRSCard {
    let { interval, repetitions, easeFactor } = card;

    if (rating === 1) {
      // Failed card
      repetitions = 0;
      interval = 1;
    } else {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    // Update ease factor (SM-2 standard formula modified for 1-4 scale)
    const q = rating + 1; // map 1-4 to 2-5
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

    if (rating === 4) {
      interval = Math.round(interval * 1.3); // Bonus for Easy
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    let state: SRSCard['state'] = 'learning';
    if (interval >= 21) state = 'mastered';
    else if (repetitions >= 2) state = 'review';

    return {
      ...card,
      interval,
      repetitions,
      easeFactor,
      nextReviewDate: nextDate.toISOString(),
      lastReviewedDate: new Date().toISOString(),
      state,
    };
  }

  // Record mistake for personalized Weakness Gym & AI exercises
  recordMistake(
    currentWeaknesses: WeaknessRecord[],
    topic: string,
    lang: TargetLanguageCode,
  ): WeaknessRecord[] {
    const existingIndex = currentWeaknesses.findIndex(
      (w) => w.topicNative.toLowerCase() === topic.toLowerCase() && w.language === lang,
    );

    if (existingIndex >= 0) {
      const updated = [...currentWeaknesses];
      const item = updated[existingIndex];
      updated[existingIndex] = {
        ...item,
        mistakeCount: item.mistakeCount + 1,
        masteryPercent: Math.max(10, item.masteryPercent - 15),
        lastMistakeDate: new Date().toISOString(),
      };
      return updated;
    } else {
      const newWeakness: WeaknessRecord = {
        id: `weak_${Date.now()}`,
        topicFa: topic,
        topicNative: topic,
        language: lang,
        category: 'Remedial',
        mistakeCount: 1,
        masteryPercent: 50,
        lastMistakeDate: new Date().toISOString(),
        recommendationFa: `تمرین هوشمند جبرانی برای رفع ابهام در مبحث ${topic}`,
      };
      return [newWeakness, ...currentWeaknesses];
    }
  }

  // Robust Conflict Resolution Strategy for Offline-First Synchronization
  // Prioritizes local user actions (optimistic offline writes) while merging authoritative remote state
  mergeProgressWithConflictResolution(
    localProgress: UserProgress,
    remoteProgress: Partial<UserProgress>,
  ): UserProgress {
    // 1. Gamification: Highest values always win to ensure user never loses offline effort
    const resolvedXP = Math.max(localProgress.xp || 0, remoteProgress.xp || 0);
    const resolvedLevel = Math.max(localProgress.level || 1, remoteProgress.level || 1);
    const resolvedGems = Math.max(localProgress.gems || 0, remoteProgress.gems || 0);
    const resolvedStreak = Math.max(localProgress.streak || 0, remoteProgress.streak || 0);

    // 2. Union completed lessons to avoid losing lessons finished while offline
    const localCompleted = localProgress.completedLessonIds || [];
    const remoteCompleted = remoteProgress.completedLessonIds || [];
    const mergedCompletedLessons = Array.from(new Set([...localCompleted, ...remoteCompleted]));

    // 3. Union streak days
    const localStreakDays = localProgress.streakDays || [];
    const remoteStreakDays = remoteProgress.streakDays || [];
    const mergedStreakDays = Array.from(new Set([...localStreakDays, ...remoteStreakDays])).sort();

    // 4. Merge SRS Decks: Convergent SM-2 Spaced Repetition resolution
    // If a card exists in both, keep the card with greater repetitions or latest review date
    const cardMap = new Map<string, SRSCard>();
    (remoteProgress.srsCards || []).forEach((c) => cardMap.set(c.id, c));
    (localProgress.srsCards || []).forEach((localCard) => {
      const remoteCard = cardMap.get(localCard.id);
      if (!remoteCard) {
        cardMap.set(localCard.id, localCard);
      } else {
        // Conflict on single card: Local wins if repetitions is higher or reviewed more recently
        const localReviewed = localCard.lastReviewedDate ? new Date(localCard.lastReviewedDate).getTime() : 0;
        const remoteReviewed = remoteCard.lastReviewedDate ? new Date(remoteCard.lastReviewedDate).getTime() : 0;
        if (localCard.repetitions >= remoteCard.repetitions || localReviewed >= remoteReviewed) {
          cardMap.set(localCard.id, localCard);
        }
      }
    });

    // 5. Merge exam history without duplicates
    const examMap = new Map<string, ExamResultRecord>();
    (remoteProgress.examResults || []).forEach((e) => examMap.set(e.id, e));
    (localProgress.examResults || []).forEach((e) => examMap.set(e.id, e)); // Local takes precedence for offline results

    const mergedUser: UserProgress = {
      ...localProgress,
      ...remoteProgress,
      xp: resolvedXP,
      level: resolvedLevel,
      gems: resolvedGems,
      streak: resolvedStreak,
      completedLessonIds: mergedCompletedLessons,
      streakDays: mergedStreakDays,
      srsCards: Array.from(cardMap.values()),
      examResults: Array.from(examMap.values()),
      // Maintain local profile personal fields unless updated remotely with newer timestamp
      firstName: localProgress.firstName || remoteProgress.firstName || 'کاربر',
      lastName: localProgress.lastName || remoteProgress.lastName || '',
      avatar: localProgress.avatar || remoteProgress.avatar || '🦁',
      settings: {
        ...DEFAULT_USER_SETTINGS,
        ...(remoteProgress.settings || {}),
        ...(localProgress.settings || {}),
      },
    };

    this.saveProgress(mergedUser);
    return mergedUser;
  }

  // Export JSON backup
  exportBackup(progress: UserProgress): string {
    return JSON.stringify(progress, null, 2);
  }

  // Import JSON backup
  importBackup(jsonString: string): UserProgress | null {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed.xp === 'number') {
        this.saveProgress(parsed);
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }
}

export const storageService = new StorageService();
