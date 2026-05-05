"""
Migration: Add MaBaiHoc FK to NganHangCauHoi + re-seed to link questions.
Run from backend/:
    python scripts/migrate_add_mabai_to_cauhoi.py
"""
import sys
import os
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import database
from sqlalchemy import text

def run():
    sql = """
    ALTER TABLE "NganHangCauHoi"
    ADD COLUMN IF NOT EXISTS "MaBaiHoc" UUID
    REFERENCES "BaiHoc"("MaBaiHoc") ON DELETE SET NULL;
    """
    with database.engine.connect() as conn:
        conn.execute(text(sql))
        conn.commit()
    print("OK: MaBaiHoc column added to NganHangCauHoi")

if __name__ == "__main__":
    run()
