from sqlalchemy import create_engine, text
engine = create_engine('postgresql://postgres:bun123@localhost:5432/DB_KLTN_final')
with engine.connect() as conn:
    res = conn.execute(text('SELECT "KyNang", "MucDo", COUNT(*) FROM "NganHangCauHoi" GROUP BY "KyNang", "MucDo"')).fetchall()
    for r in res:
        print(r)
