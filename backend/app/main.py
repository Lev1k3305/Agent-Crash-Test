from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.db.session import init_db
from backend.app.api.routes import (
    health,
    ready,
    version,
    scenarios,
    runs,
    reports,
    settings as settings_route,
    backup,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} ({settings.APP_ENV})")
    logger.info(f"Database target: {settings.DATABASE_URL}")
    logger.info(f"CORS origins configured: {settings.cors_origins_list}")
    
    # Initialize SQLite tables and baseline scenarios without dropping existing data
    try:
        init_db()
        logger.info("Persistent local database initialization verified.")
    except Exception as exc:
        logger.error(f"Failed to initialize database tables: {exc}")

    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Agent Crash Test - AI Agent Reliability & Security Testing Platform API (Local-First Persistence)",
    lifespan=lifespan,
    docs_url="/api/docs" if not settings.is_production else None,
    redoc_url="/api/redoc" if not settings.is_production else None,
    openapi_url="/api/openapi.json" if not settings.is_production else None,
)

# Explicit CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Safe global exception handler preventing stack traces or credential leaks."""
    logger.error(f"Unhandled exception during {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact the administrator."},
    )


# Register API routes under /api
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(ready.router, prefix="/api", tags=["health"])
app.include_router(version.router, prefix="/api", tags=["metadata"])
app.include_router(scenarios.router, prefix="/api", tags=["scenarios"])
app.include_router(runs.router, prefix="/api", tags=["runs"])
app.include_router(reports.router, prefix="/api", tags=["reports"])
app.include_router(settings_route.router, prefix="/api", tags=["settings"])
app.include_router(backup.router, prefix="/api", tags=["backup"])
