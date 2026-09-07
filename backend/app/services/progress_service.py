from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.profile import Profile
from app.models.progress import LearningProgress
from app.models.flashcard import Flashcard
from app.schemas.progress import LessonCompleteRequest, LessonCompleteResponse, ProgressOverviewResponse

class ProgressService:
    """Manages XP gamification, hearts, streaks, and study time calculations."""

    @staticmethod
    async def record_lesson_completion(
        db: AsyncSession,
        user_id: str,
        req: LessonCompleteRequest
    ) -> LessonCompleteResponse:
        # Find or create progress record
        stmt = select(LearningProgress).where(
            LearningProgress.user_id == user_id,
            LearningProgress.lesson_id == req.lesson_id
        )
        res = await db.execute(stmt)
        progress = res.scalar_one_or_none()

        if not progress:
            progress = LearningProgress(
                user_id=user_id,
                unit_id=req.unit_id,
                lesson_id=req.lesson_id,
                score_percent=req.score_percent,
                xp_earned=req.xp_earned,
                is_completed=True,
            )
            db.add(progress)
        else:
            progress.score_percent = max(progress.score_percent, req.score_percent)
            progress.crown_level = min(5, progress.crown_level + 1)

        # Update User Profile (XP, Gems, Streak)
        profile_res = await db.execute(select(Profile).where(Profile.user_id == user_id))
        profile = profile_res.scalar_one_or_none()
        if profile:
            profile.xp += req.xp_earned
            profile.gems += req.gems_earned
            profile.total_words_learned += req.words_learned
            # Update streak logic
            today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            if profile.last_active_date != today_str:
                profile.streak += 1
                profile.last_active_date = today_str

        await db.commit()

        return LessonCompleteResponse(
            success=True,
            lesson_id=req.lesson_id,
            total_xp=profile.xp if profile else req.xp_earned,
            current_streak=profile.streak if profile else 1,
            hearts=profile.hearts if profile else 5,
            gems=profile.gems if profile else 100,
        )

    @staticmethod
    async def get_overview(db: AsyncSession, user_id: str) -> ProgressOverviewResponse:
        now = datetime.now(timezone.utc)

        # Profile info
        p_res = await db.execute(select(Profile).where(Profile.user_id == user_id))
        profile = p_res.scalar_one_or_none()

        # Completed lessons count
        l_res = await db.execute(
            select(func.count(LearningProgress.id))
            .where(LearningProgress.user_id == user_id, LearningProgress.is_completed == True)
        )
        completed_lessons = l_res.scalar() or 0

        # Mastered cards count
        m_res = await db.execute(
            select(func.count(Flashcard.id))
            .where(Flashcard.user_id == user_id, Flashcard.state == "mastered")
        )
        mastered_cards = m_res.scalar() or 0

        # Due reviews count
        d_res = await db.execute(
            select(func.count(Flashcard.id))
            .where(Flashcard.user_id == user_id, Flashcard.next_review_date <= now)
        )
        due_reviews = d_res.scalar() or 0

        return ProgressOverviewResponse(
            user_id=user_id,
            current_level=profile.current_level if profile else "A1",
            xp=profile.xp if profile else 0,
            streak=profile.streak if profile else 1,
            hearts=profile.hearts if profile else 5,
            gems=profile.gems if profile else 100,
            completed_lessons_count=completed_lessons,
            mastered_cards_count=mastered_cards,
            due_reviews_count=due_reviews,
            daily_study_time_minutes=int((profile.daily_study_time_seconds if profile else 0) / 60),
            total_words_learned=profile.total_words_learned if profile else 0,
        )

progress_service = ProgressService()
