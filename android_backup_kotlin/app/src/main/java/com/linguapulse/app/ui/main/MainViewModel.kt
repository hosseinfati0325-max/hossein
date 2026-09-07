package com.linguapulse.app.ui.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.linguapulse.app.data.local.entity.CachedFlashcard
import com.linguapulse.app.data.repository.SrsRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class MainUiState {
    object Loading : MainUiState()
    data class Success(val dueCards: List<CachedFlashcard>, val syncMessage: String? = null) : MainUiState()
    data class Error(val message: String) : MainUiState()
}

class MainViewModel(
    private val srsRepository: SrsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<MainUiState>(MainUiState.Loading)
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    init {
        loadDueCards()
    }

    fun loadDueCards(language: String = "en") {
        viewModelScope.launch {
            _uiState.value = MainUiState.Loading
            srsRepository.getDueFlashcards(language).collect { cards ->
                _uiState.value = MainUiState.Success(dueCards = cards)
            }
        }
    }

    fun syncWithServer(language: String = "en") {
        viewModelScope.launch {
            val result = srsRepository.syncDueFlashcards(language)
            result.onSuccess { count ->
                // Flow emission will update state automatically
            }.onFailure { error ->
                // Retain cached data, surface non-intrusive banner
            }
        }
    }

    fun rateFlashcard(cardId: String, rating: Int) {
        viewModelScope.launch {
            srsRepository.rateCard(cardId, rating)
        }
    }
}
