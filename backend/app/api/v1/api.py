from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.learning import router as learning_router
from app.api.v1.flashcards import router as flashcards_router, review_router
from app.api.v1.mock_exams import router as mock_exams_router
from app.api.v1.exams import router as exams_router
from app.api.v1.progress import (
    progress_router,
    analytics_router,
    rec_router,
    achievements_router,
)
from app.api.v1.ai_tutor import router as ai_router
from app.api.v1.admin import router as admin_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(profile_router)
api_v1_router.include_router(learning_router)
api_v1_router.include_router(flashcards_router)
api_v1_router.include_router(review_router)
api_v1_router.include_router(mock_exams_router)
api_v1_router.include_router(exams_router)
api_v1_router.include_router(progress_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(rec_router)
api_v1_router.include_router(achievements_router)
api_v1_router.include_router(ai_router)
api_v1_router.include_router(admin_router)
