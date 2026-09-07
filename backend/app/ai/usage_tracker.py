import time
from typing import Dict, Any, List
from collections import defaultdict

class AIUsageTracker:
    """Tracks provider latencies, success/failure counts, and task distribution."""

    def __init__(self):
        self.stats: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_latency_ms": 0,
            "average_latency_ms": 0.0,
            "estimated_tokens": 0,
        })
        self.task_distribution: Dict[str, int] = defaultdict(int)

    def record_request(
        self,
        provider: str,
        task: str,
        latency_ms: int,
        success: bool,
        tokens_prompt: int = 0,
        tokens_completion: int = 0,
    ):
        p_stat = self.stats[provider]
        p_stat["total_requests"] += 1
        if success:
            p_stat["successful_requests"] += 1
        else:
            p_stat["failed_requests"] += 1
        p_stat["total_latency_ms"] += latency_ms
        p_stat["average_latency_ms"] = (
            p_stat["total_latency_ms"] / p_stat["total_requests"]
        )
        p_stat["estimated_tokens"] += (tokens_prompt + tokens_completion)
        self.task_distribution[task] += 1

    def get_summary(self) -> Dict[str, Any]:
        return {
            "providers": dict(self.stats),
            "task_distribution": dict(self.task_distribution),
        }

usage_tracker = AIUsageTracker()
