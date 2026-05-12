"""Migration: Add KetQuaLevel column to BaiKiemTra and PhanKiemTra tables."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import database
from sqlalchemy import text

db = database.SessionLocal()
try:
    stmts = [
        'ALTER TABLE "bai_kiem_tra" ADD COLUMN IF NOT EXISTS "KetQuaLevel" INT',
        'ALTER TABLE "phan_kiem_tra" ADD COLUMN IF NOT EXISTS "KetQuaLevel" INT',
    ]
    for stmt in stmts:
        db.execute(text(stmt))
        print(f"OK: {stmt[:60]}...")
    db.commit()
    print("Migration complete.")
except Exception as e:
    db.rollback()
    print(f"Error: {e}")
finally:
    db.close()
