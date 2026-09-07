import pytest
from app.ai.circuit_breaker import CircuitBreaker, CircuitState
from app.ai.gateway import ai_gateway

def test_circuit_breaker_transitions():
    """Verify circuit breaker opens after failure threshold is reached."""
    cb = CircuitBreaker(provider_name="test_provider", failure_threshold=3, recovery_timeout_seconds=2.0)
    assert cb.state == CircuitState.CLOSED
    assert cb.can_attempt() is True

    cb.record_failure(Exception("Network timeout"))
    cb.record_failure(Exception("503 Service Unavailable"))
    assert cb.state == CircuitState.CLOSED

    cb.record_failure(Exception("Connection refused"))
    assert cb.state == CircuitState.OPEN
    assert cb.can_attempt() is False

    cb.record_success()
    assert cb.state == CircuitState.CLOSED

@pytest.mark.asyncio
async def test_ai_gateway_safe_fallback():
    """Verify AI Gateway returns structured pedagogical fallback when all remote providers fail."""
    res = await ai_gateway.execute_with_failover(
        task_name="daily_word",
        is_json=True,
        prompt="Get daily word",
    )
    assert res.success is True
    assert res.parsed_json is not None
    assert "word" in res.parsed_json
    assert "translation_fa" in res.parsed_json
