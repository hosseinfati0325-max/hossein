from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class FlashcardCreate(BaseModel):
    language: str = "en"
    front_text: str
    back_text_fa: str
    back_text_en: Optional[str] = None
    phonetic: Optional[str] = None
    part_of_speech: Optional[str] = None
    example_target: Optional[str] = None
    example_fa: Optional[str] = None
    category: str = "General"
    image_url: Optional[str] = None

class FlashcardUpdate(BaseModel):
    front_text: Optional[str] = None
    back_text_fa: Optional[str] = None
    phonetic: Optional[str] = None
    example_target: Optional[str] = None
    example_fa: Optional[str] = None
    category: Optional[str] = None

class FlashcardResponse(BaseModel):
    id: str
    user_id: str
    language: str
    front_text: str
    back_text_fa: str
    back_text_en: Optional[str] = None
    phonetic: Optional[str] = None
    part_of_speech: Optional[str] = None
    example_target: Optional[str] = None
    example_fa: Optional[str] = None
    category: str
    image_url: Optional[str] = None
    interval: int
    repetitions: int
    ease_factor: float
    next_review_date: datetime
    last_reviewed_date: Optional[datetime] = None
    state: str
    total_reviews: int
    successful_reviews: int

    class Config:
        from_attributes = True

class SRSRatingRequest(BaseModel):
    card_id: str
    rating: int = Field(..., ge=1, le=5, description="SM-2 rating: 1=Again, 2=Hard, 3=Good, 4=Easy, 5=Perfect")

class SRSRatingResponse(BaseModel):
    card_id: str
    previous_state: str
    new_state: str
    new_interval: int
    new_ease_factor: float
    next_review_date: datetime
    xp_awarded: int

class SRSDueQueueResponse(BaseModel):
    total_due: int
    total_cards: int
    cards: List[FlashcardResponse]
