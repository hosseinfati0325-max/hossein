from sqlalchemy import Column, String, Boolean, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class User(TimeStampedModel):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    phone_number = Column(String(50), nullable=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    role = Column(String(50), default="student", nullable=False)  # student, teacher, admin

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="user", cascade="all, delete-orphan")
    exam_attempts = relationship("ExamAttempt", back_populates="user", cascade="all, delete-orphan")
    learning_progress = relationship("LearningProgress", back_populates="user", cascade="all, delete-orphan")
    ai_conversations = relationship("AIConversation", back_populates="user", cascade="all, delete-orphan")

class UserSettings(TimeStampedModel):
    __tablename__ = "user_settings"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme = Column(String(20), default="system", nullable=False)  # system, light, dark
    color_theme = Column(String(20), default="emerald", nullable=False)  # emerald, blue, purple, rose, amber
    font_size = Column(String(20), default="medium", nullable=False)  # small, medium, large, xlarge
    sound_effects = Column(Boolean, default=True, nullable=False)
    haptic_feedback = Column(Boolean, default=True, nullable=False)
    tts_speed = Column(Float, default=1.0, nullable=False)
    auto_play_audio = Column(Boolean, default=True, nullable=False)
    explanation_language = Column(String(10), default="fa", nullable=False)  # fa, en, de, fr
    daily_goal_minutes = Column(Integer, default=15, nullable=False)
    notifications_enabled = Column(Boolean, default=True, nullable=False)
    daily_reminder_hour = Column(Integer, default=21, nullable=False)
    offline_mode_preferred = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="settings")
