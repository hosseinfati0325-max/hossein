package com.linguapulse.app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class FlashcardDto(
    val id: String,
    @SerializedName("user_id") val userId: String,
    val language: String,
    @SerializedName("front_text") val frontText: String,
    @SerializedName("back_text_fa") val backTextFa: String,
    @SerializedName("back_text_en") val backTextEn: String?,
    val phonetic: String?,
    val category: String,
    val interval: Int,
    val repetitions: Int,
    @SerializedName("ease_factor") val easeFactor: Float,
    val state: String
)

data class SRSDueQueueDto(
    @SerializedName("total_due") val totalDue: Int,
    @SerializedName("total_cards") val totalCards: Int,
    val cards: List<FlashcardDto>
)

data class SRSRateRequest(
    @SerializedName("card_id") val cardId: String,
    val rating: Int
)

data class SRSRateResponse(
    @SerializedName("card_id") val cardId: String,
    @SerializedName("new_state") val newState: String,
    @SerializedName("new_interval") val newInterval: Int,
    @SerializedName("xp_awarded") val xpAwarded: Int
)
