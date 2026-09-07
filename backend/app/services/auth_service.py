from datetime import datetime, timezone
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserSettings
from app.models.profile import Profile
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import RegisterRequest, TokenResponse

from app.core.redis import redis_manager

class AuthService:
    """Handles user registration, credentials verification, and JWT session lifecycle."""

    @staticmethod
    async def register_user(db: AsyncSession, req: RegisterRequest) -> User:
        # Check if email already exists
        result = await db.execute(select(User).where(User.email == req.email))
        if result.scalar_one_or_none():
            raise ValueError("این ایمیل قبلاً در سیستم ثبت شده است.")

        hashed_pw = get_password_hash(req.password)
        new_user = User(
            email=req.email,
            phone_number=req.phone_number,
            hashed_password=hashed_pw,
            is_active=True,
            role="student",
        )
        db.add(new_user)
        await db.flush()

        # Create Profile
        new_profile = Profile(
            user_id=new_user.id,
            first_name=req.first_name or "زبان‌آموز",
            last_name=req.last_name or "",
            display_name=f"{req.first_name or 'زبان‌آموز'} {req.last_name or ''}".strip(),
            target_language=req.target_language or "en",
        )
        db.add(new_profile)

        # Create Default Settings
        new_settings = UserSettings(user_id=new_user.id)
        db.add(new_settings)

        await db.commit()
        await db.refresh(new_user)
        return new_user

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not user.is_active or user.is_deleted:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def generate_tokens(user: User) -> TokenResponse:
        access_token = create_access_token(subject=user.id, role=user.role)
        refresh_token = create_refresh_token(subject=user.id)
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=60 * 120,  # 2 hours
            user_id=user.id,
            email=user.email,
            role=user.role,
        )

    @staticmethod
    async def refresh_tokens(db: AsyncSession, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("توکن تازه‌سازی نامعتبر یا منقضی شده است.")

        jti = payload.get("jti")
        if jti:
            # Check blacklist in Redis
            is_blacklisted = await redis_manager.get_json(f"blacklist:token:{jti}")
            if is_blacklisted:
                raise ValueError("این توکن قبلاً استفاده یا ابطال شده است (Token Reuse Detected).")

        user_id = payload.get("sub")
        result = await db.execute(select(User).where(User.id == user_id, User.is_deleted == False))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise ValueError("کاربر یافت نشد یا غیرفعال است.")

        # Invalidate old refresh token (Token Rotation)
        if jti:
            remaining_seconds = max(0, int(payload.get("exp", 0) - datetime.now(timezone.utc).timestamp()))
            await redis_manager.set_json(f"blacklist:token:{jti}", {"revoked_at": datetime.now(timezone.utc).isoformat()}, expire_seconds=remaining_seconds or 86400 * 30)

        # Generate fresh token pair
        return AuthService.generate_tokens(user)

    @staticmethod
    async def revoke_token(token: str) -> bool:
        """Adds a token's JTI to Redis blacklist."""
        payload = decode_token(token)
        if not payload:
            return False
        jti = payload.get("jti")
        if not jti:
            return False
        remaining_seconds = max(0, int(payload.get("exp", 0) - datetime.now(timezone.utc).timestamp()))
        return await redis_manager.set_json(f"blacklist:token:{jti}", {"revoked_at": datetime.now(timezone.utc).isoformat()}, expire_seconds=remaining_seconds or 7200)

auth_service = AuthService()
