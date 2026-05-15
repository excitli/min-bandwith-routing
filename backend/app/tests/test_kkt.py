import pytest
from backend.app.schemas.optimize import RoutingType, OptimizationObjective
from backend.app.optimization.solver import solve_routing


class MockEdge:
    def __init__(self, id, capacity):
        self.id = id
        self.capacity = capacity


class MockDemand:
    def __init__(self, id, traffic):
        self.id = id
        self.traffic = traffic


@pytest.fixture
def mock_topology_data():
    edges = [MockEdge(1, 100.0), MockEdge(2, 100.0), MockEdge(3, 50.0)]
    demands = [MockDemand(1, 40.0)]
    paths = [
        {"id": "p1", "demand_id": 1, "edge_ids": [1, 2], "length": 2, "nodes": [1, 2, 3]},
        {"id": "p2", "demand_id": 1, "edge_ids": [3], "length": 1, "nodes": [1, 3]}
    ]
    return edges, demands, paths


def test_kkt_conditions_bifurcated(mock_topology_data):
    edges, demands, paths = mock_topology_data

    result = solve_routing(
        edges=edges, demands=demands, paths=paths,
        routing_type=RoutingType.BIFURCATED,
        objective_type=OptimizationObjective.MIN_BANDWITH
    )

    duals = result["duals"]
    active_flows = {p["path_id"]: p["flow"] for p in result["paths"]}

    # KKT 1: Сумма трафика равна hd
    assert sum(active_flows.values()) == pytest.approx(40.0)

    for p in paths:
        base_cost = p["length"]
        congestion_tax = sum(abs(duals["edges"].get(e, 0.0)) for e in p["edge_ids"])


        total_path_cost = base_cost + congestion_tax
        lambda_d = abs(duals["demands"].get(p["demand_id"], 0.0))

        if p["id"] in active_flows:
            # Для путей с трафиком: стоимость пути == lambda_d
            assert total_path_cost == pytest.approx(lambda_d, abs=1e-4)
        else:
            # Для путей без трафика: стоимость пути >= lambda_d
            assert total_path_cost >= lambda_d - 1e-4