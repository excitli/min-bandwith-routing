from fastapi import APIRouter

from backend.app.api.routes import optimization
from backend.app.api.routes import demands, topology

api_router = APIRouter()

api_router.include_router(topology.router, prefix="/topology", tags=["Topology"])
api_router.include_router(demands.router, prefix="/demands", tags=["Demands"])
api_router.include_router(optimization.router, prefix="/optimization", tags=["Optimization"])
