package com.linguapulse.app.data.remote

import android.content.Context
import com.linguapulse.app.BuildConfig
import com.linguapulse.app.core.Constants
import com.linguapulse.app.core.SecurityManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object NetworkClient {

    private val BASE_URL: String = BuildConfig.BASE_URL

    fun createApiService(context: Context): ApiService {
        val securityManager = SecurityManager(context)

        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
        }

        val okHttpClient = OkHttpClient.Builder()
            .connectTimeout(Constants.TIMEOUT_CONNECT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(Constants.TIMEOUT_READ_SECONDS, TimeUnit.SECONDS)
            .writeTimeout(Constants.TIMEOUT_WRITE_SECONDS, TimeUnit.SECONDS)
            .addInterceptor(AuthInterceptor(securityManager))
            .addInterceptor(loggingInterceptor)
            .retryOnConnectionFailure(true)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        return retrofit.create(ApiService::class.java)
    }
}
