from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.app.models.base import Base


class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_number = Column(String(64), unique=True, index=True, nullable=False)
    scenario_id = Column(Integer, ForeignKey("test_scenarios.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), default="COMPLETED", nullable=False, index=True)
    result = Column(String(32), default="PASSED", nullable=False, index=True)
    risk_score = Column(Integer, default=0, nullable=False)
    duration_seconds = Column(Float, default=0.0, nullable=False)
    target_system = Column(String(128), default="E-commerce CRM", nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    scenario = relationship("TestScenario", back_populates="runs")
    events = relationship(
        "ExecutionEvent",
        back_populates="run",
        cascade="all, delete-orphan",
        order_by="ExecutionEvent.sequence_number"
    )
    report = relationship(
        "TestReport",
        back_populates="run",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "run_number": self.run_number,
            "scenario_id": self.scenario_id,
            "scenario_name": self.scenario.name if self.scenario else None,
            "scenario_code": self.scenario.code if self.scenario else None,
            "status": self.status,
            "result": self.result,
            "risk_score": self.risk_score,
            "duration_seconds": self.duration_seconds,
            "target_system": self.target_system,
            "notes": self.notes,
            "events_count": len(self.events) if self.events else 0,
            "has_report": self.report is not None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
