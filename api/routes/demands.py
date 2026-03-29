from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.demands import DemandCreate
from dependency import get_db
from models.scenario import Scenarios
from models.demand import Demands


router = APIRouter()

@router.post("/", tags=["Demands"])
async def create_demand(data: DemandCreate, db: AsyncSession = Depends(get_db)):
    scenario_id = data.scenario_id
    scenario = await db.get(Scenarios, scenario_id)

    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found, add a topology first")

    for d in data.demands:
        demand = Demands(
            scenario_id=scenario_id,
            source = d.source,
            target = d.target,
            traffic = d.traffic,
        )
        db.add(demand)

    await db.commit()
    return {"ok": True}