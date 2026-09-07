import {
  MockExamQuestion,
  MockExamSession,
  MockExamAIBreakdown,
  MockExamCategoryScore,
  UserProgress,
  TargetLanguageCode,
  CEFRLevel,
} from '../types';
import { ALL_GRAMMAR_LESSONS } from '../data/grammarData';
import { VOCABULARY_THEMES_52, getWeeklyVocabularyForLanguage } from '../data/vocabularyMasteryData';
import { ENGLISH_UNITS } from '../data/curriculumData';
import {
  SPANISH_UNITS,
  TURKISH_UNITS,
  ARABIC_UNITS,
  ITALIAN_UNITS,
  JAPANESE_UNITS,
  RUSSIAN_UNITS,
  CHINESE_UNITS,
} from '../data/worldLanguagesData';
import { curriculumStorageService } from './curriculumStorageService';

// Helper to get curriculum units for a given language
function getUnitsForLanguage(lang: TargetLanguageCode): any[] {
  switch (lang) {
    case 'en': return ENGLISH_UNITS;
    case 'es': return SPANISH_UNITS;
    case 'tr': return TURKISH_UNITS;
    case 'ar': return ARABIC_UNITS;
    case 'it': return ITALIAN_UNITS;
    case 'ja': return JAPANESE_UNITS;
    case 'ru': return RUSSIAN_UNITS;
    case 'zh': return CHINESE_UNITS;
    default: return ENGLISH_UNITS;
  }
}


// Shuffle array
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const mockExamService = {
  /**
   * Generates a balanced Mock Exam pulling random questions from completed
   * grammar modules, vocabulary packs, SRS deck, and curriculum lessons.
   */
  generateMockExam(user: UserProgress, targetCount: number = 10): MockExamSession {
    const lang = user.targetLanguage || 'en';
    const completedIds = user.completedLessonIds || [];
    const questionsPool: MockExamQuestion[] = [];

    // 1. Pull from Completed Grammar Modules
    const grammarLessons = ALL_GRAMMAR_LESSONS[lang] || ALL_GRAMMAR_LESSONS.en || [];
    grammarLessons.forEach((lesson) => {
      // Check if user completed or if it's available for their level
      const isCompleted = completedIds.some(
        (id) => id.includes(lesson.id) || id === `grammar_${lesson.id}`
      );
      
      lesson.interactiveQuizzes.forEach((q, idx) => {
        questionsPool.push({
          id: `mock_g_${lesson.id}_${idx}`,
          sourceType: 'grammar',
          sourceTitleFa: lesson.titleFa,
          sourceId: lesson.id,
          level: lesson.level,
          topicCategoryFa: `گرامر: ${lesson.categoryFa || lesson.titleFa}`,
          promptFa: q.questionFa,
          promptTarget: q.promptTarget,
          targetAudioText: q.promptTarget || q.correctAnswer,
          options: shuffle([...q.options]),
          correctAnswer: q.correctAnswer,
          explanationFa: q.explanationFa,
        });
      });
    });

    // 2. Pull from Vocabulary Sets & 52-Week Mastery for active language
    const user52Progress = curriculumStorageService.getUser52Progress(user.id, lang);
    const unlockedWeek = user52Progress.unlockedWeekNumber || 4;

    for (let w = 1; w <= Math.max(unlockedWeek, 4); w++) {
      const pack = getWeeklyVocabularyForLanguage(lang, w);
      if (pack && pack.quizQuestion) {
        questionsPool.push({
          id: `mock_v_w${w}_${lang}`,
          sourceType: 'vocabulary',
          sourceTitleFa: pack.themeFa,
          sourceId: `vocab_w_${w}_${lang}`,
          level: pack.level,
          topicCategoryFa: `واژگان: ${pack.themeFa}`,
          promptFa: pack.quizQuestion.promptFa,
          promptTarget: pack.quizQuestion.targetPrompt,
          targetAudioText: pack.quizQuestion.targetPrompt,
          options: shuffle([...pack.quizQuestion.options]),
          correctAnswer: pack.quizQuestion.options[pack.quizQuestion.correctIndex] || pack.quizQuestion.options[0],
          explanationFa: pack.quizQuestion.explanationFa,
        });
      }

      // Also generate MCQ from words inside the weekly pack
      (pack.words || []).forEach((wObj, wIdx) => {
        if (wObj.meaningFa && wObj.word) {
          const otherWordMeanings = (pack.words || [])
            .filter((o) => o.id !== wObj.id)
            .map((o) => o.meaningFa);
          
          if (otherWordMeanings.length >= 2) {
            const options = shuffle([wObj.meaningFa, ...otherWordMeanings.slice(0, 3)]);
            questionsPool.push({
              id: `mock_vw_${wObj.id}_${wIdx}`,
              sourceType: 'vocabulary',
              sourceTitleFa: pack.themeFa,
              sourceId: wObj.id,
              level: pack.level,
              topicCategoryFa: `واژگان: ${pack.themeFa}`,
              promptFa: `معنی دقیق کلمه «${wObj.word}» چیست؟`,
              promptTarget: wObj.word,
              targetAudioText: wObj.word,
              options,
              correctAnswer: wObj.meaningFa,
              explanationFa: `کلمه «${wObj.word}» به معنی «${wObj.meaningFa}» است. مثال: ${wObj.exampleTarget}`,
              phonetic: wObj.phonetic,
            });
          }
        }
      });
    }


    // 3. Pull from User's SRS Flashcards (if any)
    const userCards = (user.srsCards || []).filter((c) => c.language === lang);
    userCards.forEach((card, idx) => {
      if (card.frontText && card.backTextFa) {
        // Create 3 distractor options from other cards
        const otherCards = userCards.filter((c) => c.id !== card.id);
        const distractors = shuffle(otherCards)
          .slice(0, 3)
          .map((c) => c.backTextFa);

        if (distractors.length < 3) {
          distractors.push('گزینه جایگزین ۱', 'گزینه جایگزین ۲', 'گزینه جایگزین ۳');
        }

        const options = shuffle([card.backTextFa, ...distractors.slice(0, 3)]);

        questionsPool.push({
          id: `mock_srs_${card.id}_${idx}`,
          sourceType: 'srs_deck',
          sourceTitleFa: card.category || 'جعبه لایتنر هوشمند',
          sourceId: card.id,
          level: user.currentLevel || 'A1',
          topicCategoryFa: `واژگان لایتنر: ${card.category || 'تثبیت لغات'}`,
          promptFa: `معنی دقیق واژه «${card.frontText}» چیست؟`,
          promptTarget: card.frontText,
          targetAudioText: card.frontText,
          options,
          correctAnswer: card.backTextFa,
          explanationFa: `واژه "${card.frontText}" به معنی «${card.backTextFa}» است. مثال: ${card.exampleTarget || ''}`,
          phonetic: card.phonetic,
        });
      }
    });

    // 4. Pull from Curriculum Lesson Exercises (MCQs)
    const units = getUnitsForLanguage(lang);
    units.forEach((unit) => {
      unit.lessons.forEach((les) => {
        les.exercises.forEach((ex, idx) => {
          if (ex.type === 'listening_mcq' || ex.type === 'fill_in_blank') {
            if (ex.options && ex.options.length >= 2 && ex.correctAnswer) {
              questionsPool.push({
                id: `mock_cur_${les.id}_${idx}`,
                sourceType: 'curriculum_lesson',
                sourceTitleFa: les.titleFa,
                sourceId: les.id,
                level: unit.level,
                topicCategoryFa: `درس اصلی: ${unit.titleFa}`,
                promptFa: ex.instructionFa || 'گزینه صحیح را انتخاب کنید:',
                promptTarget: ex.promptText,
                targetAudioText: ex.targetAudioText,
                options: shuffle([...ex.options]),
                correctAnswer: ex.correctAnswer,
                explanationFa: ex.explanationFa || 'پاسخ صحیح بر اساس گرامر و محتوای درس.',
                phonetic: ex.phonetic,
              });
            }
          }
        });
      });
    });

    // Shuffle and pick target count
    const uniquePool = Array.from(new Map(questionsPool.map((q) => [q.id, q])).values());
    const finalSelected = shuffle(uniquePool).slice(0, Math.max(targetCount, 8));

    return {
      id: `mock_session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: `آزمون شبیه‌ساز تصادفی مهارتی (${finalSelected.length} سوال ترکیبی)`,
      targetLanguage: lang,
      createdAt: new Date().toISOString(),
      questions: finalSelected,
      userAnswers: {},
      timeSpentSeconds: 0,
      scorePercent: 0,
      correctCount: 0,
      totalQuestions: finalSelected.length,
    };
  },

  /**
   * Evaluates the mock exam and generates comprehensive instant breakdown
   * of strengths and weaknesses via AI tutor server route (or local fallback).
   */
  async evaluateMockExam(
    session: MockExamSession,
    userAnswers: Record<string, string>,
    timeSpentSeconds: number,
    user: UserProgress
  ): Promise<MockExamAIBreakdown> {
    const questions = session.questions;
    let correctCount = 0;

    // Grouping by topic category
    const categoryStats: Record<
      string,
      { sourceType: MockExamQuestion['sourceType']; total: number; correct: number }
    > = {};

    const evaluatedQuestions = questions.map((q) => {
      const userAns = userAnswers[q.id];
      const isCorrect = userAns === q.correctAnswer;
      if (isCorrect) correctCount++;

      const cat = q.topicCategoryFa || 'عمومی';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { sourceType: q.sourceType, total: 0, correct: 0 };
      }
      categoryStats[cat].total += 1;
      if (isCorrect) categoryStats[cat].correct += 1;

      return {
        questionId: q.id,
        category: cat,
        sourceTitle: q.sourceTitleFa,
        prompt: q.promptFa + (q.promptTarget ? ` (${q.promptTarget})` : ''),
        userAnswer: userAns || '(بدون پاسخ)',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanationFa,
      };
    });

    const scorePercent = Math.round((correctCount / Math.max(questions.length, 1)) * 100);

    // Calculate category breakdown
    const categoryScores: MockExamCategoryScore[] = Object.entries(categoryStats).map(
      ([categoryFa, stat]) => {
        const pct = Math.round((stat.correct / stat.total) * 100);
        let status: MockExamCategoryScore['status'] = 'good';
        if (pct >= 80) status = 'mastered';
        else if (pct < 60) status = 'needs_practice';

        return {
          categoryFa,
          sourceType: stat.sourceType,
          total: stat.total,
          correct: stat.correct,
          percentage: pct,
          status,
        };
      }
    );

    // Try calling AI Tutor server endpoint for rich feedback
    try {
      const res = await fetch('/api/exams/mock-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: user.targetLanguage,
          userLevel: user.currentLevel,
          explanationLanguage: user.explanationLanguage || 'fa',
          scorePercent,
          correctCount,
          totalQuestions: questions.length,
          timeSpentSeconds,
          categoryScores,
          evaluatedQuestions,
        }),
      });

      if (res.ok) {
        const aiData = await res.json();
        return {
          overallScorePercent: scorePercent,
          estimatedBandScore: aiData.estimatedBandScore || this.computeBandScore(scorePercent),
          proficiencyLevel: aiData.proficiencyLevel || user.currentLevel,
          summaryFa: aiData.summaryFa,
          strengthsFa: aiData.strengthsFa || [],
          weaknessesFa: aiData.weaknessesFa || [],
          actionableStudyPlanFa: aiData.actionableStudyPlanFa || [],
          categoryScores,
          motivationalMessageFa: aiData.motivationalMessageFa || 'تلاش و استمرار شما کلید فتح قله‌های زبانی است.',
        };
      }
    } catch (e) {
      console.warn('AI Breakdown server fallback:', e);
    }

    // Local Rule-Based Fallback if network is offline
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const actionPlan: string[] = [];

    categoryScores.forEach((cat) => {
      if (cat.percentage >= 75) {
        strengths.push(`تسلط عالی بر مبحث «${cat.categoryFa}» با دقت ${cat.percentage}٪`);
      } else {
        weaknesses.push(`نیاز به مرور و تمرین بیشتر در بخش «${cat.categoryFa}» (دقت ${cat.percentage}٪)`);
        actionPlan.push(`مرور کارت‌های لایتنر و تمرین مجدد کوئیز‌های بخش ${cat.categoryFa}`);
      }
    });

    if (strengths.length === 0) {
      strengths.push('شروع خوب و انگیزه بالا برای سنجش مهارت‌های ترکیبی');
    }
    if (weaknesses.length === 0) {
      strengths.push('پاسخ‌دهی متوازن و بدون نقطه ضعف حاد در میان ماژول‌های تکمیل‌شده');
      actionPlan.push('ورود به سطوح بالاتر CEFR و افزایش زمان تمرین مکالمه آزاد');
    }

    const bandScore = this.computeBandScore(scorePercent);

    return {
      overallScorePercent: scorePercent,
      estimatedBandScore: bandScore,
      proficiencyLevel: user.currentLevel || 'A1',
      summaryFa: `شما به ${correctCount} سوال از مجموع ${questions.length} سوال تصادفی پاسخ صحیح دادید (نمره کل: ${scorePercent}٪). این آزمون ترکیبی از ماژول‌های گرامر، لغات موضوعی و لایتنر بود.`,
      strengthsFa: strengths,
      weaknessesFa: weaknesses,
      actionableStudyPlanFa: actionPlan,
      categoryScores,
      motivationalMessageFa:
        scorePercent >= 80
          ? 'آفرین! تسلط شما بر مطالب فراگرفته شده بسیار ستودنی است. با همین قدرت ادامه دهید.'
          : 'نتیجه‌ای ارزشمند برای شناخت دقیق نقاط نیازمند تمرین. با مرور مداوم لایتنر و ماژول‌های گرامر به تسلط کامل می‌رسید.',
    };
  },

  computeBandScore(scorePercent: number): string {
    if (scorePercent >= 90) return '8.5 / 9.0 (C1-C2 Master)';
    if (scorePercent >= 80) return '7.5 / 9.0 (B2+ Advanced)';
    if (scorePercent >= 70) return '6.5 / 9.0 (B2 Competent)';
    if (scorePercent >= 60) return '5.5 / 9.0 (B1 Intermediate)';
    if (scorePercent >= 45) return '4.5 / 9.0 (A2 Elementary)';
    return '3.5 / 9.0 (A1 Beginner)';
  },
};
