package com.linguapulse.app.core

object Constants {
    const val PREFS_FILE_NAME = "linguapulse_secure_prefs"
    const val KEY_ACCESS_TOKEN = "jwt_access_token"
    const val KEY_REFRESH_TOKEN = "jwt_refresh_token"
    const val KEY_USER_ID = "authenticated_user_id"
    const val KEY_USER_EMAIL = "authenticated_user_email"
    const val KEY_OFFLINE_MODE = "is_offline_mode"

    const val TIMEOUT_CONNECT_SECONDS = 15L
    const val TIMEOUT_READ_SECONDS = 30L
    const val TIMEOUT_WRITE_SECONDS = 30L
}
