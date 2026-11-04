from typing import Optional, List
from pydantic import BaseModel, Field


class SettingBase(BaseModel):
    key: str = Field(..., max_length=128)
    value: str
    description: Optional[str] = None
    is_secret: bool = False


class SettingCreate(SettingBase):
    pass


class SettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None
    is_secret: Optional[bool] = None


class SettingResponse(SettingBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class SettingListResponse(BaseModel):
    items: List[SettingResponse]
    total: int
