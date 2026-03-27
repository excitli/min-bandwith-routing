from sqlalchemy import Column, Integer, ForeignKey, Float
from models.base import Base


class Demands(Base):
    __tablename__ = 'demands'
    id = Column(Integer, primary_key=True)
    scenario_id = Column(Integer, ForeignKey('scenarios.id'))
    source = Column(Integer)
    target = Column(Integer)
    traffic = Column(Float)