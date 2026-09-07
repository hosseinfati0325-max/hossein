from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class SystemHealthResponse(BaseModel):
    status: str  # healthy, degraded, unhealthy
    version: str
    database: str
    redis: str
    ai_gateway: str
    uptime_seconds: float
    timestamp: str

class AIProviderStatus(BaseModel):
    name: str
    enabled: bool
    healthy: bool
    priority: int
    consecutive_failures: int
    circuit_open: bool
    total_requests: int
    successful_requests: int
    failed_requests: int
    average_latency_ms: float

class AIUsageStatsResponse(BaseModel):
    total_ai_requests: int
    providers: List[AIProviderStatus]
    task_distribution: Dict[str, int]
    last_updated: str

class UpdateAIProviderConfigRequest(BaseModel):
    provider_name: str
    enabled: Optional[bool] = None
    priority: Optional[int] = None
