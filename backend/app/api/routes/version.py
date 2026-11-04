try:
    from fastapi import APIRouter
except ImportError:
    class APIRouter:  # type: ignore
        def get(self, *args, **kwargs):
            return lambda fn: fn

from backend.app.schemas.version import VersionResponse
from backend.app.services.health import HealthService

router = APIRouter()


@router.get("/version", response_model=VersionResponse)
def version_info():
    """Return application name, application version, and API version."""
    return HealthService.get_version()
