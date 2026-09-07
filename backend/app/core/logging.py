import logging
import sys
import structlog
from app.core.config import settings

def filter_sensitive_data(_, __, event_dict):
    """Sanitize passwords, tokens, and API keys from structured log output."""
    sensitive_keys = {
        "password", "hashed_password", "token", "access_token",
        "refresh_token", "api_key", "secret", "authorization"
    }
    for k in list(event_dict.keys()):
        if any(sens in k.lower() for sens in sensitive_keys):
            event_dict[k] = "[REDACTED]"
    return event_dict

def setup_logging():
    """Configure structured logging for production."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            filter_sensitive_data,
            structlog.processors.JSONRenderer()
            if settings.ENVIRONMENT == "production"
            else structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(sys.stdout),
        cache_logger_on_first_use=True,
    )

logger = structlog.get_logger()
