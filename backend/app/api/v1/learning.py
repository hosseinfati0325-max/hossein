from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import get_optional_user
from app.models.learning import GrammarModule, GrammarLesson, VocabularySet, VocabularyWord
from app.schemas.learning import (
    GrammarModuleResponse,
    GrammarLessonResponse,
    VocabularySetResponse,
    VocabularyWordResponse,
)
from app.ai.gateway import ai_gateway

router = APIRouter(prefix="/learning", tags=["Curriculum & Learning Content"])

@router.get("/grammar/modules", response_model=List[GrammarModuleResponse])
async def list_grammar_modules(
    language: str = "en",
    level: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(GrammarModule).where(
        GrammarModule.language == language,
        GrammarModule.is_deleted == False
    )
    if level:
        query = query.where(GrammarModule.level == level)
    res = await db.execute(query.order_by(GrammarModule.order_index.asc()))
    return res.scalars().all()

@router.get("/grammar/lessons/{lesson_id}", response_model=GrammarLessonResponse)
async def get_grammar_lesson(lesson_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(GrammarLesson).where(GrammarLesson.id == lesson_id))
    lesson = res.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="درسنامه گرامر یافت نشد.")
    return lesson

@router.post("/grammar/analyze-sentence")
async def analyze_sentence(payload: dict):
    sentence = payload.get("sentence", "")
    prompt = f"Analyze the grammatical structure, parts of speech, and tense of this sentence: '{sentence}'. Provide Persian explanation."
    res = await ai_gateway.execute_with_failover(
        task_name="grammar_analysis",
        is_json=True,
        prompt=prompt,
    )
    return res.parsed_json or {"analysis": res.raw_text}

@router.get("/vocabulary/sets", response_model=List[VocabularySetResponse])
async def list_vocabulary_sets(
    language: str = "en",
    level: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(VocabularySet).where(
        VocabularySet.language == language,
        VocabularySet.is_deleted == False
    )
    if level:
        query = query.where(VocabularySet.level == level)
    res = await db.execute(query)
    return res.scalars().all()
