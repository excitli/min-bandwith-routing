from fastapi import APIRouter

router = APIRouter()

@router.post("/", tags=["Demand"])
async def create_demand():
    return {"status": "ok"}