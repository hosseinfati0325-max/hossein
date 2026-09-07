package com.linguapulse.app

import android.app.Application
import com.linguapulse.app.core.SecurityManager
import com.linguapulse.app.data.local.AppDatabase
import com.linguapulse.app.data.remote.NetworkClient
import com.linguapulse.app.data.repository.ExamRepository
import com.linguapulse.app.data.repository.SrsRepository

class LinguaPulseApp : Application() {

    lateinit var database: AppDatabase
        private set

    lateinit var securityManager: SecurityManager
        private set

    lateinit var srsRepository: SrsRepository
        private set

    lateinit var examRepository: ExamRepository
        private set

    override fun onCreate() {
        super.onCreate()

        database = AppDatabase.getInstance(this)
        securityManager = SecurityManager(this)
        val apiService = NetworkClient.createApiService(this)

        srsRepository = SrsRepository(apiService, database.flashcardDao())
        examRepository = ExamRepository(apiService)
    }
}
