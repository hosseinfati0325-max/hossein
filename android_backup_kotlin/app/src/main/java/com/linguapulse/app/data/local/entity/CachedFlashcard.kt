package com.linguapulse.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cached_flashcards")
data class CachedFlashcard(
    @PrimaryKey
    val id: String,
    val language: String,
    val frontText: String,
    val backTextFa: String,
    val backTextEn: String?,
    val phonetic: String?,
    val category: String,
    val interval: Int,
    val repetitions: Int,
    val easeFactor: Float,
    val nextReviewEpochSeconds: Long,
    val state: String,
    val isSynced: Boolean = true
)
