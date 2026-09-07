from typing import List, Optional
from pydantic import BaseModel

class RecommendationItem(BaseModel):
    id: str
    type: str  # grammar_lesson, flashcard_review, mock_exam, daily_word
    title_fa: str
    description_fa: str
    priority: int  # 1 = highest, 5 = lowest
    action_url: Optional[str] = None
    target_id: Optional[str] = None

class PersonalizedRecommendationsResponse(BaseModel):
    user_id: str
    generated_at: str
    recommendations: List[RecommendationItem]
