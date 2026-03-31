from pydantic import BaseModel


class EdgeDTO(BaseModel):
    source: int
    target: int
    capacity: float


class TopologyCreate(BaseModel):
    name: str
    edges: list[EdgeDTO]
