from pydantic import BaseModel
from typing import List

class EdgeDTO(BaseModel):
    source: int
    target: int
    capacity: float

class TopologyCreate(BaseModel):
    name: str
    edges: List[EdgeDTO]