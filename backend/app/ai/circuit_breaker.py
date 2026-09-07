import time
from enum import Enum
from typing import Dict
from app.core.logging import logger

class CircuitState(Enum):
    CLOSED = "CLOSED"      # Healthy, accepting traffic
    OPEN = "OPEN"          # Failing, fast-rejecting traffic
    HALF_OPEN = "HALF_OPEN"# Testing recovery with a single probe

class CircuitBreaker:
    """Per-provider circuit breaker protecting against upstream downtime and cascading failures."""

    def __init__(
        self,
        provider_name: str,
        failure_threshold: int = 3,
        recovery_timeout_seconds: float = 60.0
    ):
        self.provider_name = provider_name
        self.failure_threshold = failure_threshold
        self.recovery_timeout_seconds = recovery_timeout_seconds
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_state_change = time.time()

    def can_attempt(self) -> bool:
        now = time.time()
        if self.state == CircuitState.CLOSED:
            return True
        elif self.state == CircuitState.OPEN:
            if now - self.last_state_change >= self.recovery_timeout_seconds:
                logger.info(
                    "Circuit breaker entering HALF_OPEN probe state",
                    provider=self.provider_name
                )
                self.state = CircuitState.HALF_OPEN
                self.last_state_change = now
                return True
            return False
        elif self.state == CircuitState.HALF_OPEN:
            return True
        return False

    def record_success(self):
        if self.state != CircuitState.CLOSED:
            logger.info(
                "Circuit breaker recovered, entering CLOSED state",
                provider=self.provider_name
            )
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_state_change = time.time()

    def record_failure(self, error: Exception):
        self.failure_count += 1
        now = time.time()
        logger.warn(
            "AI Provider call failed",
            provider=self.provider_name,
            failure_count=self.failure_count,
            error=str(error)
        )
        if self.failure_count >= self.failure_threshold or self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.OPEN
            self.last_state_change = now
            logger.error(
                "Circuit breaker OPENED for provider",
                provider=self.provider_name,
                recovery_timeout=self.recovery_timeout_seconds
            )
