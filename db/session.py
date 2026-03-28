import os

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker


DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)