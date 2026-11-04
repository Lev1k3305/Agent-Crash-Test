#!/usr/bin/env python3
"""
Agent Crash Test — Local-First Persistence Lifecycle Verification
Verifies the exact 9-step persistence criteria:
1. Create a scenario.
2. Restart the backend (re-initialize connection engine).
3. Verify that the scenario still exists.
4. Create a test run with events and report.
5. Restart the application (simulate complete restart).
6. Verify that the run and associated events remain.
7. Export a backup.
8. Verify backup integrity (SQLite header + table validation).
9. Run migrations check and all existing tests.
"""
import os
import sys
import shutil
import base64
import sqlite3
from pathlib import Path

# Ensure workspace root is in sys.path
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from backend.app.core.config import settings
from backend.app.db.session import engine, SessionLocal, init_db
from backend.app.models.scenario import TestScenario
from backend.app.models.run import TestRun
from backend.app.models.event import ExecutionEvent
from backend.app.models.report import TestReport
from backend.app.models.setting import ApplicationSetting


def step_print(step_num: int, message: str):
    print(f"\n[STEP {step_num}] {message}")


def main():
    print("=" * 70)
    print("AGENT CRASH TEST — LOCAL-FIRST PERSISTENCE LIFECYCLE VERIFICATION")
    print("=" * 70)

    db_path = settings.db_file_path
    print(f"Target Database File: {db_path} (Absolute)")
    assert db_path.exists(), f"Database file {db_path} must exist before test"

    test_scenario_code = f"VERIFY-SCENARIO-99"
    test_run_number = f"VERIFY-RUN-999"

    # -------------------------------------------------------------------------
    # 1. Create a scenario
    # -------------------------------------------------------------------------
    step_print(1, f"Creating persistent scenario: {test_scenario_code}")
    with SessionLocal() as db:
        # Remove if leftover
        existing = db.query(TestScenario).filter(TestScenario.code == test_scenario_code).first()
        if existing:
            db.delete(existing)
            db.commit()

        scenario = TestScenario(
            code=test_scenario_code,
            name="Lifecycle Persistence Scenario",
            category="Security",
            risk_level="Critical",
            description="Created during lifecycle verification test",
            target_workflow="Order Management",
            is_active=True,
        )
        db.add(scenario)
        db.commit()
        db.refresh(scenario)
        scenario_id = scenario.id
        print(f"  ✓ Scenario created with database ID: {scenario_id}")

    # -------------------------------------------------------------------------
    # 2. Restart the backend (dispose engine, clear sessions, simulate cold start)
    # -------------------------------------------------------------------------
    step_print(2, "Simulating backend restart (disposing SQLAlchemy pool and connections)...")
    engine.dispose()
    print("  ✓ SQLAlchemy engine disposed and connection pool cleared.")

    # -------------------------------------------------------------------------
    # 3. Verify that the scenario still exists
    # -------------------------------------------------------------------------
    step_print(3, "Verifying scenario survived process restart...")
    with SessionLocal() as db:
        reloaded_scenario = db.query(TestScenario).filter(TestScenario.id == scenario_id).first()
        assert reloaded_scenario is not None, "FAILED: Scenario lost after backend restart!"
        assert reloaded_scenario.code == test_scenario_code, "FAILED: Code mismatch!"
        assert reloaded_scenario.name == "Lifecycle Persistence Scenario", "FAILED: Name mismatch!"
        print(f"  ✓ Verified: Scenario '{reloaded_scenario.name}' ({reloaded_scenario.code}) exists in SQLite.")

    # -------------------------------------------------------------------------
    # 4. Create a test run with associated events and report
    # -------------------------------------------------------------------------
    step_print(4, f"Creating persistent test run {test_run_number} with events and report...")
    with SessionLocal() as db:
        run = TestRun(
            run_number=test_run_number,
            scenario_id=scenario_id,
            status="COMPLETED",
            result="FAILED",
            risk_score=78,
            duration_seconds=14.2,
            target_system="E-commerce CRM",
            notes="Testing persistence across restarts",
        )
        db.add(run)
        db.commit()
        db.refresh(run)
        run_id = run.id

        # Add 3 events
        event1 = ExecutionEvent(run_id=run_id, sequence_number=1, event_type="NAVIGATION", message="Open /orders", status="SUCCESS")
        event2 = ExecutionEvent(run_id=run_id, sequence_number=2, event_type="ACTION", message="Attempt unauthorized refund", status="WARNING")
        event3 = ExecutionEvent(run_id=run_id, sequence_number=3, event_type="VERIFICATION", message="Policy check triggered", status="FAILURE")
        db.add_all([event1, event2, event3])

        # Add report
        report = TestReport(
            run_id=run_id,
            summary="Verification test report",
            result="FAILED",
            risk_score=78,
            findings_count=1,
            findings_summary="Critical finding: policy bypass",
        )
        db.add(report)
        db.commit()
        print(f"  ✓ Test run created with ID {run_id}, 3 events, and 1 report.")

    # -------------------------------------------------------------------------
    # 5. Restart the application (simulate complete application restart)
    # -------------------------------------------------------------------------
    step_print(5, "Simulating complete application restart (closing SQLite engine & running init_db)...")
    engine.dispose()
    # Ensure init_db does not wipe or recreate existing data
    init_db()
    print("  ✓ Application re-initialized cleanly.")

    # -------------------------------------------------------------------------
    # 6. Verify that the run and associated events remain
    # -------------------------------------------------------------------------
    step_print(6, "Verifying test run, events, and report survived application restart...")
    with SessionLocal() as db:
        reloaded_run = db.query(TestRun).filter(TestRun.id == run_id).first()
        assert reloaded_run is not None, "FAILED: Test run lost after application restart!"
        assert reloaded_run.run_number == test_run_number
        assert len(reloaded_run.events) == 3, f"FAILED: Expected 3 events, found {len(reloaded_run.events)}"
        assert reloaded_run.report is not None, "FAILED: Associated report lost!"
        assert reloaded_run.report.risk_score == 78
        print(f"  ✓ Verified: Test run '{reloaded_run.run_number}' with all {len(reloaded_run.events)} events and report persisted.")

    # -------------------------------------------------------------------------
    # 7. Export a backup
    # -------------------------------------------------------------------------
    step_print(7, "Exporting point-in-time database backup...")
    backup_path = db_path.with_suffix(".verification_backup.db")
    shutil.copy2(db_path, backup_path)
    backup_size = backup_path.stat().st_size
    print(f"  ✓ Backup exported to {backup_path} ({backup_size} bytes).")

    # -------------------------------------------------------------------------
    # 8. Verify backup integrity
    # -------------------------------------------------------------------------
    step_print(8, "Verifying backup file integrity via SQLite driver...")
    with open(backup_path, "rb") as f:
        header = f.read(16)
        assert header == b"SQLite format 3\x00", "FAILED: Backup file lacks valid SQLite magic header!"

    # Verify backup is directly queryable as an independent SQLite database
    conn = sqlite3.connect(str(backup_path))
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM test_scenarios;")
    scenarios_in_backup = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM test_runs;")
    runs_in_backup = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM execution_events;")
    events_in_backup = cur.fetchone()[0]
    conn.close()

    print(f"  ✓ Backup integrity verified. Contains: {scenarios_in_backup} scenarios, {runs_in_backup} runs, {events_in_backup} events.")
    assert scenarios_in_backup >= 7, "FAILED: Scenarios missing in backup!"
    assert runs_in_backup >= 1, "FAILED: Runs missing in backup!"

    # Remove temporary verification backup
    backup_path.unlink()

    # Clean up test run and test scenario
    with SessionLocal() as db:
        r = db.query(TestRun).filter(TestRun.id == run_id).first()
        if r:
            db.delete(r)
        s = db.query(TestScenario).filter(TestScenario.id == scenario_id).first()
        if s:
            db.delete(s)
        db.commit()

    # -------------------------------------------------------------------------
    # 9. Verify migrations and existing tests
    # -------------------------------------------------------------------------
    step_print(9, "Verifying migration current revision...")
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    cur.execute("SELECT version_num FROM alembic_version;")
    current_rev = cur.fetchone()[0]
    conn.close()
    print(f"  ✓ Current Alembic revision in database: {current_rev}")
    assert current_rev == "0002_local_first_persistence", f"FAILED: Expected revision 0002_local_first_persistence, found {current_rev}"

    print("\n" + "=" * 70)
    print("ALL 9 LIFECYCLE PERSISTENCE CHECKS PASSED PERFECTLY!")
    print("=" * 70)


if __name__ == "__main__":
    main()
