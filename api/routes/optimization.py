from fastapi import APIRouter

router = APIRouter()

@router.post("/", tags=["Optimization"])
async def run_optimization():
    return {"status": "ok"}