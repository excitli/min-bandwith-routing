from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db
from app.optimization.solver import solve_routing
from app.schemas.optimize import OptimizeRequest
from app.optimization.shortest_paths import generate_k_shortest_paths
from app.api.routes.topology import get_graph_by_scenario
from app.api.routes.demands import get_demands_by_scenario
from app.additional.build_graph import build_graph
import networkx as nx




router = APIRouter()


@router.post("/")
async def optimize(
        data: OptimizeRequest,
        db: AsyncSession = Depends(get_db)
):
    topology_data = await get_graph_by_scenario(data.scenario_id, db)
    graph = topology_data["graph"]
    demands = await get_demands_by_scenario(data.scenario_id, db)

    paths = generate_k_shortest_paths(graph, k_paths = data.k_paths, demands=demands)
    try:
        results = solve_routing(
            edges=topology_data["edges"],
            demands=demands,
            paths=paths,
            routing_type=data.routing_type,
            objective_type=data.optimization_objective,
        )
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Optimization is impossible for such demands.")
    return {
        "results": results
    }


    return {"status": "ok"}
