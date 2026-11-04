from typing import Optional, List
from pydantic import BaseModel, Field
from backend.app.schemas.event import EventResponse
from backend.app.schemas.report import ReportResponse


class RunBase(BaseModel):
    run_number: str = Field(..., max_length=64, description="Unique run identifier e.g. RUN-0024")
    scenario_id: int
    status: str = Field(default="COMPLETED", max_length=32)
    result: str = Field(default="PASSED", max_length=32)
    risk_score: int = Field(default=0, ge=0, le=100)
    duration_seconds: float = Field(default=0.0, ge=0.0)
    target_system: str = Field(default="E-commerce CRM", max_length=128)
    notes: Optional[str] = None


class RunCreate(BaseModel):
    scenario_id: int
    run_number: Optional[str] = None  # auto-generated if omitted
    status: Optional[str] = "COMPLETED"
    result: Optional[str] = "PASSED"
    risk_score: Optional[int] = 0
    duration_seconds: Optional[float] = 0.0
    target_system: Optional[str] = "E-commerce CRM"
    notes: Optional[str] = None
    create_default_events: Optional[bool] = True
    create_report: Optional[bool] = True


class RunUpdate(BaseModel):
    status: Optional[str] = None
    result: Optional[str] = None
    risk_score: Optional[int] = None
    duration_seconds: Optional[float] = None
    target_system: Optional[str] = None
    notes: Optional[str] = None


class RunResponse(RunBase):
    id: int
    scenario_name: Optional[str] = None
    scenario_code: Optional[str] = None
    events_count: int = 0
    has_report: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class RunDetailResponse(RunResponse):
    events: List[EventResponse] = []
    report: Optional[ReportResponse] = None


class RunListResponse(BaseModel):
    items: List[RunResponse]
    total: int
