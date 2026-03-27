from fastapi import APIRouter
from api.routes import optimization, topology, demands

api_router = APIRouter()

api_router.include_router(topology.router, prefix="/topology", tags=["Topology"])
api_router.include_router(demands.router, prefix="/demands", tags=["Demands"])
api_router.include_router(optimization.router, prefix="/optimization", tags=["Optimization"])
