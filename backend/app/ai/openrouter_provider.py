import time
import json
from typing import Optional, Dict, Any, List
import httpx
from app.ai.base import AIProvider, NormalizedAIResponse
from app.core.config import settings
from app.core.logging import logger

class OpenRouterProvider(AIProvider):
    """OpenRouter Provider strictly enforcing verified free-tier models in AI_FREE_MODE."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, priority: int = 3):
        selected_model = model or settings.DEFAULT_OPENROUTER_MODEL
        super().__init__(
            name="openrouter",
            priority=priority,
            is_free=True,
            default_model=selected_model,
            free_models=[
                "deepseek/deepseek-r1:free",
                "deepseek/deepseek-chat:free",
                "meta-llama/llama-3.3-70b-instruct:free",
                "qwen/qwen-2.5-72b-instruct:free",
                "google/gemini-2.0-flash-exp:free",
                "openrouter/free",
            ],
            rate_limit_rpm=20,
            rate_limit_rpd=1000,
        )
        self.api_key = api_key or settings.OPENROUTER_API_KEY
        self.model = selected_model
        self.base_url = "https://openrouter.ai/api/v1"
        if not self.api_key:
            self.enabled = False
            self.status = "DISABLED"

    def get_model_for_task(self, task_name: str, free_only: bool = True) -> str:
        if "exam" in task_name or "analysis" in task_name or "correction" in task_name:
            return "deepseek/deepseek-r1:free"
        return self.default_model

    def validate_free_model(self, model: str) -> str:
        """Enforces that only legitimate free models are selected when AI_FREE_MODE=true."""
        if settings.AI_FREE_MODE:
            if not self.is_model_free(model):
                logger.warn(
                    "Model is not verified free; overriding to default free model",
                    requested_model=model,
                    fallback=self.default_model
                )
                return self.default_model
        return model

    async def health_check(self) -> bool:
        if not self.api_key:
            return False
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/auth/key", headers=headers)
                return res.status_code == 200
        except Exception:
            return False

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> NormalizedAIResponse:
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured")

        effective_model = self.validate_free_model(self.model)
        start_time = time.time()
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://linguapulse.app",
            "X-Title": "LinguaPulse",
        }
        messages: List[Dict[str, str]] = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": effective_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            latency_ms = int((time.time() - start_time) * 1000)

            if res.status_code != 200:
                res.raise_for_status()

            data = res.json()
            raw_text = data["choices"][0]["message"]["content"]
            usage = data.get("usage", {})
            return NormalizedAIResponse(
                raw_text=raw_text,
                provider_name=self.name,
                model_name=effective_model,
                tokens_prompt=usage.get("prompt_tokens", 0),
                tokens_completion=usage.get("completion_tokens", 0),
                latency_ms=latency_ms,
                success=True,
            )

    async def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        schema: Optional[Dict[str, Any]] = None,
        temperature: float = 0.2,
    ) -> NormalizedAIResponse:
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured")

        effective_model = self.validate_free_model(self.model)
        start_time = time.time()
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://linguapulse.app",
            "X-Title": "LinguaPulse",
        }
        messages: List[Dict[str, str]] = []
        sys_prompt = (system_instruction or "") + "\nRespond with valid JSON only. Do not include markdown ticks."
        messages.append({"role": "system", "content": sys_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": effective_model,
            "messages": messages,
            "temperature": temperature,
            "response_format": {"type": "json_object"},
        }

        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            latency_ms = int((time.time() - start_time) * 1000)

            if res.status_code != 200:
                res.raise_for_status()

            data = res.json()
            raw_text = data["choices"][0]["message"]["content"]
            
            parsed_json = None
            try:
                parsed_json = json.loads(raw_text)
            except Exception:
                clean = raw_text.strip().replace("```json", "").replace("```", "").strip()
                parsed_json = json.loads(clean)

            usage = data.get("usage", {})
            return NormalizedAIResponse(
                raw_text=raw_text,
                parsed_json=parsed_json,
                provider_name=self.name,
                model_name=effective_model,
                tokens_prompt=usage.get("prompt_tokens", 0),
                tokens_completion=usage.get("completion_tokens", 0),
                latency_ms=latency_ms,
                success=True,
            )
