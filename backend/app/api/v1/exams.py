from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.exam import Exam
from app.schemas.exam import ExamResponse

router = APIRouter(prefix="/exams", tags=["Standard Exams"])

@router.get("", response_model=List[ExamResponse])
async def list_exams(
    language: str = "en",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Exam).where(Exam.language == language, Exam.is_deleted == False)
    )
    return res.scalars().all()

@router.get("/{exam_id}", response_model=ExamResponse)
async def get_exam(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Exam).where(Exam.id == exam_id, Exam.is_deleted == False))
    exam = res.scalar_one_or_none()
    if not exam:
        raise HTTPException(status_code=404, detail="آزمون یافت نشد.")
    return exam
