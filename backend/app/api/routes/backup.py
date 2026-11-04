import os
import shutil
import base64
import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.session import get_db, seed_initial_data
from backend.app.models.scenario import TestScenario
from backend.app.models.run import TestRun
from backend.app.models.event import ExecutionEvent
from backend.app.models.report import TestReport
from backend.app.models.setting import ApplicationSetting
from backend.app.schemas.backup import (
    BackupStatusResponse,
    RestoreRequest,
    RestoreResponse,
)

router = APIRouter(prefix="/backup", tags=["backup"])


def format_bytes(size: int) -> str:
    for unit in ["B", "KB", "MB", "GB"]:
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"


@router.get("/status", response_model=BackupStatusResponse)
def get_backup_status(db: Session = Depends(get_db)):
    """Retrieve database storage metrics and table record counts."""
    db_file = settings.db_file_path
    exists = db_file.exists()
    size = db_file.stat().st_size if exists else 0
    mtime = (
        datetime.datetime.fromtimestamp(db_file.stat().st_mtime, tz=datetime.timezone.utc).isoformat()
        if exists
        else None
    )

    table_counts = {
        "test_scenarios": db.query(TestScenario).count(),
        "test_runs": db.query(TestRun).count(),
        "execution_events": db.query(ExecutionEvent).count(),
        "test_reports": db.query(TestReport).count(),
        "application_settings": db.query(ApplicationSetting).count(),
    }

    return BackupStatusResponse(
        database_type="SQLite (Local-First)",
        database_path=str(db_file),
        file_exists=exists,
        size_bytes=size,
        size_formatted=format_bytes(size),
        last_modified=mtime,
        table_counts=table_counts,
    )


@router.get("/export")
def export_backup():
    """Download a point-in-time binary backup copy of the persistent SQLite database."""
    db_file = settings.db_file_path
    if not db_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Database file does not exist on disk.",
        )

    with open(db_file, "rb") as f:
        content = f.read()

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"agent_crash_test_backup_{timestamp}.db"

    return Response(
        content=content,
        media_type="application/x-sqlite3",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        },
    )


@router.post("/restore", response_model=RestoreResponse)
def restore_backup(payload: RestoreRequest, db: Session = Depends(get_db)):
    """
    Restore the persistent SQLite database from a valid backup.
    Requires explicit 'CONFIRM' confirmation to prevent accidental data loss.
    """
    if payload.confirmation != "CONFIRM":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action rejected. Confirmation string must be exactly 'CONFIRM'.",
        )

    try:
        binary_data = base64.b64decode(payload.backup_content_base64)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid base64 payload: {exc}",
        )

    # Validate SQLite magic header: "SQLite format 3\x00"
    if not binary_data.startswith(b"SQLite format 3\x00"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid backup content: Missing SQLite format header.",
        )

    target_file = settings.db_file_path

    # Close existing active connection pool before file replacement
    db.close()
    from backend.app.db.session import engine
    engine.dispose()

    # Create safety snapshot before overwriting
    if target_file.exists():
        safety_copy = target_file.with_suffix(".db.pre_restore_bak")
        shutil.copy2(target_file, safety_copy)

    # Write new database content safely
    temp_target = target_file.with_suffix(".db.tmp")
    with open(temp_target, "wb") as f:
        f.write(binary_data)

    shutil.move(str(temp_target), str(target_file))

    # Also remove any lingering WAL/SHM files to ensure clean state
    wal_file = target_file.with_name(f"{target_file.name}-wal")
    shm_file = target_file.with_name(f"{target_file.name}-shm")
    if wal_file.exists():
        wal_file.unlink()
    if shm_file.exists():
        shm_file.unlink()

    # Reconnect and inspect counts
    from backend.app.db.session import SessionLocal
    new_db = SessionLocal()
    try:
        table_counts = {
            "test_scenarios": new_db.query(TestScenario).count(),
            "test_runs": new_db.query(TestRun).count(),
            "execution_events": new_db.query(ExecutionEvent).count(),
            "test_reports": new_db.query(TestReport).count(),
            "application_settings": new_db.query(ApplicationSetting).count(),
        }
    finally:
        new_db.close()

    return RestoreResponse(
        success=True,
        message="Database successfully restored from validated backup.",
        restored_bytes=len(binary_data),
        table_counts=table_counts,
    )


@router.post("/seed", status_code=status.HTTP_200_OK)
def trigger_seed(db: Session = Depends(get_db)):
    """Seed baseline scenarios and application settings if missing."""
    seed_initial_data(db)
    return {"status": "ok", "message": "Baseline test scenarios verified in persistent database."}
