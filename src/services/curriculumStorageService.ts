import {
  TargetLanguageCode,
  Curriculum52WeeksDB,
  WeekProgressRecord,
} from '../types';

const CURRICULUM_STORAGE_PREFIX = 'hossein_fatemeh_curriculum_52w_v2_';

class CurriculumStorageService {
  private getStorageKey(userId: string, lang: TargetLanguageCode): string {
    return `${CURRICULUM_STORAGE_PREFIX}${userId}_${lang}`;
  }

  get52WeeksProgress(userId: string, lang: TargetLanguageCode): Curriculum52WeeksDB {
    const key = this.getStorageKey(userId, lang);
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: Curriculum52WeeksDB = JSON.parse(stored);
        if (parsed && parsed.weekProgress) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load 52-week curriculum progress from local DB:', e);
    }

    // Default initial database state: Week 1 is unlocked by default
    const initialDB: Curriculum52WeeksDB = {
      userId,
      language: lang,
      unlockedWeekNumber: 1,
      weekProgress: {
        1: {
          weekNumber: 1,
          language: lang,
          completedStageIds: [],
          isWeekMastered: false,
          scorePercent: 0,
        },
      },
      lastUpdated: new Date().toISOString(),
    };

    this.save52WeeksProgress(userId, lang, initialDB);
    return initialDB;
  }

  getUser52Progress(userId: string, lang: TargetLanguageCode): Curriculum52WeeksDB {
    return this.get52WeeksProgress(userId, lang);
  }

  save52WeeksProgress(
    userId: string,
    lang: TargetLanguageCode,
    db: Curriculum52WeeksDB,
  ): void {
    const key = this.getStorageKey(userId, lang);
    try {
      db.lastUpdated = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(db));
    } catch (e) {
      console.warn('Failed to save 52-week curriculum to local DB:', e);
    }
  }

  saveWeekStageCompletion(
    userId: string,
    lang: TargetLanguageCode,
    weekNum: number,
    stageId: string,
    scorePercent: number = 100,
  ): { unlockedNextWeek: boolean; isWeekCompleted: boolean; db: Curriculum52WeeksDB } {
    const db = this.get52WeeksProgress(userId, lang);
    const existingWeek = db.weekProgress[weekNum] || {
      weekNumber: weekNum,
      language: lang,
      completedStageIds: [],
      isWeekMastered: false,
      scorePercent: 0,
    };

    if (!existingWeek.completedStageIds.includes(stageId)) {
      existingWeek.completedStageIds.push(stageId);
    }
    existingWeek.lastStudiedAt = new Date().toISOString();
    existingWeek.scorePercent = Math.max(existingWeek.scorePercent || 0, scorePercent);

    // If all 5 stages of the week are completed, master the week & unlock next week
    const isWeekCompleted = existingWeek.completedStageIds.length >= 5;
    let unlockedNextWeek = false;

    if (isWeekCompleted) {
      existingWeek.isWeekMastered = true;
      if (weekNum >= db.unlockedWeekNumber && weekNum < 52) {
        db.unlockedWeekNumber = weekNum + 1;
        unlockedNextWeek = true;
        // initialize next week record
        if (!db.weekProgress[weekNum + 1]) {
          db.weekProgress[weekNum + 1] = {
            weekNumber: weekNum + 1,
            language: lang,
            completedStageIds: [],
            isWeekMastered: false,
            scorePercent: 0,
          };
        }
      }
    }

    db.weekProgress[weekNum] = existingWeek;
    this.save52WeeksProgress(userId, lang, db);

    return { unlockedNextWeek, isWeekCompleted, db };
  }

  saveWeekNotes(
    userId: string,
    lang: TargetLanguageCode,
    weekNum: number,
    notes: string,
  ): Curriculum52WeeksDB {
    const db = this.get52WeeksProgress(userId, lang);
    if (!db.weekProgress[weekNum]) {
      db.weekProgress[weekNum] = {
        weekNumber: weekNum,
        language: lang,
        completedStageIds: [],
        isWeekMastered: false,
      };
    }
    db.weekProgress[weekNum].notes = notes;
    this.save52WeeksProgress(userId, lang, db);
    return db;
  }

  unlockAllWeeksForTesting(userId: string, lang: TargetLanguageCode): Curriculum52WeeksDB {
    const db = this.get52WeeksProgress(userId, lang);
    db.unlockedWeekNumber = 52;
    for (let w = 1; w <= 52; w++) {
      if (!db.weekProgress[w]) {
        db.weekProgress[w] = {
          weekNumber: w,
          language: lang,
          completedStageIds: [],
          isWeekMastered: false,
        };
      }
    }
    this.save52WeeksProgress(userId, lang, db);
    return db;
  }

  resetCurriculumProgress(userId: string, lang: TargetLanguageCode): Curriculum52WeeksDB {
    const key = this.getStorageKey(userId, lang);
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Failed to reset curriculum progress:', e);
    }
    return this.get52WeeksProgress(userId, lang);
  }
}

export const curriculumStorageService = new CurriculumStorageService();
