from sqlalchemy import Column, String, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class Profile(TimeStampedModel):
    __tablename__ = "profiles"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(String(100), default="زبان‌آموز", nullable=False)
    last_name = Column(String(100), default="", nullable=False)
    display_name = Column(String(200), default="زبان‌آموز کوشا", nullable=False)
    avatar = Column(String(255), default="🦁", nullable=False)
    target_language = Column(String(10), default="en", nullable=False, index=True)  # en, de, fr, es, it, etc.
    explanation_language = Column(String(10), default="fa", nullable=False)
    current_level = Column(String(10), default="A1", nullable=False, index=True)  # A1, A2, B1, B2, C1, C2
    
    # Gamification and Progress
    xp = Column(Integer, default=0, nullable=False, index=True)
    level = Column(Integer, default=1, nullable=False)
    streak = Column(Integer, default=1, nullable=False)
    last_active_date = Column(String(20), nullable=True)  # YYYY-MM-DD
    hearts = Column(Integer, default=5, nullable=False)
    max_hearts = Column(Integer, default=5, nullable=False)
    gems = Column(Integer, default=100, nullable=False)
    league = Column(String(20), default="bronze", nullable=False)
    league_rank = Column(Integer, default=1, nullable=False)
    league_xp = Column(Integer, default=0, nullable=False)
    
    daily_study_time_seconds = Column(Integer, default=0, nullable=False)
    total_words_learned = Column(Integer, default=0, nullable=False)
    speaking_score_average = Column(Float, default=85.0, nullable=False)
    placement_test_done = Column(Integer, default=0, nullable=False)  # 0 or 1
    placement_score = Column(Float, nullable=True)

    # Extra meta: streak days, stats
    meta_info = Column(JSON, default=dict, nullable=False)

    user = relationship("User", back_populates="profile")
