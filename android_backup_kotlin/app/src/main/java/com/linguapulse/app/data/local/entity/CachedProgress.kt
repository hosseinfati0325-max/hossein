package com.linguapulse.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cached_progress")
data class CachedProgress(
    @PrimaryKey
    val userId: String,
    val xp: Int,
    val streak: Int,
    val hearts: Int,
    val gems: Int,
    val currentLevel: String,
    val completedLessonsCount: Int,
    val lastUpdatedEpochSeconds: Long
)
