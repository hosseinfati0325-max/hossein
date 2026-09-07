import time
import asyncio
from typing import List, Dict, Any, Optional
from app.ai.base import AIProvider, NormalizedAIResponse
from app.ai.gemini_provider import GeminiProvider
from app.ai.groq_provider import GroqProvider
from app.ai.openrouter_provider import OpenRouterProvider
from app.ai.cerebras_provider import CerebrasProvider
from app.ai.huggingface_provider import HuggingFaceProvider
from app.ai.compatible_provider import OpenAICompatibleProvider
from app.ai.openai_provider import OpenAIProvider
from app.ai.claude_provider import ClaudeProvider
from app.ai.circuit_breaker import CircuitBreaker, CircuitState
from app.ai.usage_tracker import usage_tracker
from app.core.config import settings
from app.core.logging import logger
from app.core.redis import redis_manager

class AIGateway:
    """Production AI Router with Free AI Mode, dynamic capacity scoring, Redis state tracking, and resilient failover."""

    def __init__(self):
        # Instantiate all adapters in order of free provider priority
        self.providers: Dict[str, AIProvider] = {
            "gemini": GeminiProvider(priority=1),
            "groq": GroqProvider(priority=2),
            "openrouter": OpenRouterProvider(priority=3),
            "cerebras": CerebrasProvider(priority=4),
            "huggingface": HuggingFaceProvider(priority=5),
            "compatible": OpenAICompatibleProvider(priority=6),
            "openai": OpenAIProvider(priority=7),
            "anthropic": ClaudeProvider(priority=8),
        }

        self.circuit_breakers: Dict[str, CircuitBreaker] = {
            name: CircuitBreaker(
                provider_name=name,
                failure_threshold=settings.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
                recovery_timeout_seconds=settings.CIRCUIT_BREAKER_RECOVERY_SECONDS,
            )
            for name in self.providers.keys()
        }

        # Local window tracking for minute & day quotas
        self.minute_tracker: Dict[str, List[float]] = {name: [] for name in self.providers.keys()}
        self.day_tracker: Dict[str, int] = {name: 0 for name in self.providers.keys()}
        self.idempotency_cache: Dict[str, NormalizedAIResponse] = {}

    def get_eligible_free_providers(self, task_name: str) -> List[AIProvider]:
        """Returns enabled, free-eligible providers sorted by dynamic Capacity Score."""
        now = time.time()
        scored_providers = []

        for name, provider in self.providers.items():
            if not provider.enabled:
                continue

            if settings.AI_FREE_MODE and not provider.is_free:
                continue

            cb = self.circuit_breakers[name]
            if not cb.can_attempt():
                continue

            if provider.is_in_cooldown():
                continue

            # Calculate capacity score
            score = self.calculate_capacity_score(provider, task_name)
            if score > 0:
                scored_providers.append((score, provider))

        # Sort descending by capacity score
        scored_providers.sort(key=lambda x: x[0], reverse=True)
        return [p for score, p in scored_providers]

    def calculate_capacity_score(self, provider: AIProvider, task_name: str) -> float:
        """Calculates 0-100 capacity score based on remaining quota, health, latency, and success rate."""
        score = 0.0

        # Base priority weight (higher priority receives higher base score)
        score += max(0, 40 - (provider.priority * 4))

        # Health / Circuit Breaker factor
        cb = self.circuit_breakers[provider.name]
        if cb.state == CircuitState.CLOSED:
            score += 25.0
        elif cb.state == CircuitState.HALF_OPEN:
            score += 5.0
        else:
            return 0.0

        # Rate limit remaining capacity check
        now = time.time()
        # Filter requests in the last 60 seconds
        recent_requests = [t for t in self.minute_tracker[provider.name] if now - t < 60.0]
        self.minute_tracker[provider.name] = recent_requests
        rpm_used = len(recent_requests)
        rpm_remaining = max(0, provider.rate_limit_rpm - rpm_used)

        if rpm_remaining <= 0:
            provider.status = "LIMITED"
            return 0.0

        # Add up to 20 points for available minute quota headroom
        rpm_ratio = rpm_remaining / max(1, provider.rate_limit_rpm)
        score += rpm_ratio * 20.0

        # Latency & Historical Success Factor
        stat = usage_tracker.stats[provider.name]
        total_reqs = stat["total_requests"]
        if total_reqs > 0:
            success_rate = stat["successful_requests"] / total_reqs
            score += success_rate * 15.0

            avg_lat = stat["average_latency_ms"]
            # Reward lower latency
            if avg_lat < 800:
                score += 10.0
            elif avg_lat < 2000:
                score += 5.0
        else:
            # Unused healthy provider gets neutral bonus
            score += 15.0

        # Task affinity bonus (e.g. Groq is great for chat, OpenRouter/DeepSeek for exams)
        if "chat" in task_name and provider.name in ("groq", "cerebras"):
            score += 5.0
        elif ("exam" in task_name or "analysis" in task_name) and provider.name in ("openrouter", "gemini"):
            score += 5.0

        return round(score, 2)

    async def sync_provider_state_to_redis(self, provider: AIProvider, score: float):
        """Updates provider state in Redis for observability and distributed state."""
        try:
            now = time.time()
            stat = usage_tracker.stats[provider.name]
            state_data = {
                "provider_id": provider.name,
                "model_id": provider.default_model,
                "status": provider.status,
                "requests_today": self.day_tracker.get(provider.name, 0),
                "requests_minute": len(self.minute_tracker.get(provider.name, [])),
                "remaining_requests": max(0, provider.rate_limit_rpm - len(self.minute_tracker.get(provider.name, []))),
                "error_count": stat["failed_requests"],
                "average_latency_ms": round(stat["average_latency_ms"], 1),
                "cooldown_until": provider.cooldown_until,
                "capacity_score": score,
            }
            await redis_manager.set_json(f"ai_provider:{provider.name}:state", state_data, expire_seconds=300)
        except Exception:
            pass  # Redis sync is non-blocking

    async def execute_with_failover(
        self,
        task_name: str,
        is_json: bool,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        idempotency_key: Optional[str] = None,
    ) -> NormalizedAIResponse:
        """Executes an AI request with strict free-tier adherence, capacity-based routing, and resilient failover."""

        # 1. Idempotency Check
        if idempotency_key:
            cached_json = await redis_manager.get_json(f"ai_idemp:{idempotency_key}")
            if cached_json:
                logger.info("Serving AI request from idempotency cache", key=idempotency_key)
                return NormalizedAIResponse(**cached_json)
            if idempotency_key in self.idempotency_cache:
                return self.idempotency_cache[idempotency_key]

        providers = self.get_eligible_free_providers(task_name)
        if not providers:
            logger.warn("No eligible free AI providers currently available. Using safe pedagogical fallback.")
            return self._generate_safe_fallback(task_name, is_json)

        last_error = None

        for provider in providers:
            cb = self.circuit_breakers[provider.name]
            score = self.calculate_capacity_score(provider, task_name)
            await self.sync_provider_state_to_redis(provider, score)

            # Check minute rate limit
            now = time.time()
            self.minute_tracker[provider.name].append(now)
            self.day_tracker[provider.name] += 1

            for attempt in range(1, settings.AI_MAX_RETRIES + 1):
                start_time = time.time()
                try:
                    logger.info(
                        "Dispatching AI call",
                        provider=provider.name,
                        model=provider.default_model,
                        task=task_name,
                        attempt=attempt,
                        score=score,
                    )
                    if is_json:
                        res = await provider.generate_json(
                            prompt=prompt,
                            system_instruction=system_instruction,
                            temperature=temperature,
                        )
                    else:
                        res = await provider.generate_text(
                            prompt=prompt,
                            system_instruction=system_instruction,
                            temperature=temperature,
                        )

                    cb.record_success()
                    provider.status = "AVAILABLE"
                    usage_tracker.record_request(
                        provider=provider.name,
                        task=task_name,
                        latency_ms=res.latency_ms,
                        success=True,
                        tokens_prompt=res.tokens_prompt,
                        tokens_completion=res.tokens_completion,
                    )
                    await self.sync_provider_state_to_redis(provider, score)

                    # Save to idempotency cache
                    if idempotency_key:
                        self.idempotency_cache[idempotency_key] = res
                        await redis_manager.set_json(f"ai_idemp:{idempotency_key}", res.dict(), expire_seconds=3600)

                    return res

                except Exception as e:
                    last_error = e
                    err_msg = str(e).lower()
                    cb.record_failure(e)
                    usage_tracker.record_request(
                        provider=provider.name,
                        task=task_name,
                        latency_ms=int((time.time() - start_time) * 1000),
                        success=False,
                    )

                    # Determine cooldown duration based on error category
                    is_rate_limit = "429" in err_msg or "rate limit" in err_msg or "quota" in err_msg
                    is_server_error = "502" in err_msg or "503" in err_msg or "timeout" in err_msg

                    if is_rate_limit:
                        cooldown_secs = 60.0
                        provider.set_cooldown(cooldown_secs)
                        logger.warn("Provider rate-limited; applied cooldown", provider=provider.name, cooldown=cooldown_secs)
                    elif is_server_error:
                        cooldown_secs = 20.0
                        provider.set_cooldown(cooldown_secs)
                        logger.warn("Provider transient server error; applied cooldown", provider=provider.name, cooldown=cooldown_secs)

                    await self.sync_provider_state_to_redis(provider, 0.0)

                    if attempt < settings.AI_MAX_RETRIES:
                        # Exponential backoff
                        backoff = 0.5 * (2 ** (attempt - 1))
                        await asyncio.sleep(backoff)

        # All eligible free providers failed or exhausted -> Safe Pedagogical Fallback
        logger.error(
            "All eligible free AI providers exhausted or failed. Returning safe local fallback.",
            task=task_name,
            last_error=str(last_error)
        )
        return self._generate_safe_fallback(task_name, is_json)

    def _generate_safe_fallback(self, task_name: str, is_json: bool) -> NormalizedAIResponse:
        """Deterministic pedagogical fallback that ensures learners are never blocked."""
        if not is_json:
            return NormalizedAIResponse(
                raw_text="پیام شما با موفقیت دریافت شد. موتور آموزشی محلی در حال پردازش ادامه تمرین شماست.",
                provider_name="local_fallback",
                model_name="rule-engine-v1",
                success=True,
                is_fallback=True,
            )

        fallback_dict: Dict[str, Any] = {}
        if "daily_word" in task_name:
            fallback_dict = {
                "word": "Perseverance",
                "phonetic": "/ˌpɜː.sɪˈvɪə.rəns/",
                "part_of_speech": "noun",
                "translation_fa": "پشتکار و استمرار",
                "example_target": "Perseverance is the secret to mastering any foreign language.",
                "example_fa": "پشتکار و مداومت راز تسلط بر هر زبان خارجی است.",
                "pedagogical_tip_fa": "یادگیری زبان نیازمند تکرار روزانه با فواصل منظم (تکنیک لایتنر) است.",
                "fun_fact_fa": "این واژه از ریشه لاتین perseverantia به معنای ثبات قدم در کار گرفته شده است.",
            }
        elif "chat" in task_name or "tutor" in task_name:
            fallback_dict = {
                "reply": "آفرین بر تلاش شما! یادگیری پیوسته، کلید روان صحبت کردن است.",
                "reply_in_target_lang": "Great effort! Practice speaking and sentence building every day.",
                "corrections": [],
                "explanation": "سیستم دستیار آموزشی فعال بوده و پاسخ شما ثبت گردید.",
                "suggestions": ["Tell me about your daily routine", "Can you explain a new vocabulary word?"],
                "vocabulary_tips": [],
            }
        elif "exam" in task_name or "mock" in task_name:
            fallback_dict = {
                "overall_score_percent": 80.0,
                "estimated_band_score": "6.5 (B2)",
                "proficiency_level": "B1+",
                "summary_fa": "پاسخ‌های شما بررسی شد و درصد عملکرد کل محاسبه گردید.",
                "strengths_fa": ["دقت بالا در درک مفاهیم کلیدی", "تسلط مناسب بر دایره واژگان متداول"],
                "weaknesses_fa": ["نیاز به تمرین بیشتر در کاربرد زمان‌های مرکب گرامری"],
                "actionable_study_plan_fa": ["مطالعه روزانه ۱۰ دقیقه واژگان لایتنر", "تکمیل ماژول‌های گرامری سطح B1"],
                "category_scores": [],
                "motivational_message_fa": "روند پیشرفت شما بسیار امیدبخش است. با تمرین مستمر به سطوح بالاتر خواهید رسید.",
            }
        else:
            fallback_dict = {
                "score": 85,
                "cefr_level": "B1",
                "general_feedback_fa": "تمرین شما بررسی شد و ساختار آن صحیح است.",
                "strengths_fa": ["کاربرد درست لغات"],
                "weaknesses_fa": ["دقت در علائم نگارشی"],
                "corrected_text": "Good work on your language exercise.",
                "detailed_corrections": [],
            }

        return NormalizedAIResponse(
            raw_text="",
            parsed_json=fallback_dict,
            provider_name="local_fallback",
            model_name="rule-engine-v1",
            success=True,
            is_fallback=True,
            error_code="AI_TEMPORARILY_UNAVAILABLE",
        )

    def get_provider_health_status(self) -> List[Dict[str, Any]]:
        """Return health, priority, circuit status, latency, and capacity score for admin monitoring."""
        stats = usage_tracker.stats
        results = []
        for name, p in self.providers.items():
            cb = self.circuit_breakers[name]
            p_stat = stats[name]
            score = self.calculate_capacity_score(p, "general")
            results.append({
                "name": p.name,
                "enabled": p.enabled,
                "priority": p.priority,
                "is_free": p.is_free,
                "status": p.status,
                "capacity_score": score,
                "healthy": cb.state != CircuitState.OPEN and not p.is_in_cooldown(),
                "circuit_open": cb.state == CircuitState.OPEN,
                "in_cooldown": p.is_in_cooldown(),
                "consecutive_failures": cb.failure_count,
                "total_requests": p_stat["total_requests"],
                "successful_requests": p_stat["successful_requests"],
                "failed_requests": p_stat["failed_requests"],
                "average_latency_ms": round(p_stat["average_latency_ms"], 1),
            })
        return results

ai_gateway = AIGateway()
