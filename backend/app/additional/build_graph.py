from typing import Sequence, Any
import networkx as nx

def build_graph(edges: Sequence[Any]) -> nx.DiGraph:
    graph = nx.DiGraph()

    for edge in edges:
        graph.add_edge(
            edge.source,
            edge.target,
            id=edge.id,
            capacity=edge.capacity,
            weight=edge.weight,
        )
    return graph