"""Migration: Add DiemOntap, SoLanThu to TrangThaiNode."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
import database
from sqlalchemy import text

def run():
    sqls = [
        'ALTER TABLE "TrangThaiNode" ADD COLUMN IF NOT EXISTS "DiemOntap" FLOAT',
        'ALTER TABLE "TrangThaiNode" ADD COLUMN IF NOT EXISTS "SoLanThu" INTEGER DEFAULT 0',
    ]
    with database.engine.connect() as conn:
        for sql in sqls:
            conn.execute(text(sql))
        conn.commit()
    print("OK: DiemOntap, SoLanThu added to TrangThaiNode")

if __name__ == "__main__":
    run()
