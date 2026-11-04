try:
    from pydantic import BaseModel
except ImportError:
    class BaseModel:  # type: ignore
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)


class VersionResponse(BaseModel):
    name: str
    app_version: str
    api_version: str
