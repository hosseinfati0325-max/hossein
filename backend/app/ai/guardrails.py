import re
from typing import Tuple, List

# Common prompt injection, jailbreak, and system extraction patterns
SUSPICIOUS_PATTERNS: List[re.Pattern] = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior)\s+instructions", re.IGNORECASE),
    re.compile(r"disregard\s+(all\s+)?(previous|prior)\s+instructions", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+(an?\s+)?unrestricted", re.IGNORECASE),
    re.compile(r"act\s+as\s+DAN", re.IGNORECASE),
    re.compile(r"jailbreak", re.IGNORECASE),
    re.compile(r"reveal\s+(your\s+)?system\s+prompt", re.IGNORECASE),
    re.compile(r"show\s+me\s+(the\s+)?initial\s+prompt", re.IGNORECASE),
    re.compile(r"repeat\s+the\s+words\s+above", re.IGNORECASE),
    re.compile(r"output\s+initialization\s+text", re.IGNORECASE),
    re.compile(r"bypass\s+safety", re.IGNORECASE),
    re.compile(r"what\s+are\s+your\s+hidden\s+rules", re.IGNORECASE),
    re.compile(r"دستورات\s+قبلی\s+را\s+نادیده\s+بگیر", re.IGNORECASE),
    re.compile(r"پرامپت\s+سیستمی\s+را\s+نشان\s+بده", re.IGNORECASE),
]

def sanitize_user_input(text: str, max_length: int = 2000) -> str:
    """Sanitizes user input by trimming whitespace and bounding length."""
    if not text:
        return ""
    # Normalize excessive whitespaces and control characters
    cleaned = " ".join(text.strip().split())
    return cleaned[:max_length]

def check_prompt_injection(user_input: str) -> Tuple[bool, str]:
    """
    Evaluates whether the user input contains prompt injection,
    jailbreak attempts, or instructions override.
    Returns: (is_safe: bool, sanitized_or_flagged_reason: str)
    """
    if not user_input or not user_input.strip():
        return True, ""

    sanitized = sanitize_user_input(user_input)

    for pattern in SUSPICIOUS_PATTERNS:
        if pattern.search(sanitized):
            return False, f"Potential injection pattern detected: {pattern.pattern}"

    return True, sanitized
