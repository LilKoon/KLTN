"""Backup database PostgreSQL ra file SQL.

Cách dùng (tại thư mục backend):
    python -m scripts.backup_db                # -> Database/backup_<timestamp>.sql
    python -m scripts.backup_db ./out.sql      # -> đường dẫn tuỳ chọn

Tự động:
- Đọc DATABASE_URL từ backend/.env (qua database.settings)
- Tìm pg_dump trên PATH; nếu không có, dò thư mục cài đặt PostgreSQL trên Windows
- Truyền mật khẩu qua biến môi trường PGPASSWORD (không lộ trên CLI)
"""
import os
import sys
import shutil
import glob
import subprocess
from datetime import datetime
from urllib.parse import urlparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import database


def find_pg_dump() -> str:
    exe = shutil.which("pg_dump") or shutil.which("pg_dump.exe")
    if exe:
        return exe
    # Windows: dò thư mục PostgreSQL phổ biến
    candidates = []
    for base in (r"C:\Program Files\PostgreSQL", r"C:\Program Files (x86)\PostgreSQL"):
        if os.path.isdir(base):
            candidates.extend(glob.glob(os.path.join(base, "*", "bin", "pg_dump.exe")))
    if candidates:
        # chọn version cao nhất
        candidates.sort()
        return candidates[-1]
    raise FileNotFoundError(
        "Không tìm thấy pg_dump. Cài PostgreSQL client hoặc thêm pg_dump vào PATH."
    )


def main():
    out_path = sys.argv[1] if len(sys.argv) > 1 else None
    if not out_path:
        repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        out_dir = os.path.join(repo_root, "Database")
        os.makedirs(out_dir, exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        out_path = os.path.join(out_dir, f"backup_{ts}.sql")

    url = urlparse(database.settings.DATABASE_URL)
    db_name = url.path.lstrip("/")
    if not db_name:
        raise ValueError("DATABASE_URL thiếu tên database")

    pg_dump = find_pg_dump()
    print(f"[backup] pg_dump = {pg_dump}")
    print(f"[backup] host={url.hostname} port={url.port or 5432} db={db_name} user={url.username}")
    print(f"[backup] output -> {out_path}")

    cmd = [
        pg_dump,
        "-h", url.hostname or "localhost",
        "-p", str(url.port or 5432),
        "-U", url.username or "postgres",
        "-d", db_name,
        "--no-owner",
        "--no-privileges",
        "--encoding=UTF8",
        "-f", out_path,
    ]
    env = os.environ.copy()
    if url.password:
        env["PGPASSWORD"] = url.password

    proc = subprocess.run(cmd, env=env, capture_output=True, text=True)
    if proc.returncode != 0:
        print("[backup] STDERR:", proc.stderr)
        raise RuntimeError(f"pg_dump thất bại (exit={proc.returncode})")

    size = os.path.getsize(out_path)
    print(f"[backup] DONE — {size/1024:.1f} KB")
    return out_path


if __name__ == "__main__":
    main()
