package com.linguapulse.app.data.repository

import com.linguapulse.app.data.local.dao.FlashcardDao
import com.linguapulse.app.data.local.entity.CachedFlashcard
import com.linguapulse.app.data.remote.ApiService
import com.linguapulse.app.data.remote.dto.SRSRateRequest
import kotlinx.coroutines.flow.Flow
import java.time.Instant

class SrsRepository(
    private val apiService: ApiService,
    private val flashcardDao: FlashcardDao
) {
    fun getDueFlashcards(language: String): Flow<List<CachedFlashcard>> {
        val nowSeconds = System.currentTimeMillis() / 1000
        return flashcardDao.getDueCards(language, nowSeconds)
    }

    suspend fun syncDueFlashcards(language: String): Result<Int> {
        return try {
            val response = apiService.getDueReviewQueue(language)
            if (response.isSuccessful && response.body() != null) {
                val queue = response.body()!!
                val entities = queue.cards.map { dto ->
                    CachedFlashcard(
                        id = dto.id,
                        language = dto.language,
                        frontText = dto.frontText,
                        backTextFa = dto.backTextFa,
                        backTextEn = dto.backTextEn,
                        phonetic = dto.phonetic,
                        category = dto.category,
                        interval = dto.interval,
                        repetitions = dto.repetitions,
                        easeFactor = dto.easeFactor,
                        nextReviewEpochSeconds = System.currentTimeMillis() / 1000 + (dto.interval * 86400),
                        state = dto.state,
                        isSynced = true
                    )
                }
                flashcardDao.insertCards(entities)
                Result.success(queue.totalDue)
            } else {
                Result.failure(Exception("Failed to fetch due queue from server: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun rateCard(cardId: String, rating: Int): Result<Unit> {
        return try {
            val res = apiService.rateCard(SRSRateRequest(cardId, rating))
            if (res.isSuccessful) {
                flashcardDao.deleteCard(cardId) // Remove from current due queue
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to submit rating"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
