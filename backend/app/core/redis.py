import json
from typing import Any, Optional
import redis.asyncio as aioredis
from app.core.config import settings

class RedisManager:
    """Async Redis client wrapper with fallback handling."""
    def __init__(self):
        self._client: Optional[aioredis.Redis] = None

    async def get_client(self) -> aioredis.Redis:
        if self._client is None:
            self._client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                max_connections=50,
            )
        return self._client

    async def get_json(self, key: str) -> Optional[Any]:
        try:
            client = await self.get_client()
            val = await client.get(key)
            return json.loads(val) if val else None
        except Exception:
            return None

    async def set_json(self, key: str, value: Any, expire_seconds: int = 3600) -> bool:
        try:
            client = await self.get_client()
            await client.set(key, json.dumps(value), ex=expire_seconds)
            return True
        except Exception:
            return False

    async def check_rate_limit(self, key: str, limit: int, window_seconds: int = 60) -> bool:
        """Sliding counter rate limiter: returns True if allowed, False if exceeded."""
        try:
            client = await self.get_client()
            current = await client.incr(key)
            if current == 1:
                await client.expire(key, window_seconds)
            return current <= limit
        except Exception:
            # Fail open if Redis is down so service continues
            return True

    async def close(self):
        if self._client:
            await self._client.close()
            self._client = None

redis_manager = RedisManager()
