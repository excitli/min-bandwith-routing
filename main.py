from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.routes.router import api_router

app = FastAPI()
app.include_router(api_router)

