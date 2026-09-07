from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class Flashcard(TimeStampedModel):
    __tablename__ = "flashcards"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    language = Column(String(10), default="en", nullable=False, index=True)
    front_text = Column(String(200), nullable=False, index=True)
    back_text_fa = Column(String(255), nullable=False)
    back_text_en = Column(String(255), nullable=True)
    phonetic = Column(String(100), nullable=True)
    part_of_speech = Column(String(50), nullable=True)
    example_target = Column(Text, nullable=True)
    example_fa = Column(Text, nullable=True)
    category = Column(String(100), default="General", nullable=False, index=True)
    image_url = Column(String(255), nullable=True)

    # SM-2 Spaced Repetition Fields
    interval = Column(Integer, default=1, nullable=False)  # in days
    repetitions = Column(Integer, default=0, nullable=False)
    ease_factor = Column(Float, default=2.5, nullable=False)
    next_review_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    last_reviewed_date = Column(DateTime(timezone=True), nullable=True)
    state = Column(String(20), default="new", nullable=False, index=True)  # new, learning, review, mastered

    # Performance stats
    total_reviews = Column(Integer, default=0, nullable=False)
    successful_reviews = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="flashcards")

    __table_args__ = (
        CheckConstraint("ease_factor >= 1.3", name="check_min_ease_factor"),
        CheckConstraint("interval >= 1", name="check_min_interval"),
    )
