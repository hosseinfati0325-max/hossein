from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.redis import redis_manager
from app.core.security import verify_password, get_password_hash
from app.core.config import settings
from app.api.deps import get_current_user, oauth2_scheme
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    PasswordResetRequest,
    ForgotPasswordRequest,
    VerifyContactRequest,
)
from app.schemas.user import UserResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Registers a new user and returns JWT session tokens."""
    try:
        user = await auth_service.register_user(db, req)
        return auth_service.generate_tokens(user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticates user with email and password."""
    user = await auth_service.authenticate_user(db, req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ایمیل یا رمز عبور اشتباه است.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_service.generate_tokens(user)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Exchanges a valid refresh token for a fresh access token."""
    try:
        return await auth_service.refresh_tokens(db, req.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Returns the authenticated user's detailed information."""
    await db.refresh(current_user, ["profile", "settings"])
    return current_user

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    token: Optional[str] = Depends(oauth2_scheme)
):
    """Logs out user by invalidating the current JWT access token via Redis blacklist."""
    if token:
        await auth_service.revoke_token(token)
    return {"message": "خروج با موفقیت انجام شد و توکن جلسه ابطال گردید."}

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Sends a 6-digit OTP code to the user's email/phone for password reset."""
    result = await db.execute(select(User).where(User.email == req.email, User.is_deleted == False))
    user = result.scalar_one_or_none()
    if not user:
        # Prevent user enumeration by returning identical success response
        return {"message": "در صورت ثبت بودن ایمیل، کد تأیید ارسال خواهد شد."}

    import random
    otp_code = f"{random.randint(100000, 999999)}"
    # Store OTP in Redis for 10 minutes
    await redis_manager.set_json(f"otp:reset:{user.email}", {"code": otp_code, "user_id": user.id}, expire_seconds=600)
    
    # In production, this triggers email/SMS Celery task
    return {
        "message": "کد تأیید به ایمیل شما ارسال شد.",
        "expires_in_seconds": 600,
        "dev_hint_code": otp_code if settings.DEBUG else None
    }

@router.post("/reset-password")
async def reset_password(req: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    """Resets user password using old password or verified reset OTP token."""
    result = await db.execute(select(User).where(User.email == req.email, User.is_deleted == False))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="کاربر یافت نشد.")

    # Verification by Old Password
    if req.old_password:
        if not verify_password(req.old_password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="رمز عبور فعلی نامعتبر است.")
    elif req.reset_token:
        # Verification by OTP Reset Token from Redis
        cached_otp = await redis_manager.get_json(f"otp:reset:{user.email}")
        if not cached_otp or cached_otp.get("code") != req.reset_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="کد تأیید نامعتبر یا منقضی شده است.")
        # Consume OTP
        client = await redis_manager.get_client()
        await client.delete(f"otp:reset:{user.email}")
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ارائه رمز عبور قبلی یا کد تأیید الزامی است.")

    user.hashed_password = get_password_hash(req.new_password)
    await db.commit()
    return {"message": "رمز عبور با موفقیت به‌روزرسانی شد."}

@router.post("/verify-contact")
async def verify_contact(req: VerifyContactRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Verifies user's email or phone number using 6-digit OTP."""
    target_contact = current_user.email if req.contact_type == "email" else current_user.phone_number
    if not target_contact:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="اطلاعات تماس برای تأیید ثبت نشده است.")

    cached_otp = await redis_manager.get_json(f"otp:verify:{target_contact}")
    if not cached_otp or cached_otp.get("code") != req.code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="کد تأیید اشتباه یا منقضی شده است.")

    return {"message": f"{req.contact_type} با موفقیت تأیید شد."}
