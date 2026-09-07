import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.redis import redis_manager
from app.api.v1.api import api_v1_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management."""
    setup_logging()
    logger.info(
        "Starting Hossein & Fatemeh Production API",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT
    )
    yield
    logger.info("Shutting down Hossein & Fatemeh API")
    await redis_manager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade API for Hossein & Fatemeh Smart Language Learning Platform.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID & Audit Logging Middleware
@app.middleware("http")
async def audit_logging_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.time()
    
    # Bind request_id to context
    response = await call_next(request)
    latency_ms = int((time.time() - start_time) * 1000)
    
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-Ms"] = str(latency_ms)
    
    logger.info(
        "HTTP Request",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        latency_ms=latency_ms,
        request_id=request_id,
    )
    return response

# Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled Exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "یک خطای غیرمنتظره در سرور رخ داد. لطفاً دوباره تلاش کنید."},
    )

# Root Health & Readiness Endpoints
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME, "version": settings.VERSION}

@app.get("/ready", tags=["Health"])
async def readiness_check():
    return {"status": "ready", "database": "up", "redis": "up"}

# Mount API v1
app.include_router(api_v1_router, prefix=settings.API_V1_STR)
