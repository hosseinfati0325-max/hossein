from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class LearningProgress(TimeStampedModel):
    __tablename__ = "learning_progress"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    language = Column(String(10), default="en", nullable=False, index=True)
    unit_id = Column(String(50), nullable=False, index=True)
    lesson_id = Column(String(50), nullable=False, index=True)
    is_completed = Column(Boolean, default=True, nullable=False)
    crown_level = Column(Integer, default=1, nullable=False)  # 1 = completed, 2 = mastered
    score_percent = Column(Float, default=100.0, nullable=False)
    xp_earned = Column(Integer, default=20, nullable=False)

    user = relationship("User", back_populates="learning_progress")

    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson_progress"),
    )

class VocabularyProgress(TimeStampedModel):
    __tablename__ = "vocabulary_progress"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    language = Column(String(10), default="en", nullable=False, index=True)
    word_id = Column(String(36), ForeignKey("vocabulary_words.id", ondelete="CASCADE"), nullable=True, index=True)
    word_text = Column(String(150), nullable=False, index=True)
    mastery_percent = Column(Float, default=0.0, nullable=False)
    times_practiced = Column(Integer, default=0, nullable=False)
    mistake_count = Column(Integer, default=0, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "word_text", "language", name="uq_user_word_progress"),
    )

class GrammarProgress(TimeStampedModel):
    __tablename__ = "grammar_progress"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    language = Column(String(10), default="en", nullable=False, index=True)
    topic_key = Column(String(100), nullable=False, index=True)
    topic_title_fa = Column(String(200), nullable=False)
    mastery_percent = Column(Float, default=0.0, nullable=False)
    times_tested = Column(Integer, default=0, nullable=False)
    mistake_count = Column(Integer, default=0, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "topic_key", "language", name="uq_user_grammar_progress"),
    )
