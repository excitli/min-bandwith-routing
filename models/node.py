from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from models.base import Base

class Nodes(Base):
    __tablename__ = 'nodes'
    id = Column(Integer, primary_key=True)
    scenario_id = Column(Integer, ForeignKey('scenarios.id'))
    external_id = Column(Integer)

    
