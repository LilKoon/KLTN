"""Reset all paths to RESET status so users regenerate with new template."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
import database, models

db = database.SessionLocal()
paths = db.query(models.LoTrinhCaNhan).all()
for p in paths:
    p.TrangThai = 'RESET'
db.commit()
print(f"Reset {len(paths)} paths -> RESET. Users will regenerate with ~20-node template.")
db.close()
