from pydantic import BaseModel


class EdgeDTO(BaseModel):
    source: int
    target: int
    capacity: float
    weight: float = 1.0


class TopologyCreate(BaseModel):
    name: str
    edges: list[EdgeDTO]
