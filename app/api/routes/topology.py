from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, join
from app.core.dependencies import get_db
from app.models import edge
from app.models.edge import Edge
from app.models.scenario import Scenario
from app.schemas import topology
from app.schemas.topology import TopologyCreate
import networkx as nx

router = APIRouter()


async def get_graph_by_scenario(scenario_id: int, session: AsyncSession):
    scenario_query = await session.execute(select(Scenario).where(Scenario.id == scenario_id))
    scenario = scenario_query.scalar_one_or_none()

    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    edges_query = await session.execute(select(Edge).where(Edge.scenario_id == scenario.id))

    edges = [edges_query.scalar_one_or_none()]
    if not edges:
        raise HTTPException(status_code=404, detail="Edge not found")
    ''' 
    TODO: add demands so that we can insert it into the digraph,
    will have to verify that (demand.source == edge.source) and so on
    '''
    graph = nx.DiGraph()

    for edge in edges:
        graph.add_edge(
            edge.source,
            edge.target,
            id=edge.id,
            capacity=edge.capacity,
            weight=edge.weight,
        )

    return {
        "scenario_id": scenario.id,
        "graph": graph,
        "edges_raw": edges,
    }




@router.post("/")
async def create_topology(data: TopologyCreate, db: AsyncSession = Depends(get_db)):
    scenario = Scenario(name=data.name)
    db.add(scenario)
    await db.commit()
    await db.refresh(scenario)

    if scenario is None:
        raise HTTPException(status_code=400, detail="Scenario id is required")

    for e in data.edges:
        edge = Edge(
            scenario_id=scenario.id,
            source=e.source,
            target=e.target,
            capacity=e.capacity,
            weight=e.weight,
        )
        db.add(edge)

    await db.commit()
    return {"scenario_id": scenario.id}


@router.get('/{scenario_id}')
async def get_topology(scenario_id:int, db: AsyncSession = Depends(get_db)):
    topology_data = await get_graph_by_scenario(scenario_id, db)
    if not topology_data:
        raise HTTPException(status_code=404, detail="Topology not found")
    graph_data = nx.node_link_data(topology_data["graph"])
    return {
        "id": scenario_id,
        "graph": graph_data,
        "edges_raw": [
            {
                "id": e.id,
                "source": e.source,
                "target": e.target,
                "capacity": e.capacity,
                "weight": e.weight,
            } for e in topology_data["edges_raw"]
        ]
    }