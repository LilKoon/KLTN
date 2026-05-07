"""
Apply edited retag.csv back to nganhangcauhoi.

Reads `retag.csv` (output of export_for_retag.py), and for each row whose
`kynang` differs from the current DB value, runs:
    UPDATE nganhangcauhoi SET kynang = %s WHERE macauhoi = %s

Use --dry-run to preview without writing.

Allowed kynang values: GRAMMAR, VOCAB, LISTENING.
"""
from __future__ import annotations

import argparse
import csv
import os
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

import psycopg2

ENV_PATH = Path(__file__).resolve().parent.parent.parent / "backend" / ".env"
IN_CSV = Path(__file__).resolve().parent / "retag.csv"
ALLOWED = {"GRAMMAR", "VOCAB", "LISTENING"}


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
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dry-run", action="store_true", help="Preview changes only")
    ap.add_argument("--csv", default=str(IN_CSV), help=f"Input CSV path (default: {IN_CSV})")
    args = ap.parse_args()

    env = read_env(ENV_PATH)
    db_url = env.get("DATABASE_URL") or os.environ.get("DATABASE_URL")
    if not db_url:
        print("[ERROR] DATABASE_URL not found", file=sys.stderr)
        return 2

    csv_path = Path(args.csv)
    if not csv_path.is_file():
        print(f"[ERROR] {csv_path} not found", file=sys.stderr)
        return 2

    edits: list[tuple[str, str]] = []
    bad: list[tuple[int, str]] = []
    with csv_path.open(encoding="utf-8", newline="") as fh:
        for i, row in enumerate(csv.DictReader(fh), start=2):
            kynang = (row.get("kynang") or "").strip().upper()
            macauhoi = (row.get("macauhoi") or "").strip()
            if not macauhoi:
                continue
            if kynang not in ALLOWED:
                bad.append((i, kynang))
                continue
            edits.append((macauhoi, kynang))

    if bad:
        print(f"[WARN] {len(bad)} rows with invalid kynang (skipped):")
        for ln, k in bad[:5]:
            print(f"       line {ln}: '{k}'")
        if len(bad) > 5:
            print(f"       ... and {len(bad) - 5} more")

    conn = psycopg2.connect(**parse_db_url(db_url))
    updated = unchanged = missing = 0
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT macauhoi::text, kynang FROM nganhangcauhoi WHERE macauhoi::text = ANY(%s)",
                ([m for m, _ in edits],),
            )
            current = dict(cur.fetchall())

        with conn.cursor() as cur:
            for macauhoi, new_kn in edits:
                cur_kn = current.get(macauhoi)
                if cur_kn is None:
                    missing += 1
                    continue
                if cur_kn == new_kn:
                    unchanged += 1
                    continue
                if not args.dry_run:
                    cur.execute(
                        "UPDATE nganhangcauhoi SET kynang = %s, updated_at = CURRENT_TIMESTAMP WHERE macauhoi = %s",
                        (new_kn, macauhoi),
                    )
                updated += 1

        if args.dry_run:
            conn.rollback()
            print(f"[DRY-RUN] Would update {updated} | unchanged {unchanged} | missing {missing}")
        else:
            conn.commit()
            print(f"[OK] Updated {updated} | unchanged {unchanged} | missing {missing}")

        with conn.cursor() as cur:
            cur.execute(
                "SELECT kynang, mucdo, COUNT(*) FROM nganhangcauhoi GROUP BY kynang, mucdo ORDER BY kynang, mucdo"
            )
            for kn, md, c in cur.fetchall():
                print(f"     {kn:<10} mức {md} → {c}")
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
