"""Local-first persistence models (TestScenario, TestRun, ExecutionEvent, TestReport, ApplicationSetting)

Revision ID: 0002_local_first_persistence
Revises: 0001_initial_foundation
Create Date: 2026-11-04 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002_local_first_persistence"
down_revision: Union[str, None] = "0001_initial_foundation"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Test Scenarios Table
    op.create_table(
        "test_scenarios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("risk_level", sa.String(length=32), nullable=False, server_default="Medium"),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("detailed_threat", sa.Text(), nullable=True),
        sa.Column("target_workflow", sa.String(length=128), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code")
    )
    op.create_index(op.f("ix_test_scenarios_id"), "test_scenarios", ["id"], unique=False)
    op.create_index(op.f("ix_test_scenarios_code"), "test_scenarios", ["code"], unique=True)
    op.create_index(op.f("ix_test_scenarios_category"), "test_scenarios", ["category"], unique=False)

    # 2. Test Runs Table
    op.create_table(
        "test_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("run_number", sa.String(length=64), nullable=False),
        sa.Column("scenario_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="COMPLETED"),
        sa.Column("result", sa.String(length=32), nullable=False, server_default="PASSED"),
        sa.Column("risk_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("duration_seconds", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("target_system", sa.String(length=128), nullable=False, server_default="E-commerce CRM"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["scenario_id"], ["test_scenarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("run_number")
    )
    op.create_index(op.f("ix_test_runs_id"), "test_runs", ["id"], unique=False)
    op.create_index(op.f("ix_test_runs_run_number"), "test_runs", ["run_number"], unique=True)
    op.create_index(op.f("ix_test_runs_scenario_id"), "test_runs", ["scenario_id"], unique=False)
    op.create_index(op.f("ix_test_runs_status"), "test_runs", ["status"], unique=False)
    op.create_index(op.f("ix_test_runs_result"), "test_runs", ["result"], unique=False)

    # 3. Execution Events Table
    op.create_table(
        "execution_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("run_id", sa.Integer(), nullable=False),
        sa.Column("sequence_number", sa.Integer(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("message", sa.String(length=256), nullable=False),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="SUCCESS"),
        sa.ForeignKeyConstraint(["run_id"], ["test_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_execution_events_id"), "execution_events", ["id"], unique=False)
    op.create_index(op.f("ix_execution_events_run_id"), "execution_events", ["run_id"], unique=False)
    op.create_index(op.f("ix_execution_events_sequence_number"), "execution_events", ["sequence_number"], unique=False)

    # 4. Test Reports Table
    op.create_table(
        "test_reports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("run_id", sa.Integer(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("result", sa.String(length=32), nullable=False),
        sa.Column("risk_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("findings_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("findings_summary", sa.Text(), nullable=True),
        sa.Column("evidence_summary", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["run_id"], ["test_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("run_id")
    )
    op.create_index(op.f("ix_test_reports_id"), "test_reports", ["id"], unique=False)
    op.create_index(op.f("ix_test_reports_run_id"), "test_reports", ["run_id"], unique=True)

    # 5. Application Settings Table
    op.create_table(
        "application_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(length=128), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("description", sa.String(length=256), nullable=True),
        sa.Column("is_secret", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("key")
    )
    op.create_index(op.f("ix_application_settings_id"), "application_settings", ["id"], unique=False)
    op.create_index(op.f("ix_application_settings_key"), "application_settings", ["key"], unique=True)


def downgrade() -> None:
    op.drop_table("application_settings")
    op.drop_table("test_reports")
    op.drop_table("execution_events")
    op.drop_table("test_runs")
    op.drop_table("test_scenarios")
