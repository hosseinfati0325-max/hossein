from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.progress import (
    LessonCompleteRequest,
    LessonCompleteResponse,
    StudyTimeRecordRequest,
    ProgressOverviewResponse,
)
from app.schemas.analytics import MasteryAnalyticsResponse, WeaknessItem, StrengthItem
from app.schemas.recommendations import PersonalizedRecommendationsResponse
from app.services.progress_service import progress_service
from app.services.recommendation_service import recommendation_service

progress_router = APIRouter(prefix="/progress", tags=["User Progress & Gamification"])

@progress_router.get("/overview", response_model=ProgressOverviewResponse)
async def get_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await progress_service.get_overview(db, current_user.id)

@progress_router.post("/lesson-complete", response_model=LessonCompleteResponse)
async def record_lesson_complete(
    req: LessonCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await progress_service.record_lesson_completion(db, current_user.id, req)

analytics_router = APIRouter(prefix="/analytics", tags=["Analytics & Mastery"])

@analytics_router.get("/mastery", response_model=MasteryAnalyticsResponse)
async def get_mastery(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return MasteryAnalyticsResponse(
        overall_mastery_percent=78.5,
        grammar_mastery_percent=74.0,
        vocab_mastery_percent=83.0,
        weaknesses=[
            WeaknessItem(
                topic_key="grammar_past_perfect",
                topic_title_fa="زمان گذشته کامل (Past Perfect)",
                mistake_count=3,
                mastery_percent=52.0,
                recommendation_fa="مرور درسنامه کاربرد had + p.p در رخدادهای متوالی گذشته.",
            )
        ],
        strengths=[
            StrengthItem(
                topic_key="vocab_travel",
                topic_title_fa="واژگان سفر و فرودگاه",
                mastery_percent=95.0,
            )
        ],
        total_mistakes_recorded=7,
    )

rec_router = APIRouter(prefix="/recommendations", tags=["Smart Recommendations"])

@rec_router.get("", response_model=PersonalizedRecommendationsResponse)
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await recommendation_service.get_user_recommendations(db, current_user.id)

achievements_router = APIRouter(prefix="/achievements", tags=["Achievements & Badges"])

@achievements_router.get("")
async def get_achievements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return [
        {
            "id": "ach-streak-7",
            "title_fa": "استمرار پولادین",
            "description_fa": "۷ روز متوالی یادگیری مستمر بدون وقفه",
            "icon": "Flame",
            "tier": "gold",
            "progress": 7,
            "max_progress": 7,
            "is_unlocked": True,
        },
        {
            "id": "ach-srs-50",
            "title_fa": "استاد جعبه لایتنر",
            "description_fa": "تسلط کامل بر ۵۰ فلش‌کارت در فاصله زمانی طولانی",
            "icon": "Sparkles",
            "tier": "silver",
            "progress": 38,
            "max_progress": 50,
            "is_unlocked": False,
        }
    ]
