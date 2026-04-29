from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.dependencies import get_db
from backend.app.optimization.solver import solve_routing
from backend.app.schemas.optimize import OptimizeRequest
from backend.app.optimization.shortest_paths import generate_k_shortest_paths
from backend.app.api.routes.topology import get_graph_by_scenario
from backend.app.api.routes.demands import get_demands_by_scenario

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
