try:
    from fastapi import APIRouter
except ImportError:
    class APIRouter:  # type: ignore
        def get(self, *args, **kwargs):
            return lambda fn: fn

from backend.app.schemas.health import HealthResponse
from backend.app.services.health import HealthService

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check():
    """Basic process health check."""
    return HealthService.get_health()
