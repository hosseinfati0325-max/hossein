export type TargetLanguageCode = 'en' | 'de' | 'fr' | 'es' | 'it' | 'tr' | 'ar' | 'ja' | 'ru' | 'zh';
export type ExplanationLanguageCode = 'fa' | 'en' | 'de' | 'fr';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type LanguageCategory = 'all' | 'popular' | 'european' | 'asian_middle_east' | 'migration';

export interface LanguageInfo {
  code: TargetLanguageCode | ExplanationLanguageCode;
  nameFa: string;
  nameNative: string;
  flag: string;
  greeting: string;
  defaultVoiceLocale: string;
  accentColor: string;
  category: LanguageCategory;
  speakersCount: string;
  difficultyFa: string;
  descriptionFa: string;
}

export type ExerciseType =
  | 'translate_to_target'
  | 'translate_to_native'
  | 'listening_mcq'
  | 'listening_dictation'
  | 'speaking_pronunciation'
  | 'smart_flashcard'
  | 'word_jumble'
  | 'fill_in_blank'
  | 'spot_the_mistake'
  | 'roleplay_chat'
  | 'grammar_explanation_quiz'
  | 'free_writing'
  | 'image_word_match'
  | 'match_pairs';

export interface WordTile {
  id: string;
  text: string;
  orderIndex?: number;
}

export interface MatchingPair {
  id: string;
  target: string;
  nativeFa: string;
  targetAudio?: string;
  persianAudio?: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  direction?: 'fa_to_target' | 'target_to_fa';
  instructionFa: string;
  instructionEn?: string;
  instructionDe?: string;
  instructionFr?: string;
  promptText: string;
  targetAudioText?: string;
  persianAudioText?: string;
  phonetic?: string;
  options?: string[];
  correctAnswer: string | string[];
  wordTiles?: string[];
  matchingPairs?: MatchingPair[];
  blanksPrompt?: string; // e.g. "I ___ to school every day."
  explanationFa: string;
  explanationEn?: string;
  explanationDe?: string;
  explanationFr?: string;
  grammarNoteFa?: string;
  imageUrl?: string;
  imageCaption?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  weaknessCategory?: string; // e.g. 'Past Tense', 'Articles der/die/das', 'Pronouns'
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  titleFa: string;
  descriptionFa: string;
  xpReward: number;
  gemReward: number;
  exercises: Exercise[];
  isCompleted?: boolean;
  crownLevel?: number; // 0 = uncompleted, 1 = completed, 2 = master
  levelRequired: CEFRLevel;
}

export interface Unit {
  id: string;
  unitNumber: number;
  titleFa: string;
  titleNative: string;
  descriptionFa: string;
  level: CEFRLevel;
  iconName: string;
  color: string;
  lessons: Lesson[];
}

export interface SRSCard {
  id: string;
  language: TargetLanguageCode;
  frontText: string; // Target language word / phrase
  backTextFa: string; // Meaning in Persian
  backTextEn?: string;
  phonetic?: string;
  partOfSpeech?: string;
  exampleTarget?: string;
  exampleFa?: string;
  category: string;
  imageUrl?: string;
  // SM-2 Algorithm fields
  interval: number; // in days
  repetitions: number;
  easeFactor: number; // starts at 2.5
  nextReviewDate: string; // ISO date string
  lastReviewedDate?: string;
  state: 'new' | 'learning' | 'review' | 'mastered';
}

export interface WeaknessRecord {
  id: string;
  topicFa: string;
  topicNative: string;
  language: TargetLanguageCode;
  category: string;
  mistakeCount: number;
  masteryPercent: number; // 0 to 100
  lastMistakeDate: string;
  recommendationFa: string;
}

export interface Badge {
  id: string;
  titleFa: string;
  descriptionFa: string;
  icon: string;
  category: 'streak' | 'xp' | 'lessons' | 'perfect' | 'srs' | 'league' | 'speaking';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
}

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'ruby' | 'diamond';

export interface LeagueCompetitor {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  isUser?: boolean;
  isAi?: boolean;
  streak: number;
  targetLang: TargetLanguageCode;
  badge?: string;
}

export interface AIRival {
  id: string;
  nameFa: string;
  nameEn: string;
  avatar: string;
  roleFa: string;
  descriptionFa: string;
  level: CEFRLevel;
  accuracy: number; // e.g. 0.85 (85%)
  speedSeconds: number; // average response time in seconds
  avatarColor: string;
  specialtyFa: string;
  winCount: number;
  lossCount: number;
}

export interface RoleplayMissionGoal {
  id: string;
  titleFa: string;
  titleNative?: string;
  isCompleted?: boolean;
}

export interface RoleplayDialogueTurn {
  speaker: 'ai' | 'user';
  text: string;
  translationFa: string;
  audioPrompt?: string;
  phonetic?: string;
  expectedKeywords?: string[];
}

export interface RoleplayScenario {
  id: string;
  titleFa: string;
  titleNative: string;
  icon: string;
  level: CEFRLevel;
  targetLanguage: TargetLanguageCode;
  category?: 'daily' | 'work' | 'travel' | 'emergency' | 'social';
  descriptionFa: string;
  situation: string;
  userRole: string;
  aiRole: string;
  aiAvatar?: string;
  imageUrl?: string;
  starterMessages: { role: 'ai' | 'user'; text: string; translationFa: string }[];
  suggestedPhrases: string[];
  goals?: RoleplayMissionGoal[];
  keyVocabulary?: { word: string; translationFa: string; phonetic?: string }[];
  dialogueScript?: RoleplayDialogueTurn[];
}

export interface InternationalExam {
  id: string;
  title: string;
  subtitleFa: string;
  targetLanguage: TargetLanguageCode;
  level: CEFRLevel;
  icon: string;
  durationMinutes: number;
  sectionsCount: number;
  totalQuestions: number;
  sampleQuestions: Exercise[];
  bandDescriptionFa: string;
  imageUrl?: string;
}

export interface UserSettings {
  theme: 'system' | 'dark' | 'light';
  colorTheme: 'emerald' | 'blue' | 'purple' | 'rose' | 'amber';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  soundEffects: boolean;
  hapticFeedback: boolean;
  ttsSpeed: number; // 0.5 to 1.5
  autoPlayAudio: boolean;
  explanationLanguage: ExplanationLanguageCode;
  dailyGoalMinutes: number;
  notificationsEnabled: boolean;
  dailyReminderHour: number; // 0-23, e.g. 21 (9 PM)
  lastNotificationSent?: string;
  offlineModePreferred: boolean;
}

export interface UserProgress {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Combined Full Name (نام و نام خانوادگی)
  avatar: string;
  targetLanguage: TargetLanguageCode;
  explanationLanguage: ExplanationLanguageCode;
  currentLevel: CEFRLevel;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  streakDays: string[]; // List of YYYY-MM-DD
  hearts: number;
  maxHearts: number;
  lastHeartLossTime?: number;
  gems: number;
  league: LeagueTier;
  leagueRank: number;
  leagueXp: number;
  aiBattleWins: number;
  aiBattleLosses: number;
  completedLessonIds: string[];
  unlockedUnitId: string;
  srsCards: SRSCard[];
  weaknesses: WeaknessRecord[];
  badges: Badge[];
  placementTestDone: boolean;
  placementScore?: number;
  dailyStudyTimeSeconds: number;
  totalWordsLearned: number;
  speakingScoreAverage: number;
  memberNumber?: number;
  phoneNumber?: string;
  registeredAt?: string;
  createdAt?: string;
  examResults?: ExamResultRecord[];
  lastSyncedAt?: string;
  settings: UserSettings;
}

export interface ExamResultRecord {
  id: string;
  userId: string;
  userName: string;
  examId: string;
  examTitle: string;
  examSubtitleFa?: string;
  targetLanguage: TargetLanguageCode;
  level: CEFRLevel;
  score: number; // percentage (0-100)
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  bandResultFa: string;
  timestamp: string; // ISO string
  syncedToServer: boolean;
}

export type SyncItemType =
  | 'progress_snapshot'
  | 'exam_result'
  | 'lesson_completion'
  | 'srs_rating'
  | 'ai_battle'
  | 'settings_update'
  | 'study_time';

export interface SyncQueueItem {
  id: string;
  type: SyncItemType;
  userId: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  lastAttemptError?: string;
}

export type SyncStatus = 'idle' | 'synced' | 'syncing' | 'offline' | 'pending' | 'error';

export interface SyncLogEntry {
  id: string;
  titleFa: string;
  itemType: SyncItemType;
  timestamp: string;
  status: 'success' | 'failed' | 'queued';
  details?: string;
}

export interface SyncState {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastSyncMessage?: string;
  syncLogs: SyncLogEntry[];
}

export interface RegisteredMemberInfo {
  id: string;
  memberNumber: number;
  firstName: string;
  lastName: string;
  name: string;
  avatar: string;
  targetLanguage: TargetLanguageCode;
  currentLevel: CEFRLevel;
  xp: number;
  streak: number;
  registeredAt: string;
  lastActiveDate: string;
  phoneNumber?: string;
}

export interface RealCapacityData {
  totalRegistered: number;
  activeToday: number;
  byLanguage: Record<string, number>;
  members: RegisteredMemberInfo[];
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imageUrl?: string;
  imageAnalysisFa?: string;
  textInTargetLang?: string;
  translationFa?: string;
  corrections?: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  explanation?: string;
  suggestions?: string[];
  vocabularyTips?: {
    word: string;
    meaning: string;
    phonetic?: string;
  }[];
  timestamp: number;
}

// -------------------------------------------------------------
// 52-WEEK STANDARD CURRICULUM TREE (A1 to C2)
// -------------------------------------------------------------
export type WeekDifficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'master';
export type WeekQuarter = 1 | 2 | 3 | 4;

export type StageType =
  | 'vocab_concept'
  | 'grammar_mastery'
  | 'listening_speaking'
  | 'reading_dialogue'
  | 'weekly_exam';

export interface WeekStageLesson {
  id: string;
  stageNumber: number; // 1 to 5 (e.g. Day 1 to Day 5)
  titleFa: string;
  titleNative: string;
  descriptionFa: string;
  stageType: StageType;
  difficulty: WeekDifficulty;
  durationMinutes: number;
  xpReward: number;
  gemReward: number;
  exercises: Exercise[];
}

export interface CurriculumWeek {
  weekNumber: number; // 1 to 52
  quarter: WeekQuarter; // 1: W1-13 (A1-A2), 2: W14-26 (A2-B1), 3: W27-39 (B1-B2), 4: W40-52 (C1-C2)
  monthNumber: number; // 1 to 12
  level: CEFRLevel; // A1, A2, B1, B2, C1, C2
  difficulty: WeekDifficulty;
  titleFa: string;
  titleNative: string;
  themeFa: string;
  grammarFocusFa: string;
  grammarFocusNative: string;
  vocabularyFocusFa: string[];
  keyPhrases: { target: string; phonetic?: string; fa: string }[];
  milestoneTitleFa?: string;
  isMilestone?: boolean;
  stages: WeekStageLesson[];
  culturalNoteFa?: string;
  aiConversationTopic?: string;
  xpTotal: number;
  gemTotal: number;
}

export interface WeekProgressRecord {
  weekNumber: number;
  language: TargetLanguageCode;
  completedStageIds: string[];
  isWeekMastered: boolean;
  scorePercent?: number;
  lastStudiedAt?: string;
  notes?: string;
}

export interface Curriculum52WeeksDB {
  userId: string;
  language: TargetLanguageCode;
  weekProgress: Record<number, WeekProgressRecord>;
  unlockedWeekNumber: number;
  lastUpdated: string;
}

export interface GrammarRuleExample {
  target: string;
  fa: string;
  phonetic?: string;
  breakdownFa?: string;
}

export interface GrammarLesson {
  id: string;
  language: TargetLanguageCode;
  level: CEFRLevel;
  titleFa: string;
  titleNative: string;
  summaryFa: string;
  categoryFa: string; // e.g. "پایه و آواشناسی", "افعال و زمان‌ها", "آرتیکل‌ها و صرف", "ساختار جمله و حروف اضافه"
  contentMarkdownFa: string;
  formula?: string; // e.g. "Subject + Verb(s/es) + Object"
  rules: {
    ruleTitleFa: string;
    explanationFa: string;
    formula?: string;
    examples: GrammarRuleExample[];
    commonMistakesFa?: { wrong: string; correct: string; reasonFa: string }[];
  }[];
  interactiveQuizzes: {
    id: string;
    questionFa: string;
    promptTarget: string;
    options: string[];
    correctAnswer: string;
    explanationFa: string;
  }[];
  aiDiscussionPrompts: string[];
}

export interface GrammarSentenceAnalysisResult {
  isCorrect: boolean;
  score: number;
  overallFeedbackFa: string;
  breakdown: Array<{
    segment: string;
    status: 'correct' | 'warning' | 'error';
    explanationFa: string;
  }>;
  corrections: Array<{
    original: string;
    corrected: string;
    ruleReasonFa: string;
  }>;
  improvedSentence?: string;
  improvedSentenceFa?: string;
  alternativeExpressions: Array<{
    target: string;
    translationFa: string;
  }>;
  grammarPointsAppliedFa?: string[];
}

// -------------------------------------------------------------
// DAILY WORD TIP & ENHANCED EXAM SIMULATOR TYPES
// -------------------------------------------------------------
export interface DailyWordTip {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  translationFa: string;
  level: CEFRLevel;
  exampleSentence: string;
  exampleTranslationFa: string;
  pedagogicalTipFa: string;
  synonyms?: string[];
  memoryTrickFa?: string;
  targetLanguage: TargetLanguageCode;
  dateKey: string;
  isAiGenerated?: boolean;
}

export interface ExamWritingEvaluation {
  overallBand: string;
  overallScorePercent: number;
  bandTitleFa: string;
  wordCount: number;
  criteria: {
    taskAchievement: number;
    coherenceAndCohesion: number;
    lexicalResource: number;
    grammaticalRange: number;
  };
  strengthsFa: string[];
  improvementsFa: string[];
  detailedFeedbackFa: string;
  correctedHighlights?: Array<{
    original: string;
    corrected: string;
    reasonFa: string;
  }>;
  suggestedVocabulary?: Array<{
    target: string;
    translationFa: string;
  }>;
}

export interface NetworkCapacityData {
  totalRegistered: number;
  activeToday: number;
  activeOnlineNow: number;
  byLanguage: Record<string, number>;
  members: Array<{
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    avatar: string;
    targetLanguage: string;
    currentLevel: string;
    xp: number;
    streak: number;
    registeredAt: string;
    isOnlineNow?: boolean;
  }>;
}

// -------------------------------------------------------------
// DYNAMIC MOCK EXAM & AI STRENGTH/WEAKNESS BREAKDOWN TYPES
// -------------------------------------------------------------
export type MockExamQuestionSource = 'grammar' | 'vocabulary' | 'curriculum_lesson' | 'srs_deck';

export interface MockExamQuestion {
  id: string;
  sourceType: MockExamQuestionSource;
  sourceTitleFa: string;
  sourceId: string;
  level: CEFRLevel;
  topicCategoryFa: string; // e.g. "گرامر: زمان‌ها", "واژگان: سفر و هتل", "آواشناسی"
  promptFa: string;
  promptTarget?: string;
  targetAudioText?: string;
  options: string[];
  correctAnswer: string;
  explanationFa: string;
  phonetic?: string;
}

export interface MockExamCategoryScore {
  categoryFa: string;
  sourceType: MockExamQuestionSource;
  total: number;
  correct: number;
  percentage: number;
  status: 'mastered' | 'good' | 'needs_practice';
}

export interface MockExamAIBreakdown {
  overallScorePercent: number;
  estimatedBandScore: string;
  proficiencyLevel: CEFRLevel;
  summaryFa: string;
  strengthsFa: string[];
  weaknessesFa: string[];
  actionableStudyPlanFa: string[];
  categoryScores: MockExamCategoryScore[];
  recommendedReviewGrammarIds?: string[];
  recommendedReviewVocabIds?: string[];
  motivationalMessageFa: string;
}

export interface MockExamSession {
  id: string;
  title: string;
  targetLanguage: TargetLanguageCode;
  createdAt: string;
  questions: MockExamQuestion[];
  userAnswers: Record<string, string>;
  timeSpentSeconds: number;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  breakdown?: MockExamAIBreakdown;
}




