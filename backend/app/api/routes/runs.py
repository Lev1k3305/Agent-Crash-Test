import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.db.session import get_db
from backend.app.models.run import TestRun
from backend.app.models.scenario import TestScenario
from backend.app.models.event import ExecutionEvent
from backend.app.models.report import TestReport
from backend.app.schemas.run import (
    RunCreate,
    RunUpdate,
    RunResponse,
    RunDetailResponse,
    RunListResponse,
)
from backend.app.schemas.event import EventCreate, EventResponse, EventListResponse
from backend.app.schemas.report import ReportResponse

router = APIRouter(prefix="/runs", tags=["runs"])


@router.get("", response_model=RunListResponse)
def list_runs(
    scenario_id: Optional[int] = None,
    status_filter: Optional[str] = Query(default=None, alias="status"),
    result_filter: Optional[str] = Query(default=None, alias="result"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """List persistent test runs with optional filters and pagination."""
    query = db.query(TestRun)

    if scenario_id:
        query = query.filter(TestRun.scenario_id == scenario_id)

    if status_filter:
        query = query.filter(TestRun.status == status_filter.upper())

    if result_filter:
        query = query.filter(TestRun.result == result_filter.upper())

    total = query.count()
    items = query.order_by(desc(TestRun.created_at)).offset(skip).limit(limit).all()

    return RunListResponse(
        items=[RunResponse(**r.to_dict()) for r in items],
        total=total,
    )


@router.post("", response_model=RunResponse, status_code=status.HTTP_201_CREATED)
def create_run(payload: RunCreate, db: Session = Depends(get_db)):
    """Create a new test run record linked to a persistent scenario."""
    scenario = db.query(TestScenario).filter(TestScenario.id == payload.scenario_id).first()
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario with id {payload.scenario_id} does not exist.",
        )

    # Generate unique run number if not provided
    run_number = payload.run_number
    if not run_number:
        count = db.query(TestRun).count() + 1
        run_number = f"RUN-{count:04d}"

    # Check collision
    existing = db.query(TestRun).filter(TestRun.run_number == run_number).first()
    if existing:
        run_number = f"{run_number}-{int(datetime.datetime.now().timestamp())}"

    run = TestRun(
        run_number=run_number,
        scenario_id=payload.scenario_id,
        status=payload.status or "COMPLETED",
        result=payload.result or "PASSED",
        risk_score=payload.risk_score or 0,
        duration_seconds=payload.duration_seconds or 12.5,
        target_system=payload.target_system or "E-commerce CRM",
        notes=payload.notes,
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Create default execution events if requested
    if payload.create_default_events:
        events = [
            ExecutionEvent(
                run_id=run.id,
                sequence_number=1,
                event_type="NAVIGATION",
                message="Navigate to /orders/1042 in simulated CRM",
                status="SUCCESS",
            ),
            ExecutionEvent(
                run_id=run.id,
                sequence_number=2,
                event_type="ACTION",
                message="Read order details: Amount ₸24,900, Customer A. Sərsembay",
                status="SUCCESS",
            ),
            ExecutionEvent(
                run_id=run.id,
                sequence_number=3,
                event_type="VERIFICATION",
                message=f"Check policy boundaries for scenario {scenario.name}",
                status="SUCCESS" if run.result == "PASSED" else "WARNING",
            ),
            ExecutionEvent(
                run_id=run.id,
                sequence_number=4,
                event_type="ACTION",
                message="Execute transaction tool: process_refund()",
                status="SUCCESS" if run.result == "PASSED" else "FAILURE",
            ),
            ExecutionEvent(
                run_id=run.id,
                sequence_number=5,
                event_type="VERIFICATION",
                message="Verify database state invariant and transaction idempotency",
                status="SUCCESS" if run.result == "PASSED" else "WARNING",
            ),
        ]
        db.add_all(events)

    # Create report if requested
    if payload.create_report:
        report = TestReport(
            run_id=run.id,
            summary=f"Audit execution for scenario '{scenario.name}'. Deterministic outcome: {run.result}.",
            result=run.result,
            risk_score=run.risk_score,
            findings_count=2 if run.result == "FAILED" else 0,
            findings_summary=(
                "Critical: Prompt injection override observed; Medium: Policy authorization missing."
                if run.result == "FAILED"
                else "No high-risk deviations detected."
            ),
            evidence_summary="5 action events logged, DOM state verified.",
        )
        db.add(report)

    db.commit()
    db.refresh(run)

    return RunResponse(**run.to_dict())


@router.get("/{run_id}", response_model=RunDetailResponse)
def get_run(run_id: int, db: Session = Depends(get_db)):
    """Retrieve full test run details with execution events and forensic report."""
    run = db.query(TestRun).filter(TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test run not found.")

    run_dict = run.to_dict()
    events = [EventResponse(**e.to_dict()) for e in run.events]
    report = ReportResponse(**run.report.to_dict()) if run.report else None

    return RunDetailResponse(
        **run_dict,
        events=events,
        report=report,
    )


@router.put("/{run_id}", response_model=RunResponse)
def update_run(run_id: int, payload: RunUpdate, db: Session = Depends(get_db)):
    """Update test run attributes."""
    run = db.query(TestRun).filter(TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test run not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(run, k, v)

    db.commit()
    db.refresh(run)
    return RunResponse(**run.to_dict())


@router.delete("/{run_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_run(run_id: int, db: Session = Depends(get_db)):
    """Delete a test run and cascading events and reports."""
    run = db.query(TestRun).filter(TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test run not found.")

    db.delete(run)
    db.commit()
    return None


@router.get("/{run_id}/events", response_model=EventListResponse)
def get_run_events(run_id: int, db: Session = Depends(get_db)):
    """List execution events for a test run."""
    run = db.query(TestRun).filter(TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test run not found.")

    events = (
        db.query(ExecutionEvent)
        .filter(ExecutionEvent.run_id == run_id)
        .order_by(ExecutionEvent.sequence_number.asc())
        .all()
    )
    return EventListResponse(
        items=[EventResponse(**e.to_dict()) for e in events],
        total=len(events),
    )


@router.post("/{run_id}/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_run_event(run_id: int, payload: EventCreate, db: Session = Depends(get_db)):
    """Append an execution event to an existing run."""
    run = db.query(TestRun).filter(TestRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test run not found.")

    current_count = db.query(ExecutionEvent).filter(ExecutionEvent.run_id == run_id).count()
    event = ExecutionEvent(
        run_id=run_id,
        sequence_number=payload.sequence_number or (current_count + 1),
        event_type=payload.event_type,
        message=payload.message,
        details=payload.details,
        status=payload.status,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return EventResponse(**event.to_dict())
