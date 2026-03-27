from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from models.base import Base

class Scenarios(Base):
    __tablename__ = "scenarios"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    create_at = Column(DateTime, default=datetime.now)