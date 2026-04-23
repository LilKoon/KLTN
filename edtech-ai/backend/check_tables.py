import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

engine = create_async_engine("postgresql+asyncpg://postgres:bun123@localhost:5432/DB_KLTN_final", echo=False)

async def run():
    async with engine.connect() as conn:
        r = await conn.execute(text(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema='public' ORDER BY table_name"
        ))
        print("=== Tables in DB ===")
        for row in r.fetchall():
            print(" ", row[0])

        # Check trangthainode columns
        r2 = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='trangthainode' ORDER BY ordinal_position"
        ))
        rows = r2.fetchall()
        if rows:
            print("\n=== trangthainode columns ===")
            for row in rows:
                print(" ", row[0])
        else:
            print("\n[!] Table 'trangthainode' DOES NOT EXIST")

asyncio.run(run())
