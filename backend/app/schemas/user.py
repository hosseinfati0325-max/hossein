from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class UserSettingsBase(BaseModel):
    theme: str = "system"
    color_theme: str = "emerald"
    font_size: str = "medium"
    sound_effects: bool = True
    haptic_feedback: bool = True
    tts_speed: float = 1.0
    auto_play_audio: bool = True
    explanation_language: str = "fa"
    daily_goal_minutes: int = 15
    notifications_enabled: bool = True
    daily_reminder_hour: int = 21
    offline_mode_preferred: bool = False

class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    color_theme: Optional[str] = None
    font_size: Optional[str] = None
    sound_effects: Optional[bool] = None
    haptic_feedback: Optional[bool] = None
    tts_speed: Optional[float] = None
    auto_play_audio: Optional[bool] = None
    explanation_language: Optional[str] = None
    daily_goal_minutes: Optional[int] = None
    notifications_enabled: Optional[bool] = None
    daily_reminder_hour: Optional[int] = None
    offline_mode_preferred: Optional[bool] = None

class UserSettingsResponse(UserSettingsBase):
    id: str
    user_id: str
    updated_at: datetime

    class Config:
        from_attributes = True

class ProfileBase(BaseModel):
    first_name: str = "زبان‌آموز"
    last_name: str = ""
    display_name: str = "زبان‌آموز کوشا"
    avatar: str = "🦁"
    target_language: str = "en"
    explanation_language: str = "fa"
    current_level: str = "A1"

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    display_name: Optional[str] = None
    avatar: Optional[str] = None
    target_language: Optional[str] = None
    explanation_language: Optional[str] = None
    current_level: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    xp: int
    level: int
    streak: int
    hearts: int
    max_hearts: int
    gems: int
    league: str
    league_rank: int
    league_xp: int
    daily_study_time_seconds: int
    total_words_learned: int
    speaking_score_average: float
    placement_test_done: int
    placement_score: Optional[float]
    last_active_date: Optional[str]
    meta_info: Dict[str, Any]

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: str
    email: str
    phone_number: Optional[str] = None
    is_active: bool
    is_admin: bool
    role: str
    profile: Optional[ProfileResponse] = None
    settings: Optional[UserSettingsResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True
