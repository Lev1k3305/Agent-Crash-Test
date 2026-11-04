from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.app.models.base import Base


class TestReport(Base):
    __tablename__ = "test_reports"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("test_runs.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    summary = Column(Text, nullable=False)
    result = Column(String(32), nullable=False)
    risk_score = Column(Integer, default=0, nullable=False)
    findings_count = Column(Integer, default=0, nullable=False)
    findings_summary = Column(Text, nullable=True)
    evidence_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    run = relationship("TestRun", back_populates="report")

    def to_dict(self):
        return {
            "id": self.id,
            "run_id": self.run_id,
            "run_number": self.run.run_number if self.run else None,
            "scenario_name": self.run.scenario.name if (self.run and self.run.scenario) else None,
            "summary": self.summary,
            "result": self.result,
            "risk_score": self.risk_score,
            "findings_count": self.findings_count,
            "findings_summary": self.findings_summary,
            "evidence_summary": self.evidence_summary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
