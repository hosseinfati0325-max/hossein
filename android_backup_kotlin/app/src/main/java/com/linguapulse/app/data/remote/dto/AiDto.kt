package com.linguapulse.app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class DailyWordDto(
    val word: String,
    val phonetic: String?,
    @SerializedName("part_of_speech") val partOfSpeech: String?,
    @SerializedName("translation_fa") val translationFa: String,
    @SerializedName("example_target") val exampleTarget: String,
    @SerializedName("example_fa") val exampleFa: String,
    @SerializedName("pedagogical_tip_fa") val pedagogicalTipFa: String,
    @SerializedName("fun_fact_fa") val funFactFa: String?
)

data class AIChatRequestDto(
    val message: String,
    @SerializedName("target_language") val targetLanguage: String = "en",
    @SerializedName("user_level") val userLevel: String = "B1",
    val mode: String = "chat",
    @SerializedName("idempotency_key") val idempotencyKey: String? = null
)

data class AIChatResponseDto(
    val reply: String,
    @SerializedName("reply_in_target_lang") val replyInTargetLang: String?,
    val explanation: String?,
    val suggestions: List<String>?,
    val provider: String,
    val model: String
)
