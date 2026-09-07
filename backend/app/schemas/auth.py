from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    first_name: Optional[str] = "زبان‌آموز"
    last_name: Optional[str] = ""
    target_language: Optional[str] = "en"
    phone_number: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    user_id: str
    email: str
    role: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr
    old_password: Optional[str] = None
    new_password: str = Field(..., min_length=6)
    reset_token: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyContactRequest(BaseModel):
    code: str = Field(..., min_length=4, max_length=6)
    contact_type: str = Field("email", description="email or phone")

class TokenPayload(BaseModel):
    sub: str
    role: str = "student"
    type: str = "access"
    exp: int
    jti: Optional[str] = None
