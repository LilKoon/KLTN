import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:bun123@localhost:5432/DB_KLTN_final"
engine = create_async_engine(DATABASE_URL, echo=True)

async def alter_db():
    async with engine.connect() as conn:
        try:
            await conn.execute(text("ALTER TABLE nguoidung ALTER COLUMN trangthai SET DEFAULT 'OFFLINE';"))
            await conn.execute(text("UPDATE nguoidung SET trangthai = 'OFFLINE';"))
        except Exception as e:
            print(e)
        await conn.commit()

if __name__ == "__main__":
    asyncio.run(alter_db())
