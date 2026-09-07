from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, UniqueConstraint
from app.models.base import TimeStampedModel

class Achievement(TimeStampedModel):
    __tablename__ = "achievements"

    key = Column(String(50), unique=True, index=True, nullable=False)
    title_fa = Column(String(100), nullable=False)
    description_fa = Column(String(255), nullable=False)
    icon = Column(String(50), default="Award", nullable=False)
    category = Column(String(50), default="streak", nullable=False)  # streak, xp, lessons, srs
    tier = Column(String(20), default="bronze", nullable=False)  # bronze, silver, gold, diamond
    max_progress = Column(Integer, default=10, nullable=False)

class UserAchievement(TimeStampedModel):
    __tablename__ = "user_achievements"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = Column(String(36), ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False, index=True)
    progress = Column(Integer, default=0, nullable=False)
    is_unlocked = Column(Boolean, default=False, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )
