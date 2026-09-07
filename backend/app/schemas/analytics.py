from typing import List
from pydantic import BaseModel

class WeaknessItem(BaseModel):
    topic_key: str
    topic_title_fa: str
    mistake_count: int
    mastery_percent: float
    recommendation_fa: str

class StrengthItem(BaseModel):
    topic_key: str
    topic_title_fa: str
    mastery_percent: float

class MasteryAnalyticsResponse(BaseModel):
    overall_mastery_percent: float
    grammar_mastery_percent: float
    vocab_mastery_percent: float
    weaknesses: List[WeaknessItem]
    strengths: List[StrengthItem]
    total_mistakes_recorded: int
