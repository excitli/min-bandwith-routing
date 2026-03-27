from sqlalchemy import Column, Integer, String, ForeignKey, Float
from models.base import Base

class Edges(Base):
    __tablename__ = "edges"
    id = Column(Integer, primary_key=True)
    scenario_id = Column(Integer, ForeignKey('scenarios.id'))
    source = Column(Integer)
    target = Column(Integer)
    capacity = Column(Float)