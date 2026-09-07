package com.linguapulse.app.data.local.dao

import androidx.room.*
import com.linguapulse.app.data.local.entity.CachedFlashcard
import kotlinx.coroutines.flow.Flow

@Dao
interface FlashcardDao {
    @Query("SELECT * FROM cached_flashcards WHERE language = :language ORDER BY nextReviewEpochSeconds ASC")
    fun getAllCards(language: String): Flow<List<CachedFlashcard>>

    @Query("SELECT * FROM cached_flashcards WHERE language = :language AND nextReviewEpochSeconds <= :currentEpochSeconds ORDER BY nextReviewEpochSeconds ASC")
    fun getDueCards(language: String, currentEpochSeconds: Long): Flow<List<CachedFlashcard>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCards(cards: List<CachedFlashcard>)

    @Update
    suspend fun updateCard(card: CachedFlashcard)

    @Query("DELETE FROM cached_flashcards WHERE id = :cardId")
    suspend fun deleteCard(cardId: String)

    @Query("DELETE FROM cached_flashcards")
    suspend fun clearAll()
}
