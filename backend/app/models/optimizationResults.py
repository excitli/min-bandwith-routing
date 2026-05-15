from sqlalchemy import Float, ForeignKey, Integer, Column, String
from sqlalchemy.orm import Mapped, mapped_column
from typing import Any, List, Dict


from backend.app.models.base import Base


class OptimizationResults(Base):
    __tablename__ = 'optimization_results'
    id: Mapped[int] = Column(Integer, primary_key=True)
    scenario_id: Mapped[int] = Column(Integer, ForeignKey("scenarios.id"))
    objective: Mapped[str] = Column(String, nullable=False)
    routing_type: Mapped[str] = Column(String, nullable=False)
    objective_value: Mapped[float] = Column(Float, nullable=False)
    paths: Mapped[str] = Column(String, nullable=False)
    duals: Mapped[str] = Column(String, nullable=False)

