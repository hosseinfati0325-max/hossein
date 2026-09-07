import time
import json
from typing import Optional, Dict, Any
import httpx
from app.ai.base import AIProvider, NormalizedAIResponse
from app.core.config import settings
from app.core.logging import logger

class GeminiProvider(AIProvider):
    """Google Gemini AI Provider with structured generation support and official free tier."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, priority: int = 1):
        selected_model = model or settings.DEFAULT_GEMINI_MODEL
        super().__init__(
            name="gemini",
            priority=priority,
            is_free=True,
            default_model=selected_model,
            free_models=["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"],
            rate_limit_rpm=15,
            rate_limit_rpd=1500,
        )
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = selected_model
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        if not self.api_key:
            self.enabled = False
            self.status = "DISABLED"

    async def health_check(self) -> bool:
        if not self.api_key:
            return False
        try:
            url = f"{self.base_url}/models/{self.model}?key={self.api_key}"
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url)
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
            raise ValueError("GEMINI_API_KEY is not configured")

        start_time = time.time()
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"

        payload: Dict[str, Any] = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            }
        }
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            res = await client.post(url, json=payload)
            latency_ms = int((time.time() - start_time) * 1000)

            if res.status_code != 200:
                res.raise_for_status()

            data = res.json()
            candidates = data.get("candidates", [])
            raw_text = ""
            if candidates and "content" in candidates[0]:
                parts = candidates[0]["content"].get("parts", [])
                if parts:
                    raw_text = parts[0].get("text", "")

            usage = data.get("usageMetadata", {})
            return NormalizedAIResponse(
                raw_text=raw_text,
                provider_name=self.name,
                model_name=self.model,
                tokens_prompt=usage.get("promptTokenCount", 0),
                tokens_completion=usage.get("candidatesTokenCount", 0),
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
            raise ValueError("GEMINI_API_KEY is not configured")

        start_time = time.time()
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"

        payload: Dict[str, Any] = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "responseMimeType": "application/json",
            }
        }
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            res = await client.post(url, json=payload)
            latency_ms = int((time.time() - start_time) * 1000)

            if res.status_code != 200:
                res.raise_for_status()

            data = res.json()
            raw_text = ""
            candidates = data.get("candidates", [])
            if candidates and "content" in candidates[0]:
                parts = candidates[0]["content"].get("parts", [])
                if parts:
                    raw_text = parts[0].get("text", "")

            parsed_json = None
            try:
                parsed_json = json.loads(raw_text)
            except Exception:
                # Strip markdown fences if present
                clean = raw_text.strip().replace("```json", "").replace("```", "").strip()
                parsed_json = json.loads(clean)

            usage = data.get("usageMetadata", {})
            return NormalizedAIResponse(
                raw_text=raw_text,
                parsed_json=parsed_json,
                provider_name=self.name,
                model_name=self.model,
                tokens_prompt=usage.get("promptTokenCount", 0),
                tokens_completion=usage.get("candidatesTokenCount", 0),
                latency_ms=latency_ms,
                success=True,
            )
