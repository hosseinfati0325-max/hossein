from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
import time
from pydantic import BaseModel

class NormalizedAIResponse(BaseModel):
    """Universal normalized response across all AI providers."""
    raw_text: str
    parsed_json: Optional[Dict[str, Any]] = None
    provider_name: str
    model_name: str
    tokens_prompt: int = 0
    tokens_completion: int = 0
    latency_ms: int = 0
    success: bool = True
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    is_fallback: bool = False

class AIProvider(ABC):
    """Abstract base class for all AI LLM providers with free-tier compliance and health status."""

    def __init__(
        self,
        name: str,
        priority: int = 1,
        is_free: bool = True,
        default_model: str = "",
        free_models: Optional[List[str]] = None,
        rate_limit_rpm: int = 30,
        rate_limit_rpd: int = 1500,
    ):
        self.name = name
        self.priority = priority
        self.is_free = is_free
        self.default_model = default_model
        self.free_models = free_models or []
        self.rate_limit_rpm = rate_limit_rpm
        self.rate_limit_rpd = rate_limit_rpd
        self.cooldown_until = 0.0
        self.consecutive_failures = 0
        self.enabled = True
        self.status = "AVAILABLE"  # AVAILABLE, LIMITED, COOLDOWN, UNAVAILABLE, DISABLED

    def is_in_cooldown(self) -> bool:
        return time.time() < self.cooldown_until

    def set_cooldown(self, seconds: float):
        self.cooldown_until = time.time() + seconds
        self.status = "COOLDOWN"

    def is_model_free(self, model: str) -> bool:
        if not self.is_free:
            return False
        if not self.free_models:
            return True
        return model in self.free_models or model.endswith(":free")

    def get_model_for_task(self, task_name: str, free_only: bool = True) -> str:
        """Select appropriate model based on task complexity (fast for simple, reasoning for complex)."""
        return self.default_model

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> NormalizedAIResponse:
        """Generate plain text from prompt."""
        pass

    @abstractmethod
    async def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        schema: Optional[Dict[str, Any]] = None,
        temperature: float = 0.3,
    ) -> NormalizedAIResponse:
        """Generate structured JSON response."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Ping provider to verify credentials and connectivity."""
        pass
