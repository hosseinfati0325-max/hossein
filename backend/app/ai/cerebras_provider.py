import time
import json
from typing import Optional, Dict, Any, List
import httpx
from app.ai.base import AIProvider, NormalizedAIResponse
from app.core.config import settings
from app.core.logging import logger

class CerebrasProvider(AIProvider):
    """Cerebras Provider providing ultra-fast inference via free/trial tier."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, priority: int = 4):
        selected_model = model or settings.DEFAULT_CEREBRAS_MODEL
        super().__init__(
            name="cerebras",
            priority=priority,
            is_free=True,
            default_model=selected_model,
            free_models=["llama3.1-8b", "llama3.1-70b"],
            rate_limit_rpm=30,
            rate_limit_rpd=14400,
        )
        self.api_key = api_key or settings.CEREBRAS_API_KEY
        self.model = selected_model
        self.base_url = "https://api.cerebras.ai/v1"
        if not self.api_key:
            self.enabled = False
            self.status = "DISABLED"

    async def health_check(self) -> bool:
        if not self.api_key:
            return False
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/models", headers=headers)
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
            raise ValueError("CEREBRAS_API_KEY is not configured")

        start_time = time.time()
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        messages: List[Dict[str, str]] = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
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
                model_name=self.model,
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
            raise ValueError("CEREBRAS_API_KEY is not configured")

        start_time = time.time()
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        messages: List[Dict[str, str]] = []
        sys_prompt = (system_instruction or "") + "\nRespond with valid raw JSON only."
        messages.append({"role": "system", "content": sys_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
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
                model_name=self.model,
                tokens_prompt=usage.get("prompt_tokens", 0),
                tokens_completion=usage.get("completion_tokens", 0),
                latency_ms=latency_ms,
                success=True,
            )
