from fastapi import FastAPI

from app.api.routes.router import api_router

app = FastAPI(
    title="Min Bandwidth Routing API",
    description="API для оптимизации маршрутизации с минимальной пропускной способностью",
    version="0.1.0",
)

app.include_router(api_router)
