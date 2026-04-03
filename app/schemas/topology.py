from pydantic import BaseModel
from typing import List, Dict, Any
import networkx as nx

class TopologyCreate(BaseModel):
    name: str
    edges: list[EdgeDTO]

class EdgeDTO(BaseModel):
    source: int
    target: int
    capacity: float
    weight: float = 1.0


class EdgeResponseDTO(EdgeDTO):
    id: int




class TopologyResponse(BaseModel):
    id: int
    nodes: List[int]
    edges: List[EdgeResponseDTO]

    @classmethod
    def from_networkx(cls, scenario_id: int, graph: nx.DiGraph, edges_raw: List[EdgeResponseDTO]):
        return cls(
            id=scenario_id,
            nodes=list(graph.nodes()),
            edges=[
                EdgeResponseDTO(
                    id=e.id,
                    source=e.source,
                    target=e.target,
                    capacity=e.capacity,
                    weight=e.weight,
                ) for e in edges_raw
            ]

        )
