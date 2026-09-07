package com.linguapulse.app.data.repository

import com.linguapulse.app.data.remote.ApiService
import com.linguapulse.app.data.remote.dto.*

class ExamRepository(private val apiService: ApiService) {

    suspend fun generateMockExam(
        language: String = "en",
        level: String = "B1",
        count: Int = 15
    ): Result<List<MockExamQuestionDto>> {
        return try {
            val req = MockExamGenerateRequestDto(
                targetLanguage = language,
                level = level,
                questionCount = count
            )
            val res = apiService.generateMockExam(req)
            if (res.isSuccessful && res.body() != null) {
                Result.success(res.body()!!)
            } else {
                Result.failure(Exception("Failed to generate mock exam: ${res.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun evaluateMockExam(
        language: String,
        level: String,
        timeSpentSeconds: Int,
        userAnswers: Map<String, String>,
        questions: List<MockExamQuestionDto>
    ): Result<MockExamEvaluateResponseDto> {
        return try {
            val req = MockExamEvaluateRequestDto(
                targetLanguage = language,
                level = level,
                timeSpentSeconds = timeSpentSeconds,
                userAnswers = userAnswers,
                questions = questions
            )
            val res = apiService.evaluateMockExam(req)
            if (res.isSuccessful && res.body() != null) {
                Result.success(res.body()!!)
            } else {
                Result.failure(Exception("Failed to evaluate mock exam: ${res.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
