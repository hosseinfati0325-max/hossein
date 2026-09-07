package com.linguapulse.app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class MockExamQuestionDto(
    val id: String,
    @SerializedName("source_type") val sourceType: String,
    @SerializedName("topic_category_fa") val topicCategoryFa: String,
    @SerializedName("prompt_fa") val promptFa: String,
    @SerializedName("prompt_target") val promptTarget: String?,
    @SerializedName("target_audio_text") val targetAudioText: String?,
    val options: List<String>,
    @SerializedName("correct_answer") val correctAnswer: String,
    @SerializedName("explanation_fa") val explanationFa: String
)

data class MockExamGenerateRequestDto(
    @SerializedName("target_language") val targetLanguage: String = "en",
    val level: String = "B1",
    @SerializedName("question_count") val questionCount: Int = 15
)

data class MockExamEvaluateRequestDto(
    @SerializedName("target_language") val targetLanguage: String = "en",
    val level: String = "B1",
    @SerializedName("time_spent_seconds") val timeSpentSeconds: Int,
    @SerializedName("user_answers") val userAnswers: Map<String, String>,
    val questions: List<MockExamQuestionDto>
)

data class MockExamCategoryScoreDto(
    @SerializedName("category_fa") val categoryFa: String,
    val total: Int,
    val correct: Int,
    val percentage: Float,
    val status: String
)

data class MockExamBreakdownDto(
    @SerializedName("overall_score_percent") val overallScorePercent: Float,
    @SerializedName("estimated_band_score") val estimatedBandScore: String,
    @SerializedName("proficiency_level") val proficiencyLevel: String,
    @SerializedName("summary_fa") val summaryFa: String,
    @SerializedName("strengths_fa") val strengthsFa: List<String>,
    @SerializedName("weaknesses_fa") val weaknessesFa: List<String>,
    @SerializedName("actionable_study_plan_fa") val actionableStudyPlanFa: List<String>,
    @SerializedName("category_scores") val categoryScores: List<MockExamCategoryScoreDto>,
    @SerializedName("motivational_message_fa") val motivationalMessageFa: String
)

data class MockExamEvaluateResponseDto(
    @SerializedName("attempt_id") val attemptId: String,
    @SerializedName("score_percent") val scorePercent: Float,
    @SerializedName("correct_count") val correctCount: Int,
    @SerializedName("wrong_count") val wrongCount: Int,
    @SerializedName("unanswered_count") val unansweredCount: Int,
    @SerializedName("total_questions") val totalQuestions: Int,
    val breakdown: MockExamBreakdownDto,
    @SerializedName("xp_earned") val xpEarned: Int,
    @SerializedName("gems_earned") val gemsEarned: Int
)
