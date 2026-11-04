from typing import Optional, List
from pydantic import BaseModel, Field


class ScenarioBase(BaseModel):
    code: str = Field(..., max_length=32, description="Unique code e.g. SEC-01")
    name: str = Field(..., max_length=128)
    category: str = Field(..., max_length=64, description="Security, Business, Reliability")
    risk_level: str = Field(default="Medium", max_length=32, description="Critical, High, Medium, Low")
    description: str
    detailed_threat: Optional[str] = None
    target_workflow: Optional[str] = Field(default="E-commerce CRM")
    is_active: bool = True


class ScenarioCreate(ScenarioBase):
    pass


class ScenarioUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    risk_level: Optional[str] = None
    description: Optional[str] = None
    detailed_threat: Optional[str] = None
    target_workflow: Optional[str] = None
    is_active: Optional[bool] = None


class ScenarioResponse(ScenarioBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    runs_count: int = 0

    class Config:
        from_attributes = True


class ScenarioListResponse(BaseModel):
    items: List[ScenarioResponse]
    total: int
