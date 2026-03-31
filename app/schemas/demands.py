from pydantic import BaseModel


class DemandDTO(BaseModel):
    source: int
    target: int
    traffic: float


class DemandCreate(BaseModel):
    scenario_id: int
    demands: list[DemandDTO]
