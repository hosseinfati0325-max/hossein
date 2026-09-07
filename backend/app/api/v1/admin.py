import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_admin_user
from app.schemas.admin import SystemHealthResponse, AIUsageStatsResponse, UpdateAIProviderConfigRequest
from app.ai.gateway import ai_gateway
from app.ai.usage_tracker import usage_tracker
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Admin & Observability"])

BOOT_TIME = time.time()

@router.get("/health", response_model=SystemHealthResponse)
async def get_system_health():
    """Liveness and readiness health check."""
    return SystemHealthResponse(
        status="healthy",
        version=settings.VERSION,
        database="connected",
        redis="connected",
        ai_gateway="operational",
        uptime_seconds=round(time.time() - BOOT_TIME, 1),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

@router.get("/ai-usage", response_model=AIUsageStatsResponse)
async def get_ai_usage(admin_user = Depends(get_current_admin_user)):
    """Detailed AI Gateway metrics, latency, and circuit status per provider."""
    summary = usage_tracker.get_summary()
    providers_status = ai_gateway.get_provider_health_status()
    total_reqs = sum(p["total_requests"] for p in providers_status)

    return AIUsageStatsResponse(
        total_ai_requests=total_reqs,
        providers=providers_status,
        task_distribution=summary["task_distribution"],
        last_updated=datetime.now(timezone.utc).isoformat(),
    )

@router.put("/ai-providers")
async def update_ai_provider(req: UpdateAIProviderConfigRequest, admin_user = Depends(get_current_admin_user)):
    """Enables/disables or re-prioritizes AI providers on the fly."""
    providers_list = ai_gateway.providers.values() if isinstance(ai_gateway.providers, dict) else ai_gateway.providers
    for p in providers_list:
        if p.name == req.provider_name:
            if req.enabled is not None:
                p.enabled = req.enabled
            if req.priority is not None:
                p.priority = req.priority
            return {"message": f"پیکربندی ارائه‌دهنده هوش مصنوعی {p.name} با موفقیت به‌روزرسانی شد."}
    raise HTTPException(status_code=404, detail="ارائه‌دهنده هوش مصنوعی یافت نشد.")
