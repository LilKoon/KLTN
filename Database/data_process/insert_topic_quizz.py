"""
Insert questions from update_data/quizz/topic_*.csv into nganhangcauhoi.

- KyNang: auto-classify GRAMMAR vs VOCAB.
    GRAMMAR if the 4 options share a common stem (word-form question), or the
    explanation contains grammar markers (sau tobe, V-ing, cấu trúc, ...).
    Otherwise VOCAB.
- MucDo: 2 (medium) for all.
- MucDichSuDung: {EXAM, DAU_VAO}.
- Idempotent: skip rows whose (noidung, kynang) already exists.

Reads DATABASE_URL from ../../backend/.env or environment.
"""
from __future__ import annotations

import csv
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

import psycopg2

QUIZZ_DIR = Path(__file__).resolve().parent.parent / "update_data" / "quizz"
ENV_PATH = Path(__file__).resolve().parent.parent.parent / "backend" / ".env"

GRAMMAR_HINTS = (
    "sau tobe", "sau to be", "sau \"is\"", "sau giới từ", "sau liên từ",
    "v-ing", "v_ing", "ving", "v-ed", "v_ed", "v3", "to v", "to + v",
    "cấu trúc", "công thức", "thì hiện tại", "thì quá khứ", "thì tương lai",
    "câu bị động", "câu điều kiện", "đảo ngữ", "mệnh đề quan hệ",
    "động từ khuyết thiếu", "câu hỏi đuôi", "phối hợp thì",
    "trật tự tính từ", "so sánh hơn", "so sánh nhất",
    "cần một danh từ", "cần một động từ", "cần một tính từ", "cần một trạng từ",
    "cần danh từ", "cần động từ", "cần tính từ", "cần trạng từ",
)


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
    if p.scheme not in ("postgresql", "postgres"):
        raise ValueError(f"DATABASE_URL không hợp lệ: {url}")
    qs = dict(x.split("=", 1) for x in (p.query.split("&") if p.query else []) if "=" in x)
    kw = {
        "host": qs.get("host") or p.hostname or "localhost",
        "port": p.port or 5432,
        "user": unquote(p.username or "") or None,
        "password": unquote(p.password or "") or None,
        "dbname": (p.path or "/").lstrip("/"),
    }
    return {k: v for k, v in kw.items() if v is not None}


def common_prefix_len(words: list[str]) -> int:
    if not words:
        return 0
    norm = [re.sub(r"[^a-z]", "", w.lower()) for w in words]
    norm = [w for w in norm if w]
    if len(norm) < 2:
        return 0
    n = min(len(w) for w in norm)
    i = 0
    while i < n and all(w[i] == norm[0][i] for w in norm):
        i += 1
    return i


def classify(question: str, options: list[str], explanation: str) -> str:
    """Return 'GRAMMAR' or 'VOCAB'."""
    expl = (explanation or "").lower()
    if any(h in expl for h in GRAMMAR_HINTS):
        return "GRAMMAR"

    cp = common_prefix_len(options)
    shortest = min((len(re.sub(r"[^a-z]", "", o.lower())) for o in options), default=0)
    if shortest and cp >= 4 and cp / shortest >= 0.5:
        return "GRAMMAR"

    return "VOCAB"


def load_rows() -> list[dict]:
    files = sorted(QUIZZ_DIR.glob("topic_*.csv"), key=lambda p: int(re.search(r"\d+", p.stem).group()))
    rows = []
    for f in files:
        topic_num = int(re.search(r"\d+", f.stem).group())
        with f.open(encoding="utf-8", newline="") as fh:
            for r in csv.DictReader(fh):
                opts = [r["A"], r["B"], r["C"], r["D"]]
                kynang = classify(r["cau_hoi"], opts, r.get("giai_thich", ""))
                rows.append({
                    "topic": topic_num,
                    "kynang": kynang,
                    "noidung": r["cau_hoi"].strip(),
                    "dsdapan": {"A": r["A"], "B": r["B"], "C": r["C"], "D": r["D"]},
                    "dapandung": r["dap_an"].strip().upper(),
                    "giaithich": (r.get("giai_thich") or "").strip() or None,
                })
    return rows


def main() -> int:
    env = read_env(ENV_PATH)
    db_url = env.get("DATABASE_URL") or os.environ.get("DATABASE_URL")
    if not db_url:
        print("[ERROR] DATABASE_URL not found", file=sys.stderr)
        return 2

    rows = load_rows()
    print(f"[INFO] Loaded {len(rows)} rows from {QUIZZ_DIR}")
    by_skill: dict[str, int] = {}
    for r in rows:
        by_skill[r["kynang"]] = by_skill.get(r["kynang"], 0) + 1
    for s, c in sorted(by_skill.items()):
        print(f"       {s}: {c}")

    conn = psycopg2.connect(**parse_db_url(db_url))
    inserted = skipped = errors = 0
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT noidung, kynang FROM nganhangcauhoi")
            existing = {(n, k) for n, k in cur.fetchall()}
        print(f"[INFO] Existing rows in DB: {len(existing)}")

        with conn.cursor() as cur:
            for r in rows:
                key = (r["noidung"], r["kynang"])
                if key in existing:
                    skipped += 1
                    continue
                try:
                    cur.execute(
                        """
                        INSERT INTO nganhangcauhoi
                            (kynang, mucdo, noidung, dsdapan, dapandung, giaithich, mucdichsudung)
                        VALUES (%s, %s, %s, %s::jsonb, %s, %s, %s)
                        """,
                        (
                            r["kynang"],
                            2,
                            r["noidung"],
                            json.dumps(r["dsdapan"], ensure_ascii=False),
                            r["dapandung"],
                            r["giaithich"],
                            ["EXAM", "DAU_VAO"],
                        ),
                    )
                    inserted += 1
                    existing.add(key)
                except Exception as e:
                    errors += 1
                    print(f"[WARN] topic {r['topic']} insert failed: {e}")
                    conn.rollback()
        conn.commit()

        with conn.cursor() as cur:
            cur.execute(
                "SELECT kynang, mucdo, COUNT(*) FROM nganhangcauhoi GROUP BY kynang, mucdo ORDER BY kynang, mucdo"
            )
            stats = cur.fetchall()
            cur.execute("SELECT COUNT(*) FROM nganhangcauhoi")
            total = cur.fetchone()[0]

        print(f"[OK] Inserted: {inserted} | Skipped: {skipped} | Errors: {errors}")
        print(f"[OK] Total questions now: {total}")
        for kn, md, c in stats:
            print(f"     {kn:<10} mức {md} → {c}")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    sys.exit(main())
