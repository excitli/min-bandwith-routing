from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes.router import api_router

app = FastAPI(
    title="Min Bandwidth Routing API",
    version="0.1.0",
    description="API для оптимизации маршрутизации с минимальной пропускной способностью"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(api_router)