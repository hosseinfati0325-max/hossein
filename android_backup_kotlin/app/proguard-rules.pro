# ProGuard rules for LinguaPulse Production Android App

# Keep data models / DTOs
-keep class com.linguapulse.app.data.remote.dto.** { *; }
-keep class com.linguapulse.app.data.local.entity.** { *; }

# Retrofit & OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn retrofit2.**
-keepattributes Signature
-keepattributes *Annotation*
-keepclassmembers,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}

# Room
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.paging.**

# Gson
-keepattributes EnclosingMethod
-keepclassmembers enum * { *; }

# Security Crypto
-keepnames class androidx.security.crypto.** { *; }
