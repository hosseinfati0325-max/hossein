"""Pytest configuration and fixtures."""
import pytest
from app.services.srs_service import srs_service
from app.ai.circuit_breaker import CircuitBreaker, CircuitState
from app.ai.gateway import ai_gateway
