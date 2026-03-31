from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.models.demand import Demand
from app.models.scenario import Scenario
from app.schemas.demands import DemandCreate

router = APIRouter()


@router.post("/")
async def create_demand(data: DemandCreate, db: AsyncSession = Depends(get_db)):
    scenario = await db.get(Scenario, data.scenario_id)

    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found, add a topology first")

    for d in data.demands:
        demand = Demand(
            scenario_id=data.scenario_id,
            source=d.source,
            target=d.target,
            traffic=d.traffic,
        )
        db.add(demand)

    await db.commit()
    return {"ok": True}
