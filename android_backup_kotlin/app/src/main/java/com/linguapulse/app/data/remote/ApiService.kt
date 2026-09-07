package com.linguapulse.app.data.remote

import com.linguapulse.app.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // Auth
    @POST("auth/login")
    suspend fun login(@Body req: LoginRequest): Response<TokenResponse>

    @POST("auth/register")
    suspend fun register(@Body req: RegisterRequest): Response<TokenResponse>

    @POST("auth/refresh")
    suspend fun refreshToken(@Body req: RefreshTokenRequest): Response<TokenResponse>

    // Flashcards & SRS
    @GET("flashcards")
    suspend fun getFlashcards(@Query("language") language: String = "en"): Response<List<FlashcardDto>>

    @GET("review/due")
    suspend fun getDueReviewQueue(@Query("language") language: String = "en"): Response<SRSDueQueueDto>

    @POST("review/rate")
    suspend fun rateCard(@Body req: SRSRateRequest): Response<SRSRateResponse>

    // Mock Exams
    @POST("mock-exams/generate")
    suspend fun generateMockExam(@Body req: MockExamGenerateRequestDto): Response<List<MockExamQuestionDto>>

    @POST("mock-exams/evaluate")
    suspend fun evaluateMockExam(@Body req: MockExamEvaluateRequestDto): Response<MockExamEvaluateResponseDto>

    // AI Tutor
    @GET("ai/daily-word")
    suspend fun getDailyWord(@Query("language") language: String = "en"): Response<DailyWordDto>

    @POST("ai/chat")
    suspend fun sendChatMessage(@Body req: AIChatRequestDto): Response<AIChatResponseDto>
}
