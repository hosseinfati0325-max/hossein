from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserSettings
from app.models.profile import Profile
from app.schemas.user import ProfileResponse, ProfileUpdate, UserSettingsResponse, UserSettingsUpdate

router = APIRouter(prefix="/profile", tags=["Profile & Settings"])

@router.get("", response_model=ProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="پروفایل کاربر یافت نشد.")
    return profile

@router.put("", response_model=ProfileResponse)
async def update_profile(
    req: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="پروفایل کاربر یافت نشد.")

    for field, val in req.dict(exclude_unset=True).items():
        setattr(profile, field, val)

    await db.commit()
    await db.refresh(profile)
    return profile

@router.get("/settings", response_model=UserSettingsResponse)
async def get_settings(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    settings = res.scalar_one_or_none()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    return settings

@router.put("/settings", response_model=UserSettingsResponse)
async def update_settings(
    req: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    settings = res.scalar_one_or_none()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    for field, val in req.dict(exclude_unset=True).items():
        setattr(settings, field, val)

    await db.commit()
    await db.refresh(settings)
    return settings
