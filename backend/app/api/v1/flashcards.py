from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.flashcard import Flashcard
from app.models.profile import Profile
from app.schemas.flashcard import (
    FlashcardCreate,
    FlashcardUpdate,
    FlashcardResponse,
    SRSRatingRequest,
    SRSRatingResponse,
    SRSDueQueueResponse,
)
from app.services.srs_service import srs_service

router = APIRouter(prefix="/flashcards", tags=["Flashcards & SRS"])

@router.get("", response_model=List[FlashcardResponse])
async def list_flashcards(
    language: Optional[str] = "en",
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Flashcard).where(
        Flashcard.user_id == current_user.id,
        Flashcard.is_deleted == False
    )
    if language:
        query = query.where(Flashcard.language == language)
    if category:
        query = query.where(Flashcard.category == category)

    res = await db.execute(query.order_by(Flashcard.created_at.desc()))
    return res.scalars().all()

@router.post("", response_model=FlashcardResponse, status_code=status.HTTP_201_CREATED)
async def create_flashcard(
    req: FlashcardCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    card = Flashcard(
        user_id=current_user.id,
        language=req.language,
        front_text=req.front_text,
        back_text_fa=req.back_text_fa,
        back_text_en=req.back_text_en,
        phonetic=req.phonetic,
        part_of_speech=req.part_of_speech,
        example_target=req.example_target,
        example_fa=req.example_fa,
        category=req.category,
        image_url=req.image_url,
    )
    db.add(card)
    await db.commit()
    await db.refresh(card)
    return card

@router.delete("/{card_id}")
async def delete_flashcard(
    card_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Flashcard).where(Flashcard.id == card_id, Flashcard.user_id == current_user.id)
    )
    card = res.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="فلش‌کارت یافت نشد.")
    card.soft_delete()
    await db.commit()
    return {"message": "فلش‌کارت با موفقیت حذف شد."}

review_router = APIRouter(prefix="/review", tags=["Spaced Repetition Review"])

@review_router.get("/due", response_model=SRSDueQueueResponse)
async def get_due_cards(
    language: str = "en",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    res_due = await db.execute(
        select(Flashcard).where(
            Flashcard.user_id == current_user.id,
            Flashcard.language == language,
            Flashcard.next_review_date <= now,
            Flashcard.is_deleted == False
        ).order_by(Flashcard.next_review_date.asc())
    )
    due_cards = res_due.scalars().all()

    res_all = await db.execute(
        select(Flashcard).where(
            Flashcard.user_id == current_user.id,
            Flashcard.language == language,
            Flashcard.is_deleted == False
        )
    )
    all_cards = res_all.scalars().all()

    return SRSDueQueueResponse(
        total_due=len(due_cards),
        total_cards=len(all_cards),
        cards=due_cards,
    )

@review_router.post("/rate", response_model=SRSRatingResponse)
async def rate_flashcard(
    req: SRSRatingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Flashcard).where(Flashcard.id == req.card_id, Flashcard.user_id == current_user.id)
    )
    card = res.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="فلش‌کارت یافت نشد.")

    prev_state = card.state
    reps, interval, ef, next_rev, new_state = srs_service.calculate_sm2(
        rating=req.rating,
        repetitions=card.repetitions,
        interval=card.interval,
        ease_factor=card.ease_factor,
    )

    card.repetitions = reps
    card.interval = interval
    card.ease_factor = ef
    card.next_review_date = next_rev
    card.last_reviewed_date = datetime.now(timezone.utc)
    card.state = new_state
    card.total_reviews += 1
    if req.rating >= 3:
        card.successful_reviews += 1

    # Award XP for review
    xp_awarded = 5 if req.rating < 3 else (10 if req.rating < 5 else 15)
    prof_res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    prof = prof_res.scalar_one_or_none()
    if prof:
        prof.xp += xp_awarded

    await db.commit()

    return SRSRatingResponse(
        card_id=card.id,
        previous_state=prev_state,
        new_state=new_state,
        new_interval=interval,
        new_ease_factor=ef,
        next_review_date=next_rev,
        xp_awarded=xp_awarded,
    )
