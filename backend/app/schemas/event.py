from typing import Optional, List
from pydantic import BaseModel, Field


class EventBase(BaseModel):
    sequence_number: int = Field(default=1)
    event_type: str = Field(..., max_length=64)
    message: str = Field(..., max_length=256)
    details: Optional[str] = None
    status: str = Field(default="SUCCESS", max_length=32)


class EventCreate(EventBase):
    run_id: Optional[int] = None


class EventResponse(EventBase):
    id: int
    run_id: int
    timestamp: Optional[str] = None

    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    items: List[EventResponse]
    total: int
