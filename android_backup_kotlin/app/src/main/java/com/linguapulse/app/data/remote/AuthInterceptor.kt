package com.linguapulse.app.data.remote

import com.linguapulse.app.core.SecurityManager
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val securityManager: SecurityManager) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = securityManager.getAccessToken()

        val newRequest = if (!token.isNullOrBlank()) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .header("Accept", "application/json")
                .build()
        } else {
            originalRequest.newBuilder()
                .header("Accept", "application/json")
                .build()
        }

        val response = chain.proceed(newRequest)

        // Transparent token refresh on 401 Unauthorized
        if (response.code == 401 && !originalRequest.url.encodedPath.contains("auth/")) {
            val refreshToken = securityManager.getRefreshToken()
            if (!refreshToken.isNullOrBlank()) {
                // Let repository handle refresh flow or propagate
            }
        }

        return response
    }
}
