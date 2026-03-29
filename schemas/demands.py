from pydantic import BaseModel
from typing import List

class DemandsDTO(BaseModel):
    source: int
    target: int
    traffic: float

class DemandCreate(BaseModel):
    scenario_id: int
    demands: List[DemandsDTO]
