from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.models.edge import Edge
from app.models.scenario import Scenario
from app.schemas.topology import TopologyCreate

router = APIRouter()


@router.post("/")
async def create_topology(data: TopologyCreate, db: AsyncSession = Depends(get_db)):
    scenario = Scenario(name=data.name)
    db.add(scenario)
    await db.commit()
    await db.refresh(scenario)

    for e in data.edges:
        edge = Edge(
            scenario_id=scenario.id,
            source=e.source,
            target=e.target,
            capacity=e.capacity,
        )
        db.add(edge)

    await db.commit()
    return {"scenario_id": scenario.id}
