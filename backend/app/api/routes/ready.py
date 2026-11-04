try:
    from fastapi import APIRouter, Response, status
except ImportError:
    class APIRouter:  # type: ignore
        def get(self, *args, **kwargs):
            return lambda fn: fn
    class Response:  # type: ignore
        status_code = 200
    class status:  # type: ignore
        HTTP_200_OK = 200
        HTTP_503_SERVICE_UNAVAILABLE = 503

from backend.app.schemas.health import ReadyResponse
from backend.app.services.health import HealthService

router = APIRouter()


@router.get("/ready", response_model=ReadyResponse)
def readiness_check(response: Response):
    """
    Application readiness check.
    Verifies live PostgreSQL database connectivity. Returns 503 if unreachable.
    """
    ready_data, status_code = HealthService.get_readiness()
    response.status_code = status_code
    return ready_data
