from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def run_optimization():
    return {"status": "ok"}
