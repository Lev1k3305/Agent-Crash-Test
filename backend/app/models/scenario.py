from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from backend.app.models.base import Base


class TestScenario(Base):
    __tablename__ = "test_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(32), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False, index=True)
    risk_level = Column(String(32), nullable=False, default="Medium")
    description = Column(Text, nullable=False)
    detailed_threat = Column(Text, nullable=True)
    target_workflow = Column(String(128), nullable=True, default="E-commerce CRM")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    runs = relationship("TestRun", back_populates="scenario", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "category": self.category,
            "risk_level": self.risk_level,
            "description": self.description,
            "detailed_threat": self.detailed_threat,
            "target_workflow": self.target_workflow,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "runs_count": len(self.runs) if self.runs else 0,
        }
