from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class ExamQuestionResponse(BaseModel):
    id: str
    source_type: str
    topic_category_fa: str
    prompt_fa: str
    prompt_target: Optional[str] = None
    target_audio_text: Optional[str] = None
    options: List[str]
    correct_answer: str
    explanation_fa: str
    phonetic: Optional[str] = None

    class Config:
        from_attributes = True

class MockExamGenerateRequest(BaseModel):
    target_language: str = "en"
    level: str = "B1"
    question_count: int = 15
    include_grammar: bool = True
    include_vocabulary: bool = True

class MockExamCategoryScore(BaseModel):
    category_fa: str
    source_type: str
    total: int
    correct: int
    percentage: float
    status: str

class MockExamBreakdownResponse(BaseModel):
    overall_score_percent: float
    estimated_band_score: str
    proficiency_level: str
    summary_fa: str
    strengths_fa: List[str]
    weaknesses_fa: List[str]
    actionable_study_plan_fa: List[str]
    category_scores: List[MockExamCategoryScore]
    motivational_message_fa: str

class MockExamEvaluateRequest(BaseModel):
    target_language: str = "en"
    level: str = "B1"
    time_spent_seconds: int
    user_answers: Dict[str, str]  # question_id -> selected_answer
    questions: List[ExamQuestionResponse]

class MockExamEvaluateResponse(BaseModel):
    attempt_id: str
    score_percent: float
    correct_count: int
    wrong_count: int
    unanswered_count: int
    total_questions: int
    time_spent_seconds: int
    breakdown: MockExamBreakdownResponse
    xp_earned: int
    gems_earned: int
