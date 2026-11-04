from backend.app.db.session import check_db_connectivity
from backend.app.schemas.health import HealthResponse, ReadyResponse
from backend.app.schemas.version import VersionResponse
from backend.app.core.config import settings


class HealthService:
    @staticmethod
    def get_health() -> HealthResponse:
        return HealthResponse(
            status="ok",
            service="agent-crash-test-api"
        )

    @staticmethod
    def get_readiness() -> tuple[ReadyResponse, int]:
        is_db_connected = check_db_connectivity()
        if is_db_connected:
            return ReadyResponse(
                status="ready",
                database="connected"
            ), 200
        else:
            return ReadyResponse(
                status="degraded",
                database="disconnected",
                error="Database connection failed"
            ), 503

    @staticmethod
    def get_version() -> VersionResponse:
        return VersionResponse(
            name=settings.APP_NAME,
            app_version=settings.APP_VERSION,
            api_version=settings.API_VERSION
        )
