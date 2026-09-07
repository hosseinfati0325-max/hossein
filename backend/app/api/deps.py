from typing import Optional, AsyncGenerator
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import decode_token
from app.core.config import settings
from app.core.redis import redis_manager
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Authenticates JWT Bearer token and returns the current user."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="توکن احراز هویت ارائه نشده است.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="توکن دسترسی نامعتبر یا منقضی است.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check blacklist for revoked token
    jti = payload.get("jti")
    if jti:
        is_revoked = await redis_manager.get_json(f"blacklist:token:{jti}")
        if is_revoked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="این توکن منقضی یا ابطال شده است.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id, User.is_deleted == False))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربر مورد نظر یافت نشد.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="حساب کاربری غیرفعال است.",
        )
    return user

async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Verifies user has administrative permissions."""
    if not (current_user.is_admin or current_user.role == "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی به این بخش نیازمند مجوز مدیریت سیستم است.",
        )
    return current_user

async def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Allows anonymous calls but attaches user if token is provided and valid."""
    if not token:
        return None
    try:
        return await get_current_user(token=token, db=db)
    except Exception:
        return None

async def rate_limit_user(
    request: Request,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Enforces rate limiting based on User ID or IP address."""
    key_id = current_user.id if current_user else (request.client.host if request.client else "unknown")
    allowed = await redis_manager.check_rate_limit(
        key=f"ratelimit:{key_id}",
        limit=settings.RATE_LIMIT_PER_MINUTE_PER_USER,
        window_seconds=60,
    )
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً یک دقیقه دیگر تلاش کنید.",
        )
