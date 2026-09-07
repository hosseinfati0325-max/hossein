from typing import List, Optional
from pydantic import BaseModel

class LessonCompleteRequest(BaseModel):
    unit_id: str
    lesson_id: str
    score_percent: float = 100.0
    xp_earned: int = 20
    gems_earned: int = 5
    words_learned: int = 5

class LessonCompleteResponse(BaseModel):
    success: bool
    lesson_id: str
    total_xp: int
    current_streak: int
    hearts: int
    gems: int

class StudyTimeRecordRequest(BaseModel):
    seconds: int

class ProgressOverviewResponse(BaseModel):
    user_id: str
    current_level: str
    xp: int
    streak: int
    hearts: int
    gems: int
    completed_lessons_count: int
    mastered_cards_count: int
    due_reviews_count: int
    daily_study_time_minutes: int
    total_words_learned: int
