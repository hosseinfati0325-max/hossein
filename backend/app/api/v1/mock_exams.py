import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.exam import ExamAttempt, ExamAnswer
from app.schemas.mock_exam import (
    MockExamGenerateRequest,
    ExamQuestionResponse,
    MockExamEvaluateRequest,
    MockExamEvaluateResponse,
)
from app.services.exam_service import exam_service

router = APIRouter(prefix="/mock-exams", tags=["Mock Exams & Assessment"])

@router.post("/generate", response_model=List[ExamQuestionResponse])
async def generate_mock_exam(
    req: MockExamGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Dynamically generates a mock exam tailored to language and level."""
    questions = await exam_service.generate_mock_exam(db, req)
    return questions

@router.post("/evaluate", response_model=MockExamEvaluateResponse)
async def evaluate_mock_exam(
    req: MockExamEvaluateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Evaluates attempt, computes scores, and generates detailed diagnostic breakdown with strengths and weaknesses."""

    score_pct, correct, wrong, unans, cat_scores = exam_service.calculate_scores(
        questions=req.questions,
        user_answers=req.user_answers
    )

    breakdown = await exam_service.generate_diagnostic_breakdown(
        score_percent=score_pct,
        level=req.level,
        category_scores=cat_scores
    )

    xp_earned = int(score_pct * 0.5) + 30
    gems_earned = 10 if score_pct >= 70 else 5

    # Persist attempt record
    attempt = ExamAttempt(
        user_id=current_user.id,
        language=req.target_language,
        level=req.level,
        is_mock=True,
        score_percent=score_pct,
        estimated_band_score=breakdown.estimated_band_score,
        correct_count=correct,
        wrong_count=wrong,
        unanswered_count=unans,
        total_questions=len(req.questions),
        time_spent_seconds=req.time_spent_seconds,
        strengths_fa=breakdown.strengths_fa,
        weaknesses_fa=breakdown.weaknesses_fa,
        actionable_plan_fa=breakdown.actionable_study_plan_fa,
        ai_breakdown=breakdown.dict(),
    )
    db.add(attempt)
    await db.flush()

    # Save answers
    for q in req.questions:
        sel = req.user_answers.get(q.id)
        is_corr = bool(sel and sel.strip().lower() == q.correct_answer.strip().lower())
        ans_record = ExamAnswer(
            attempt_id=attempt.id,
            question_id=q.id if len(q.id) == 36 else None,
            selected_answer=sel,
            correct_answer=q.correct_answer,
            is_correct=is_corr,
        )
        db.add(ans_record)

    # Award user XP and Gems
    prof_res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = prof_res.scalar_one_or_none()
    if profile:
        profile.xp += xp_earned
        profile.gems += gems_earned

    await db.commit()

    return MockExamEvaluateResponse(
        attempt_id=attempt.id,
        score_percent=score_pct,
        correct_count=correct,
        wrong_count=wrong,
        unanswered_count=unans,
        total_questions=len(req.questions),
        time_spent_seconds=req.time_spent_seconds,
        breakdown=breakdown,
        xp_earned=xp_earned,
        gems_earned=gems_earned,
    )
