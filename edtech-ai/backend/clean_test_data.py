import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

engine = create_async_engine("postgresql+asyncpg://postgres:bun123@localhost:5432/DB_KLTN_final", echo=False)
Session = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def run():
    async with Session() as db:
        uid_res = await db.execute(text("SELECT manguoidung FROM nguoidung WHERE email='hohuuquangphu@gmail.com'"))
        uid = uid_res.scalar()
        if uid:
            await db.execute(text("DELETE FROM trangthainode WHERE malotrinh IN (SELECT malotrinh FROM lotrinhhoc WHERE manguoidung=:uid)"), {"uid": uid})
            await db.execute(text("DELETE FROM lotrinhhoc WHERE manguoidung=:uid"), {"uid": uid})
            await db.commit()
            print("Cleaned roadmap for test user")
        else:
            print("User not found")

asyncio.run(run())
