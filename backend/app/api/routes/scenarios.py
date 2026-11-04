from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.db.session import get_db
from backend.app.models.scenario import TestScenario
from backend.app.schemas.scenario import (
    ScenarioCreate,
    ScenarioUpdate,
    ScenarioResponse,
    ScenarioListResponse,
)

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.get("", response_model=ScenarioListResponse)
def list_scenarios(
    category: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """List all test scenarios with optional category and search filtering."""
    query = db.query(TestScenario)

    if category and category.lower() != "all":
        query = query.filter(TestScenario.category.ilike(category))

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                TestScenario.name.ilike(pattern),
                TestScenario.code.ilike(pattern),
                TestScenario.description.ilike(pattern),
            )
        )

    if is_active is not None:
        query = query.filter(TestScenario.is_active == is_active)

    total = query.count()
    items = query.order_by(TestScenario.id.asc()).offset(skip).limit(limit).all()

    return ScenarioListResponse(
        items=[ScenarioResponse(**s.to_dict()) for s in items],
        total=total,
    )


@router.post("", response_model=ScenarioResponse, status_code=status.HTTP_201_CREATED)
def create_scenario(payload: ScenarioCreate, db: Session = Depends(get_db)):
    """Create a new persistent test scenario."""
    # Check if code already exists
    existing = db.query(TestScenario).filter(TestScenario.code == payload.code.upper().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Scenario with code '{payload.code}' already exists.",
        )

    scenario = TestScenario(
        code=payload.code.upper().strip(),
        name=payload.name.strip(),
        category=payload.category.strip(),
        risk_level=payload.risk_level.strip(),
        description=payload.description.strip(),
        detailed_threat=payload.detailed_threat.strip() if payload.detailed_threat else None,
        target_workflow=payload.target_workflow.strip() if payload.target_workflow else "E-commerce CRM",
        is_active=payload.is_active,
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)

    return ScenarioResponse(**scenario.to_dict())


@router.get("/{scenario_id}", response_model=ScenarioResponse)
def get_scenario(scenario_id: int, db: Session = Depends(get_db)):
    """Retrieve scenario details by ID."""
    scenario = db.query(TestScenario).filter(TestScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")
    return ScenarioResponse(**scenario.to_dict())


@router.put("/{scenario_id}", response_model=ScenarioResponse)
def update_scenario(scenario_id: int, payload: ScenarioUpdate, db: Session = Depends(get_db)):
    """Update scenario fields."""
    scenario = db.query(TestScenario).filter(TestScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(scenario, field, val)

    db.commit()
    db.refresh(scenario)
    return ScenarioResponse(**scenario.to_dict())


@router.delete("/{scenario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scenario(scenario_id: int, db: Session = Depends(get_db)):
    """Delete a scenario and cascading test runs."""
    scenario = db.query(TestScenario).filter(TestScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")

    db.delete(scenario)
    db.commit()
    return None
