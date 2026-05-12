"""Migration: Add KyNang, ChuDe, FileAudio columns to BaiHoc table."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import database
from sqlalchemy import text

db = database.SessionLocal()
try:
    stmts = [
        'ALTER TABLE "bai_hoc" ADD COLUMN IF NOT EXISTS "KyNang" VARCHAR(50)',
        'ALTER TABLE "bai_hoc" ADD COLUMN IF NOT EXISTS "ChuDe" VARCHAR(255)',
        'ALTER TABLE "bai_hoc" ADD COLUMN IF NOT EXISTS "FileAudio" VARCHAR(255)',
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
