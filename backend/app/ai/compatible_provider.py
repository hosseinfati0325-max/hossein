import time
import json
from typing import Optional, Dict, Any, List
import httpx
from app.ai.base import AIProvider, NormalizedAIResponse
from app.core.config import settings

class OpenAICompatibleProvider(AIProvider):
    """OpenAI-Compatible Provider (vLLM, Ollama, Groq, local inference, etc.)."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        priority: int = 6
    ):
        selected_model = model or settings.DEFAULT_COMPATIBLE_MODEL
        super().__init__(
            name="openai_compatible",
            priority=priority,
            is_free=True,
            default_model=selected_model,
            free_models=[selected_model],
            rate_limit_rpm=60,
            rate_limit_rpd=10000,
        )
        self.base_url = base_url or settings.OPENAI_COMPATIBLE_BASE_URL
        self.api_key = api_key or settings.OPENAI_COMPATIBLE_API_KEY
        self.model = selected_model
        if not self.base_url:
            self.enabled = False
            self.status = "DISABLED"

    async def health_check(self) -> bool:
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/models", headers=headers)
                return res.status_code in (200, 401, 403)  # Reached endpoint
        except Exception:
            return False

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> NormalizedAIResponse:
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
        sys_prompt = (system_instruction or "") + "\nRespond with valid JSON only."
        res = await self.generate_text(prompt, system_instruction=sys_prompt, temperature=temperature)
        clean = res.raw_text.strip().replace("```json", "").replace("```", "").strip()
        parsed_json = json.loads(clean)
        res.parsed_json = parsed_json
        return res
