from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.schemas.mock_exam import ExamQuestionResponse

class ExamResponse(BaseModel):
    id: str
    language: str
    level: str
    title: str
    subtitle_fa: Optional[str] = None
    duration_minutes: int
    total_questions: int
    is_mock: bool
    band_description_fa: Optional[str] = None
    icon: str
    questions: List[ExamQuestionResponse] = []

    class Config:
        from_attributes = True

class ExamAttemptSubmitRequest(BaseModel):
    exam_id: str
    time_spent_seconds: int
    answers: List[dict]  # list of {question_id: str, selected_answer: str}

class ExamAttemptResponse(BaseModel):
    id: str
    exam_id: Optional[str]
    score_percent: float
    estimated_band_score: Optional[str]
    correct_count: int
    wrong_count: int
    unanswered_count: int
    total_questions: int
    time_spent_seconds: int
    created_at: datetime

    class Config:
        from_attributes = True
