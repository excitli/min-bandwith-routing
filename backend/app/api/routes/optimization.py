from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.dependencies import get_db
from backend.app.optimization.solver import solve_routing, cpla
from backend.app.schemas.optimize import OptimizeRequest, OptimizeResult
from backend.app.optimization.shortest_paths import generate_k_shortest_paths
from backend.app.api.routes.topology import get_graph_by_scenario
from backend.app.api.routes.demands import get_demands_by_scenario
from backend.app.models.optimizationResults import OptimizationResults
import json
from typing import List
from asyncio import to_thread


router = APIRouter()


@router.post("/")
async def optimize(
        data: OptimizeRequest,
        db: AsyncSession = Depends(get_db)
):
    topology_data = await get_graph_by_scenario(data.scenario_id, db)
    graph = topology_data["graph"]
    demands = await get_demands_by_scenario(data.scenario_id, db)

    #paths = generate_k_shortest_paths(graph, k_paths = data.k_paths, demands=demands)
    paths = await to_thread(generate_k_shortest_paths, graph, k_paths=data.k_paths, demands=demands)

    try:
        results = await to_thread(
            solve_routing,
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


@router.post(
    "/results",
    status_code=status.HTTP_201_CREATED,
    )
async def optimize_results(
        data: OptimizeResult,
        db: AsyncSession = Depends(get_db),
):
    paths_json = json.dumps(data.paths)
    duals_json = json.dumps(data.duals)
    new_result = OptimizationResults(
        scenario_id=data.scenario_id,
        objective=data.objective,
        routing_type=data.routing_type,
        objective_value=data.objective_value,
        paths=paths_json,
        duals=duals_json,
    )

    async with db.begin():
        db.add(new_result)

    await db.refresh(new_result)

    return {"status": "POSTED"}


@router.get(
    "/optimizeResults/{scenario_id}",
    response_model=List[OptimizeResult]
)
async def optimize_results(
        scenario_id: int,
        db: AsyncSession = Depends(get_db)):
    stmt = select(OptimizationResults).where(
        OptimizationResults.scenario_id == scenario_id
    )
    result = await db.execute(stmt)
    orm_objects = result.scalars().all()

    return [
        OptimizeResult(
        scenario_id=obj.scenario_id,
        objective=obj.objective,
        routing_type=obj.routing_type,
        objective_value=obj.objective_value,
        paths=json.loads(obj.paths),
        duals=json.loads(obj.duals)
    )
         for obj in orm_objects
    ]