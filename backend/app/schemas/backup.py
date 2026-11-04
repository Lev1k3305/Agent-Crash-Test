from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class BackupStatusResponse(BaseModel):
    database_type: str = "SQLite"
    database_path: str
    file_exists: bool
    size_bytes: int
    size_formatted: str
    last_modified: Optional[str] = None
    table_counts: Dict[str, int] = {}


class RestoreRequest(BaseModel):
    confirmation: str = Field(..., description="Must be exactly 'CONFIRM' to allow restore overwrite")
    backup_content_base64: str = Field(..., description="Base64-encoded sqlite database content")


class RestoreResponse(BaseModel):
    success: bool
    message: str
    restored_bytes: int
    table_counts: Dict[str, int] = {}
