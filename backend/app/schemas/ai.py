from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AIChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str

class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    target_language: str = "en"
    user_level: str = "B1"
    history: List[AIChatMessage] = []
    mode: str = "chat"  # chat, roleplay, grammar, pronunciation
    idempotency_key: Optional[str] = None

class AICorrectionItem(BaseModel):
    original: str
    corrected: str
    explanation_fa: str

class AIChatResponse(BaseModel):
    reply: str
    reply_in_target_lang: Optional[str] = None
    corrections: List[AICorrectionItem] = []
    explanation: Optional[str] = None
    suggestions: List[str] = []
    vocabulary_tips: List[Dict[str, str]] = []
    provider: str
    model: str
    latency_ms: int
    is_cached: bool = False

class WritingCorrectionRequest(BaseModel):
    text: str = Field(..., min_length=2)
    prompt: Optional[str] = None
    target_language: str = "en"
    user_level: str = "B1"

class WritingCorrectionResponse(BaseModel):
    score: int
    cefr_level: str
    general_feedback_fa: str
    strengths_fa: List[str] = []
    weaknesses_fa: List[str] = []
    corrected_text: str
    detailed_corrections: List[AICorrectionItem] = []
    provider: str

class DailyWordResponse(BaseModel):
    word: str
    phonetic: Optional[str] = None
    part_of_speech: Optional[str] = None
    translation_fa: str
    example_target: str
    example_fa: str
    pedagogical_tip_fa: str
    fun_fact_fa: Optional[str] = None
    is_cached: bool = False
    is_fallback: bool = False

class RoleplayTurnRequest(BaseModel):
    scenario_id: str
    user_message: str
    target_language: str = "en"
    user_level: str = "B1"
    dialogue_history: List[Dict[str, str]] = []

class RoleplayTurnResponse(BaseModel):
    ai_reply: str
    ai_reply_fa: str
    feedback_fa: Optional[str] = None
    is_goal_achieved: bool = False
    suggested_replies: List[str] = []
