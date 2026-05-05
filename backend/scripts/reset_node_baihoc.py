"""Reset MaBaiHoc = NULL cho tất cả TrangThaiNode để auto-resolve chạy lại với unique topic."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
import database
from sqlalchemy import text

with database.engine.connect() as conn:
    r = conn.execute(text('UPDATE "TrangThaiNode" SET "MaBaiHoc" = NULL WHERE "MaBaiHoc" IS NOT NULL'))
    conn.commit()
    print(f"Reset {r.rowcount} nodes -> MaBaiHoc = NULL")
    print("Nodes se duoc auto-resolve voi topic khac nhau khi user click vao.")
