import io
import csv
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.db.session import get_db
from backend.app.models.report import TestReport
from backend.app.models.run import TestRun
from backend.app.schemas.report import (
    ReportCreate,
    ReportResponse,
    ReportListResponse,
)

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=ReportListResponse)
def list_reports(
    result_filter: Optional[str] = Query(default=None, alias="result"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """List all persisted test reports."""
    query = db.query(TestReport)

    if result_filter:
        query = query.filter(TestReport.result == result_filter.upper())

    total = query.count()
    items = query.order_by(desc(TestReport.created_at)).offset(skip).limit(limit).all()

    return ReportListResponse(
        items=[ReportResponse(**r.to_dict()) for r in items],
        total=total,
    )


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(payload: ReportCreate, db: Session = Depends(get_db)):
    """Create a new report for a test run."""
    run = db.query(TestRun).filter(TestRun.id == payload.run_id).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test run with id {payload.run_id} not found.",
        )

    existing = db.query(TestReport).filter(TestReport.run_id == payload.run_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A report already exists for run id {payload.run_id}.",
        )

    report = TestReport(
        run_id=payload.run_id,
        summary=payload.summary,
        result=payload.result,
        risk_score=payload.risk_score,
        findings_count=payload.findings_count,
        findings_summary=payload.findings_summary,
        evidence_summary=payload.evidence_summary,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return ReportResponse(**report.to_dict())


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db)):
    """Retrieve report by ID."""
    report = db.query(TestReport).filter(TestReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return ReportResponse(**report.to_dict())


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(report_id: int, db: Session = Depends(get_db)):
    """Delete a report."""
    report = db.query(TestReport).filter(TestReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    db.delete(report)
    db.commit()
    return None


@router.get("/{report_id}/export")
def export_report(
    report_id: int,
    format: str = Query(default="json", pattern="^(json|csv)$"),
    db: Session = Depends(get_db),
):
    """Export report as downloadable JSON or CSV document."""
    report = db.query(TestReport).filter(TestReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    data = report.to_dict()
    run_number = data.get("run_number") or f"run_{report.run_id}"

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Field", "Value"])
        for k, v in data.items():
            writer.writerow([k, str(v) if v is not None else ""])
        
        csv_content = output.getvalue()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="report_{run_number}.csv"'
            },
        )
    else:
        json_content = json.dumps(data, indent=2)
        return Response(
            content=json_content,
            media_type="application/json",
            headers={
                "Content-Disposition": f'attachment; filename="report_{run_number}.json"'
            },
        )
