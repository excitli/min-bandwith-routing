import asyncio
from db.session import engine
from models.base import Base
from models import scenario, demand, node, edges

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == '__main__':
    asyncio.run(init_db())