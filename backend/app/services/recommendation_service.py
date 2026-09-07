from datetime import datetime, timezone
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.flashcard import Flashcard
from app.models.progress import GrammarProgress, LearningProgress
from app.schemas.recommendations import RecommendationItem, PersonalizedRecommendationsResponse

class RecommendationService:
    """Smart recommendation engine analyzing SRS urgency, grammar mistake patterns, and curriculum flow."""

    @staticmethod
    async def get_user_recommendations(db: AsyncSession, user_id: str) -> PersonalizedRecommendationsResponse:
        now = datetime.now(timezone.utc)
        items: List[RecommendationItem] = []

        # 1. Check SRS Flashcard Due Queue
        due_result = await db.execute(
            select(func.count(Flashcard.id))
            .where(Flashcard.user_id == user_id, Flashcard.next_review_date <= now)
        )
        due_count = due_result.scalar() or 0
        if due_count > 0:
            items.append(RecommendationItem(
                id="rec-srs-due",
                type="flashcard_review",
                title_fa=f"مرور {due_count} کارت سررسیدشده در جعبه لایتنر",
                description_fa="مرور واژگان در موعد مقرر بر اساس منحنی فراموشی ابینگهاوس، تسلط بلندمدت را تضمین می‌کند.",
                priority=1,
                action_url="/srs",
            ))

        # 2. Check Grammar Topics with High Mistake Count
        mistake_result = await db.execute(
            select(GrammarProgress)
            .where(GrammarProgress.user_id == user_id, GrammarProgress.mistake_count >= 2)
            .order_by(GrammarProgress.mistake_count.desc())
            .limit(2)
        )
        problematic_topics = mistake_result.scalars().all()
        for topic in problematic_topics:
            items.append(RecommendationItem(
                id=f"rec-grammar-{topic.topic_key}",
                type="grammar_lesson",
                title_fa=f"تقویت مبحث {topic.topic_title_fa}",
                description_fa=f"بر اساس آزمون‌های قبلی، {topic.mistake_count} مورد چالش در این مبحث ثبت شده است.",
                priority=2,
                action_url="/grammar",
                target_id=topic.topic_key,
            ))

        # 3. Always provide Mock Exam recommendation if list is short
        if len(items) < 3:
            items.append(RecommendationItem(
                id="rec-mock-exam",
                type="mock_exam",
                title_fa="شرکت در آزمون شبیه‌ساز استاندارد (Mock Exam)",
                description_fa="سنجش هوشمند نمره تراز، ارزیابی نقاط قوت و ضعف و دریافت برنامه اختصاصی مطالعه.",
                priority=3,
                action_url="/mock-exam",
            ))

        # 4. Daily Word recommendation
        items.append(RecommendationItem(
            id="rec-daily-word",
            type="daily_word",
            title_fa="کشف واژه منتخب امروز به همراه تلفظ و ریشه‌شناسی",
            description_fa="افزایش دایره لغات فعال با مثال‌های کاربردی و زمینه فرهنگی روزمره.",
            priority=4,
            action_url="/daily-word",
        ))

        return PersonalizedRecommendationsResponse(
            user_id=user_id,
            generated_at=now.isoformat(),
            recommendations=items,
        )

recommendation_service = RecommendationService()
