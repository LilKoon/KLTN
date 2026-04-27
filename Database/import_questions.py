"""
Migrate questions from a legacy lowercase-schema dump (e.g. `kltn_backup_temp`)
into the live CamelCase schema (target DB read from backend/.env DATABASE_URL).

Usage:
    python import_questions.py                          # source=kltn_backup_temp, target từ backend/.env
    python import_questions.py --source other_dump      # đổi source DB
    python import_questions.py --target other_target    # override target dbname
    python import_questions.py --env path/to/.env       # đọc .env ở đường dẫn khác

Idempotent: ON CONFLICT (MaCauHoi) DO NOTHING — chạy lại an toàn.
"""

import argparse
import json
import os
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

import psycopg2
import psycopg2.extras

DEFAULT_SOURCE_DB = "kltn_backup_temp"
DEFAULT_ENV_PATH = Path(__file__).resolve().parent.parent / "backend" / ".env"


def read_env_file(path: Path) -> dict:
    """Tối giản: đọc KEY=VALUE từ .env, bỏ comment và dòng trống."""
    if not path.is_file():
        return {}
    out = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        out[key.strip()] = value.strip().strip('"').strip("'")
    return out


def parse_database_url(url: str) -> dict:
    """postgresql://user:pass@host:port/dbname → dict cho psycopg2.connect()."""
    parsed = urlparse(url)
    if parsed.scheme not in ("postgresql", "postgres"):
        raise ValueError(f"DATABASE_URL không hợp lệ: {url}")
    return {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 5432,
        "user": unquote(parsed.username or ""),
        "password": unquote(parsed.password or ""),
        "dbname": (parsed.path or "/").lstrip("/"),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--source", default=DEFAULT_SOURCE_DB, help=f"Source DB name (default: {DEFAULT_SOURCE_DB})")
    ap.add_argument("--target", default=None, help="Target DB name (override DATABASE_URL dbname)")
    ap.add_argument("--env", default=str(DEFAULT_ENV_PATH), help="Đường dẫn file .env (default: ../backend/.env)")
    args = ap.parse_args()

    env_path = Path(args.env).resolve()
    env = read_env_file(env_path)
    db_url = env.get("DATABASE_URL") or os.environ.get("DATABASE_URL")
    if not db_url:
        print(f"[ERROR] Không tìm thấy DATABASE_URL trong {env_path} hoặc biến môi trường.", file=sys.stderr)
        return 2

    try:
        conn_kw = parse_database_url(db_url)
    except ValueError as e:
        print(f"[ERROR] {e}", file=sys.stderr)
        return 2

    if args.target:
        conn_kw["dbname"] = args.target

    target_dbname = conn_kw["dbname"]
    print(f"[INFO] Source: {args.source}@{conn_kw['host']}:{conn_kw['port']}")
    print(f"[INFO] Target: {target_dbname}@{conn_kw['host']}:{conn_kw['port']}")

    src_kw = {**conn_kw, "dbname": args.source}
    src = psycopg2.connect(**src_kw)
    dst = psycopg2.connect(**conn_kw)
    try:
        with src.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as src_cur:
            src_cur.execute("""
                SELECT macauhoi, makhoahoc, kynang, mucdo, noidung,
                       dsdapan, dapandung, giaithich, fileaudiodinhkem
                FROM nganhangcauhoi
            """)
            rows = src_cur.fetchall()

        print(f"[INFO] Đọc {len(rows)} câu hỏi từ {args.source}.nganhangcauhoi")

        inserted = 0
        skipped = 0
        with dst.cursor() as dst_cur:
            for r in rows:
                ds_dapan = r["dsdapan"]
                if not isinstance(ds_dapan, str):
                    ds_dapan = json.dumps(ds_dapan, ensure_ascii=False)

                dst_cur.execute("""
                    INSERT INTO "NganHangCauHoi"
                        ("MaCauHoi", "MaKhoaHoc", "KyNang", "MucDo", "NoiDung",
                         "DSDapAn", "DapAnDung", "GiaiThich", "FileAudio")
                    VALUES (%s, NULL, %s, %s, %s, %s::jsonb, %s, %s, %s)
                    ON CONFLICT ("MaCauHoi") DO NOTHING
                """, (
                    str(r["macauhoi"]),
                    r["kynang"],
                    str(r["mucdo"]),
                    r["noidung"],
                    ds_dapan,
                    r["dapandung"],
                    r["giaithich"],
                    r["fileaudiodinhkem"] or None,
                ))
                if dst_cur.rowcount == 1:
                    inserted += 1
                else:
                    skipped += 1
        dst.commit()

        with dst.cursor() as dst_cur:
            dst_cur.execute("""
                SELECT "KyNang", "MucDo", COUNT(*)
                FROM "NganHangCauHoi"
                GROUP BY "KyNang", "MucDo"
                ORDER BY "KyNang", "MucDo"
            """)
            stats = dst_cur.fetchall()
            dst_cur.execute('SELECT COUNT(*) FROM "NganHangCauHoi"')
            total = dst_cur.fetchone()[0]

        print(f"[OK] Inserted: {inserted}  |  Skipped (exists): {skipped}")
        print(f"[OK] Tổng câu hỏi hiện có trong {target_dbname}.NganHangCauHoi: {total}")
        print("[OK] Phân bố:")
        for kynang, mucdo, count in stats:
            print(f"     {kynang:<12} mức {mucdo}  → {count}")
        return 0
    except Exception as e:
        dst.rollback()
        print(f"[ERROR] {e}", file=sys.stderr)
        return 1
    finally:
        src.close()
        dst.close()


if __name__ == "__main__":
    sys.exit(main())
