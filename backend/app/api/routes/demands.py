from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.dependencies import get_db
from backend.app.models.demand import Demand
from backend.app.models.scenario import Scenario
from backend.app.schemas.demands import DemandCreate

from sqlalchemy import select, delete

router = APIRouter()



async def get_demands_by_scenario(scenario_id: int, db: AsyncSession = Depends(get_db)):
    demands_query = await db.execute(select(Demand).where(Demand.scenario_id == scenario_id))
    demands = demands_query.scalars().all()
    if not demands:
        raise HTTPException(status_code=404, detail="Demand not found")
    return demands



@router.post("/")
async def create_demand(data: DemandCreate, db: AsyncSession = Depends(get_db)):
    scenario = await db.get(Scenario, data.scenario_id)

    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found, add a topology first")

    await db.execute(delete(Demand).where(Demand.scenario_id == data.scenario_id))

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


@router.delete("/{scenario_id}")
async def delete_demands(scenario_id: int, db: AsyncSession = Depends(get_db)):
    scenario = await db.get(Scenario, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found, deletion is impossible")

    await db.execute(delete(Demand).where(Demand.scenario_id==scenario_id))
    await db.commit()

    return {"deleted": True}