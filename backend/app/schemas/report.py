from typing import Optional, List
from pydantic import BaseModel, Field


class ReportBase(BaseModel):
    summary: str
    result: str = Field(..., max_length=32, description="PASSED, FAILED, CRITICAL_FAILURE")
    risk_score: int = Field(default=0, ge=0, le=100)
    findings_count: int = Field(default=0, ge=0)
    findings_summary: Optional[str] = None
    evidence_summary: Optional[str] = None


class ReportCreate(ReportBase):
    run_id: int


class ReportResponse(ReportBase):
    id: int
    run_id: int
    run_number: Optional[str] = None
    scenario_name: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    items: List[ReportResponse]
    total: int
