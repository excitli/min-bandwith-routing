from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Any

class RoutingType(str, Enum):
    BIFURCATED = "BIFURCATED" # LP
    NON_BIFURCATED = "NON_BIFURCATED" # MILP
    INTEGRAL = "INTEGRAL" # integers


class OptimizationObjective(str, Enum):
    MIN_BANDWITH = "MIN_BANDWITH" # bandwith minimisation
    MAX_FREE_CAP = "NAX_FREE_CAP" # maximum free capacity



class OptimizeRequest(BaseModel):
    scenario_id: int = Field(ge=1)
    k_paths: int = Field(default=3, ge=1, le=15)
    routing_type: RoutingType = Field(default=RoutingType.BIFURCATED)
    optimization_objective: OptimizationObjective = Field(default=OptimizationObjective.MIN_BANDWITH)


class OptimizeResult(BaseModel):
    scenario_id: int = Field(ge=1)
    objective: str = Field(default=OptimizationObjective.MIN_BANDWITH)
    routing_type: RoutingType = Field(default=RoutingType.BIFURCATED)
    objective_value: float = Field(default=0.0)
    paths: str = Field(default="")
    duals: str = Field(default="")