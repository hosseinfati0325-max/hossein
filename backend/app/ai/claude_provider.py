import time
import json
from typing import Optional, Dict, Any, List
import httpx
from app.ai.base import AIProvider, NormalizedAIResponse
from app.core.config import settings

class ClaudeProvider(AIProvider):
    """Anthropic Claude Provider disabled by default when AI_FREE_MODE is active."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, priority: int = 8):
        selected_model = model or settings.DEFAULT_CLAUDE_MODEL
        super().__init__(
            name="claude",
            priority=priority,
            is_free=False,
            default_model=selected_model,
            free_models=[],
            rate_limit_rpm=50,
            rate_limit_rpd=5000,
        )
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.model = selected_model
        self.base_url = "https://api.anthropic.com/v1"
        if not self.api_key or settings.AI_FREE_MODE:
            self.enabled = False
            self.status = "DISABLED"

    async def health_check(self) -> bool:
        return bool(self.api_key)

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> NormalizedAIResponse:
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY is not configured")

        start_time = time.time()
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        if system_instruction:
            payload["system"] = system_instruction

        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            res = await client.post(f"{self.base_url}/messages", headers=headers, json=payload)
            latency_ms = int((time.time() - start_time) * 1000)

            if res.status_code != 200:
                res.raise_for_status()

            data = res.json()
            raw_text = data["content"][0]["text"]
            usage = data.get("usage", {})
            return NormalizedAIResponse(
                raw_text=raw_text,
                provider_name=self.name,
                model_name=self.model,
                tokens_prompt=usage.get("input_tokens", 0),
                tokens_completion=usage.get("output_tokens", 0),
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
        sys_prompt = (system_instruction or "") + "\nCRITICAL: Return strictly valid JSON with no markdown wrapping or additional text."
        res = await self.generate_text(prompt, system_instruction=sys_prompt, temperature=temperature)
        clean = res.raw_text.strip().replace("```json", "").replace("```", "").strip()
        parsed_json = json.loads(clean)
        res.parsed_json = parsed_json
        return res
