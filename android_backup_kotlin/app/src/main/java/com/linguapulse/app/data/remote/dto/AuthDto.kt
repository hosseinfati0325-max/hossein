package com.linguapulse.app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("target_language") val targetLanguage: String? = "en"
)

data class TokenResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("refresh_token") val refreshToken: String,
    @SerializedName("token_type") val tokenType: String,
    @SerializedName("expires_in") val expiresIn: Int,
    @SerializedName("user_id") val userId: String,
    val email: String,
    val role: String
)

data class RefreshTokenRequest(
    @SerializedName("refresh_token") val refreshToken: String
)
