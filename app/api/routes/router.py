from fastapi import APIRouter

from app.api.routes import demands, optimization, topology

api_router = APIRouter()

api_router.include_router(topology.router, prefix="/topology", tags=["Topology"])
api_router.include_router(demands.router, prefix="/demands", tags=["Demands"])
api_router.include_router(optimization.router, prefix="/optimization", tags=["Optimization"])
