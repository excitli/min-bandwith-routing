from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, join
from app.core.dependencies import get_db
from app.models import edge
from app.models.edge import Edge
from app.models.scenario import Scenario
from app.schemas import topology
from app.schemas.topology import TopologyCreate, EdgeResponseDTO, TopologyResponse
from app.additional.build_graph import build_graph
router = APIRouter()


async def get_graph_by_scenario(scenario_id: int, db: AsyncSession):
    scenario_query = await db.execute(select(Scenario).where(Scenario.id == scenario_id))
    scenario = scenario_query.scalar_one_or_none()

    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    edges_query = await db.execute(select(Edge).where(Edge.scenario_id == scenario.id))

    edges = edges_query.scalars().all()

    if not edges:
        raise HTTPException(status_code=404, detail="Edge not found")
    ''' 
    TODO: add demands so that we can insert it into the digraph,
    will have to verify that (demand.source == edge.source) and so onss
    '''
    # graph = nx.DiGraph()
    #
    # for edge in edges:
    #     graph.add_edge(
    #         edge.source,
    #         edge.target,
    #         id=edge.id,
    #         capacity=edge.capacity,
    #         weight=edge.weight,
    #     )
    graph = build_graph(edges)
    return {
        "scenario_id": scenario.id,
        "graph": graph,
        "edges": edges,
    }




@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_topology(
        data: TopologyCreate,
        db: AsyncSession = Depends(get_db),
):
    async with db.begin():
        scenario = Scenario(name=data.name)
        db.add(scenario)
        await db.flush()

        #deleted if Scenario is None and db.refresh(scenario)

        edges = []
        for e in data.edges:
            edge = Edge(
                scenario_id=scenario.id,
                source=e.source,
                target=e.target,
                capacity=e.capacity,
                weight=e.weight,
            )
            edges.append(edge)
        db.add_all(edges)

    return {"Success. scenario_id": scenario.id}


@router.get('/{scenario_id}')
async def get_topology(scenario_id:int, db: AsyncSession = Depends(get_db)):
    topology_data = await get_graph_by_scenario(scenario_id, db)
    if not topology_data:
        raise HTTPException(status_code=404, detail="Topology not found")


    response = TopologyResponse.from_networkx(
        scenario_id=scenario_id,
        graph=topology_data["graph"],
        edges_raw=topology_data["edges_raw"],
    )
    return response