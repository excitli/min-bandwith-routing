from pydantic import BaseModel, Field


class DemandDTO(BaseModel):
    source: int = Field(ge=0)
    target: int = Field(ge=0)
    traffic: float = Field(ge=0)


class DemandCreate(BaseModel):
    scenario_id: int
    demands: list[DemandDTO]
