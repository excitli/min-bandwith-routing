from sqlalchemy import Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import Base


class Edge(Base):
    __tablename__ = "edges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    scenario_id: Mapped[int] = mapped_column(Integer, ForeignKey("scenarios.id"))
    source: Mapped[int] = mapped_column(Integer)
    target: Mapped[int] = mapped_column(Integer)
    capacity: Mapped[float] = mapped_column(Float)
    weight: Mapped[float] = mapped_column(Float, default=1.0)
