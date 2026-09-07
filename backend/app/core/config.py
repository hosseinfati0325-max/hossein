import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "حسین و فاطمه API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default="production", env="ENVIRONMENT")
    DEBUG: bool = Field(default=False, env="DEBUG")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/hossein_fateme",
        env="DATABASE_URL"
    )
    DATABASE_SYNC_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/hossein_fateme",
        env="DATABASE_SYNC_URL"
    )

    # Redis & Cache
    REDIS_URL: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")

    # JWT & Auth
    SECRET_KEY: str = Field(default="hossein-fateme-production-secret-key-salt-98213", env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 2  # 2 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # 30 days

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "https://hosseinfateme.ir",
    ]

    # AI Providers Configuration
    AI_FREE_MODE: bool = Field(default=True, env="AI_FREE_MODE")
    GEMINI_API_KEY: Optional[str] = Field(default=None, env="GEMINI_API_KEY")
    GROQ_API_KEY: Optional[str] = Field(default=None, env="GROQ_API_KEY")
    OPENROUTER_API_KEY: Optional[str] = Field(default=None, env="OPENROUTER_API_KEY")
    HF_TOKEN: Optional[str] = Field(default=None, env="HF_TOKEN")
    CEREBRAS_API_KEY: Optional[str] = Field(default=None, env="CEREBRAS_API_KEY")
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    OPENAI_COMPATIBLE_API_KEY: Optional[str] = Field(default=None, env="OPENAI_COMPATIBLE_API_KEY")
    OPENAI_COMPATIBLE_BASE_URL: Optional[str] = Field(default=None, env="OPENAI_COMPATIBLE_BASE_URL")
    AI_PROVIDER_PRIORITY: str = Field(
        default="gemini,groq,openrouter,cerebras,huggingface,compatible,openai,anthropic",
        env="AI_PROVIDER_PRIORITY"
    )

    # Default Models
    DEFAULT_GEMINI_MODEL: str = "gemini-3.8-flash"
    DEFAULT_GROQ_MODEL: str = "llama-3.3-70b-versatile"
    DEFAULT_OPENROUTER_MODEL: str = "deepseek/deepseek-chat:free"
    DEFAULT_HF_MODEL: str = "meta-llama/Llama-3.2-3B-Instruct"
    DEFAULT_CEREBRAS_MODEL: str = "llama3.1-8b"
    DEFAULT_OPENAI_MODEL: str = "gpt-4o-mini"
    DEFAULT_CLAUDE_MODEL: str = "claude-3-5-haiku-20241022"
    DEFAULT_COMPATIBLE_MODEL: str = "meta-llama/llama-3-8b-instruct"

    # AI Gateway Resilience Settings
    AI_TIMEOUT_SECONDS: float = 25.0
    AI_MAX_RETRIES: int = 2
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: int = 3
    CIRCUIT_BREAKER_RECOVERY_SECONDS: int = 60

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE_PER_USER: int = 60
    AI_RATE_LIMIT_PER_MINUTE_PER_USER: int = 15

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
