from typing import Optional

try:
    from pydantic import BaseModel
except ImportError:
    class BaseModel:  # type: ignore
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "agent-crash-test-api"


class ReadyResponse(BaseModel):
    status: str
    database: str
    error: Optional[str] = None
