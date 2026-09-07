package com.linguapulse.app.data.local.dao

import androidx.room.*
import com.linguapulse.app.data.local.entity.CachedProgress
import kotlinx.coroutines.flow.Flow

@Dao
interface ProgressDao {
    @Query("SELECT * FROM cached_progress WHERE userId = :userId LIMIT 1")
    fun getProgress(userId: String): Flow<CachedProgress?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveProgress(progress: CachedProgress)

    @Query("DELETE FROM cached_progress")
    suspend fun clear()
}
