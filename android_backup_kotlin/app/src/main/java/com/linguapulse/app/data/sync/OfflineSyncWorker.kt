package com.linguapulse.app.data.sync

import android.content.Context
import androidx.work.*
import com.linguapulse.app.LinguaPulseApp
import java.util.concurrent.TimeUnit

/**
 * Background sync worker using Android Jetpack WorkManager.
 * Schedules periodic synchronization of Spaced Repetition (SRS) data,
 * user progress, and flashcard queues with exponential backoff and network constraints.
 */
class OfflineSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val app = applicationContext as? LinguaPulseApp ?: return Result.failure()
        val resolver = SyncConflictResolver(app.apiService, app.database.flashcardDao())

        val languages = listOf("en", "de", "fr")
        var hasFailure = false

        for (lang in languages) {
            when (val res = resolver.resolveAndSync(lang)) {
                is SyncResult.Success -> {
                    // Successfully synced and resolved conflicts
                }
                is SyncResult.Failure -> {
                    hasFailure = true
                }
            }
        }

        return if (hasFailure) {
            // Retry with exponential backoff
            Result.retry()
        } else {
            Result.success()
        }
    }

    companion object {
        private const val SYNC_WORK_NAME = "PeriodicDataSyncWork"

        fun schedulePeriodicSync(context: Context) {
            // Configured constraints: only sync when device is charging and connected to unmetered network (Wi-Fi)
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.UNMETERED) // Wi-Fi / Unmetered connection
                .setRequiresCharging(true)                    // Device is charging
                .setRequiresBatteryNotLow(true)
                .build()

            val syncRequest = PeriodicWorkRequestBuilder<OfflineSyncWorker>(
                repeatInterval = 15,
                repeatIntervalTimeUnit = TimeUnit.MINUTES,
                flexTimeInterval = 5,
                flexTimeIntervalUnit = TimeUnit.MINUTES
            )
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
                .addTag("offline_sync")
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                SYNC_WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                syncRequest
            )
        }

        fun triggerImmediateSync(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val oneTimeRequest = OneTimeWorkRequestBuilder<OfflineSyncWorker>()
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueue(oneTimeRequest)
        }
    }
}
