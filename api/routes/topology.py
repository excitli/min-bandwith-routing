from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from dependency import get_db
from models.scenario import Scenarios
from models.edges import Edges
from models.node import Nodes
from schemas.topology import TopologyCreate


router = APIRouter()

@router.post("/", tags=["Topology"])
async def topology(data: TopologyCreate, db: AsyncSession = Depends(get_db)):
    scenario = Scenarios(name=data.name)
    db.add(scenario)
    await db.commit()
    await db.refresh(scenario)
    for e in data.edges:
        edge = Edges(
            scenario_id=scenario.id,
            source = e.source,
            target = e.target,
            capacity = e.capacity,
        )
        db.add(edge)
    await db.commit()
    return {"scenario_id": scenario.id}
