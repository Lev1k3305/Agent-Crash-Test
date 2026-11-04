from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from backend.app.models.base import Base


class ExecutionEvent(Base):
    __tablename__ = "execution_events"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("test_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    sequence_number = Column(Integer, nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    event_type = Column(String(64), nullable=False)
    message = Column(String(256), nullable=False)
    details = Column(Text, nullable=True)
    status = Column(String(32), default="SUCCESS", nullable=False)

    run = relationship("TestRun", back_populates="events")

    def to_dict(self):
        return {
            "id": self.id,
            "run_id": self.run_id,
            "sequence_number": self.sequence_number,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "event_type": self.event_type,
            "message": self.message,
            "details": self.details,
            "status": self.status,
        }
