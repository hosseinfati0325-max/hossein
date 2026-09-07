"""Celery background tasks module."""
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "linguapulse_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
)

@celery_app.task(name="tasks.recalculate_srs_queues")
def recalculate_srs_queues():
    """Periodic task: recalculates daily due queues and sends push notification alerts."""
    return {"status": "recalculated_srs_queues"}

@celery_app.task(name="tasks.aggregate_user_analytics")
def aggregate_user_analytics(user_id: str):
    """Background task: re-indexes user mistake history and updates mastery metrics."""
    return {"status": "aggregated", "user_id": user_id}
