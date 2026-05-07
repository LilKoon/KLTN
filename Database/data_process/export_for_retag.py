"""
Export 900 questions just inserted from update_data/quizz/topic_*.csv
to a single CSV (retag.csv) for manual review.

Columns:
    macauhoi, topic, kynang, mucdo, noidung, A, B, C, D, dapandung, giaithich

Edit the `kynang` column (GRAMMAR or VOCAB) then run apply_retag.py.
Rows are matched to DB by `noidung` (question text) — only rows that exist in DB
are exported, so re-running is safe.
"""
from __future__ import annotations

import csv
import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

import psycopg2

QUIZZ_DIR = Path(__file__).resolve().parent.parent / "update_data" / "quizz"
ENV_PATH = Path(__file__).resolve().parent.parent.parent / "backend" / ".env"
OUT_CSV = Path(__file__).resolve().parent / "retag.csv"


def read_env(path: Path) -> dict:
    if not path.is_file():
        return {}
    out = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def parse_db_url(url: str) -> dict:
    p = urlparse(url)
    qs = dict(x.split("=", 1) for x in (p.query.split("&") if p.query else []) if "=" in x)
    kw = {
        "host": qs.get("host") or p.hostname or "localhost",
        "port": p.port or 5432,
        "user": unquote(p.username or "") or None,
        "password": unquote(p.password or "") or None,
        "dbname": (p.path or "/").lstrip("/"),
    }
    return {k: v for k, v in kw.items() if v is not None}


def main() -> int:
    env = read_env(ENV_PATH)
    db_url = env.get("DATABASE_URL") or os.environ.get("DATABASE_URL")
    if not db_url:
        print("[ERROR] DATABASE_URL not found", file=sys.stderr)
        return 2

    rows_by_text: dict[str, dict] = {}
    files = sorted(
        QUIZZ_DIR.glob("topic_*.csv"),
        key=lambda p: int(re.search(r"\d+", p.stem).group()),
    )
    for f in files:
        topic = int(re.search(r"\d+", f.stem).group())
        with f.open(encoding="utf-8", newline="") as fh:
            for r in csv.DictReader(fh):
                noidung = r["cau_hoi"].strip()
                rows_by_text[noidung] = {
                    "topic": topic,
                    "A": r["A"], "B": r["B"], "C": r["C"], "D": r["D"],
                    "dapandung": r["dap_an"].strip().upper(),
                    "giaithich": (r.get("giai_thich") or "").strip(),
                }

    conn = psycopg2.connect(**parse_db_url(db_url))
    matched = 0
    try:
        with conn.cursor() as cur, OUT_CSV.open("w", encoding="utf-8", newline="") as out:
            w = csv.writer(out)
            w.writerow(["macauhoi", "topic", "kynang", "mucdo", "noidung",
                        "A", "B", "C", "D", "dapandung", "giaithich"])
            cur.execute("""
                SELECT macauhoi::text, kynang, mucdo, noidung
                FROM nganhangcauhoi
                WHERE noidung = ANY(%s)
                ORDER BY noidung
            """, (list(rows_by_text.keys()),))
            for macauhoi, kynang, mucdo, noidung in cur.fetchall():
                meta = rows_by_text.get(noidung)
                if not meta:
                    continue
                w.writerow([
                    macauhoi, meta["topic"], kynang, mucdo, noidung,
                    meta["A"], meta["B"], meta["C"], meta["D"],
                    meta["dapandung"], meta["giaithich"],
                ])
                matched += 1
    finally:
        conn.close()

    print(f"[OK] Exported {matched} rows → {OUT_CSV}")
    print("     Edit the `kynang` column (GRAMMAR / VOCAB) then run apply_retag.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
