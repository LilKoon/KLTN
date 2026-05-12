"""
seed_learning_data.py
=====================
Import toan bo 3 dataset (Grammar, Listening, Vocabulary) vao database.
Chay tu thu muc backend/:
    python scripts/seed_learning_data.py

Yeu cau: python-docx da co trong requirements.
"""

import sys
import os

# Fix UTF-8 output on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
import uuid
import csv
import shutil
from pathlib import Path

# Ensure backend root is in path
sys.path.insert(0, str(Path(__file__).parent.parent))

import database, models
from sqlalchemy.orm import Session
from docx import Document

# ─────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────
BACKEND_DIR = Path(__file__).parent.parent
DB_BASE = BACKEND_DIR.parent / "Database" / "Database_for_learning_path"

GRAMMAR_DIR   = DB_BASE / "CÁC CHUYÊN ĐỀ NGỮ PHÁP CƠ BẢN"
LISTENING_DIR = DB_BASE / "train"
VOCAB_DIR     = DB_BASE / "vocabulary_quizz"
AUDIO_STATIC  = BACKEND_DIR / "static" / "audio"

# ─────────────────────────────────────────────
# Level Mappings
# ─────────────────────────────────────────────

# Grammar: map một phần tên folder → level
GRAMMAR_LEVEL_MAP = {
    "A": [
        "CÂU BỊ ĐỘNG",
        "CÂU ĐIỀU KIỆN",
        "GIỚI TỪ",
        "LIÊN TỪ",
        "THÀNH NGỮ",
        "TRỌNG ÂM",
        "PHÁT ÂM",
    ],
    "B": [
        "MỆNH ĐỀ QUAN HỆ",
        "CẤU TẠO TỪ",
        "CỤM ĐỘNG TỪ",
        "DANH ĐỘNG TỪ",
        "SO SÁNH",
        "THÌ ĐỘNG TỪ",
    ],
    "C": [
        "ĐẢO NGỮ",
        "ĐỘNG TỪ KHUYẾT THIẾU",
        "SỰ PHỐI HỢP THÌ",
        "CÂU HỎI ĐUÔI",
        "TRẬT TỰ",
    ],
}


def get_grammar_level(folder_name: str) -> str:
    """Map tên folder chủ đề Ngữ pháp → level A/B/C."""
    name_upper = folder_name.upper()
    for level, keywords in GRAMMAR_LEVEL_MAP.items():
        for kw in keywords:
            if kw in name_upper:
                return level
    return "B"  # default trung cấp


def get_listening_level(filename: str) -> str:
    """T1_1..T1_6=A, T1_7..T1_12=B, T1_13..T1_18=C"""
    try:
        num = int(filename.replace("T1_", "").replace(".mp3", ""))
        if num <= 6:
            return "A"
        elif num <= 12:
            return "B"
        else:
            return "C"
    except Exception:
        return "B"


def get_vocab_level(topic_num: int) -> str:
    """1-10=A, 11-20=B, 21-30=C"""
    if topic_num <= 10:
        return "A"
    elif topic_num <= 20:
        return "B"
    else:
        return "C"


# ─────────────────────────────────────────────
# DOCX Parser
# ─────────────────────────────────────────────

def parse_docx_to_json(docx_path: Path) -> dict:
    """
    Parse file .docx → JSON structure:
    {
      "title": str,
      "sections": [{"heading": str, "content": str}, ...]
    }
    """
    try:
        doc = Document(str(docx_path))
    except Exception as e:
        print(f"    [WARN] Cannot parse {docx_path.name}: {e}")
        return {"title": docx_path.stem, "sections": []}

    title = docx_path.stem
    sections = []
    current_heading = ""
    current_paragraphs = []

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue

        style_name = para.style.name.lower() if para.style else ""
        is_heading = "heading" in style_name or para.runs and any(
            r.bold for r in para.runs if r.text.strip()
        )

        if is_heading and len(text) < 200:
            # Save previous section
            if current_heading or current_paragraphs:
                sections.append({
                    "heading": current_heading,
                    "content": "\n".join(current_paragraphs)
                })
            current_heading = text
            current_paragraphs = []
        else:
            current_paragraphs.append(text)

    # Last section
    if current_heading or current_paragraphs:
        sections.append({
            "heading": current_heading,
            "content": "\n".join(current_paragraphs)
        })

    return {"title": title, "sections": sections}


# ─────────────────────────────────────────────
# CSV Reader (handle BOM + encoding)
# ─────────────────────────────────────────────

def read_csv(path: Path) -> list[dict]:
    """Đọc CSV với encoding utf-8-sig để handle BOM."""
    rows = []
    try:
        with open(str(path), encoding="utf-8-sig", errors="replace") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append({k.strip(): v.strip() if v else "" for k, v in row.items()})
    except Exception as e:
        print(f"    [WARN] CSV error {path.name}: {e}")
    return rows


# ─────────────────────────────────────────────
# GRAMMAR SEED
# ─────────────────────────────────────────────

def seed_grammar(db: Session):
    print("\n═══ SEEDING GRAMMAR ═══")

    # Lấy hoặc tạo KhoaHoc cho Grammar theo từng level
    grammar_courses = {}
    for level in ("A", "B", "C"):
        course = db.query(models.KhoaHoc).filter(
            models.KhoaHoc.TenKhoaHoc == f"Ngữ pháp - Cấp {level}",
        ).first()
        if not course:
            course = models.KhoaHoc(
                MaKhoaHoc=uuid.uuid4(),
                TenKhoaHoc=f"Ngữ pháp - Cấp {level}",
                MoTa=f"Các chủ đề ngữ pháp cơ bản cấp độ {level}",
                MucDo=level,
                TrangThai="ACTIVE",
            )
            db.add(course)
        grammar_courses[level] = course
    db.flush()

    topic_folders = [d for d in GRAMMAR_DIR.iterdir() if d.is_dir()]
    lesson_order = {"A": 1, "B": 1, "C": 1}

    for folder in sorted(topic_folders):
        topic_name = folder.name
        level = get_grammar_level(topic_name)
        course = grammar_courses[level]

        print(f"  [{level}] {topic_name}")

        # Tìm file lý thuyết .docx
        docx_files = [f for f in folder.iterdir() if f.suffix == ".docx" and "LÝ THUYẾT" in f.name.upper()]
        theory_json = {}
        if docx_files:
            theory_json = parse_docx_to_json(docx_files[0])
            print(f"       → Parsed docx: {len(theory_json.get('sections', []))} sections")
        else:
            theory_json = {"title": topic_name, "sections": []}
            print(f"       → No docx found, using empty theory")

        # Tạo BaiHoc
        bai_hoc = models.BaiHoc(
            MaBaiHoc=uuid.uuid4(),
            MaKhoaHoc=course.MaKhoaHoc,
            TenBaiHoc=topic_name,
            ThuTu=lesson_order[level],
            NoiDungLyThuyet=theory_json,
            TrangThai="ACTIVE",
            KyNang="GRAMMAR",
            ChuDe=topic_name,
        )
        db.add(bai_hoc)
        db.flush()  # lấy MaBaiHoc ngay
        lesson_order[level] += 1

        # Tìm file bài tập .csv
        csv_files = list(folder.glob("*.csv"))
        if not csv_files:
            print(f"       → No CSV found")
            continue

        rows = read_csv(csv_files[0])
        q_count = 0
        for row in rows:
            question = row.get("Câu hỏi") or row.get("cau_hoi") or row.get("question") or ""
            opt_a = row.get("A") or row.get("a") or ""
            opt_b = row.get("B") or row.get("b") or ""
            opt_c = row.get("C") or row.get("c") or ""
            opt_d = row.get("D") or row.get("d") or ""
            correct = row.get("Đáp án") or row.get("dap_an") or row.get("answer") or ""
            explain = row.get("Giải thích") or row.get("giai_thich") or row.get("explanation") or ""

            if not question or not correct:
                continue

            q = models.NganHangCauHoi(
                MaCauHoi=uuid.uuid4(),
                MaKhoaHoc=course.MaKhoaHoc,
                MaBaiHoc=bai_hoc.MaBaiHoc,
                KyNang="GRAMMAR",
                MucDo=level,
                NoiDung=question,
                DSDapAn={"A": opt_a, "B": opt_b, "C": opt_c, "D": opt_d},
                DapAnDung=correct.strip().upper(),
                GiaiThich=explain or None,
            )
            db.add(q)
            q_count += 1

        print(f"       → {q_count} questions imported")

    db.commit()
    print("  [OK] Grammar seeded")


# ─────────────────────────────────────────────
# LISTENING SEED
# ─────────────────────────────────────────────

def seed_listening(db: Session):
    print("\n═══ SEEDING LISTENING ═══")

    # Lấy hoặc tạo KhoaHoc cho Listening theo từng level
    listening_courses = {}
    for level in ("A", "B", "C"):
        course = db.query(models.KhoaHoc).filter(
            models.KhoaHoc.TenKhoaHoc == f"Luyện nghe - Cấp {level}",
        ).first()
        if not course:
            course = models.KhoaHoc(
                MaKhoaHoc=uuid.uuid4(),
                TenKhoaHoc=f"Luyện nghe - Cấp {level}",
                MoTa=f"Bài nghe với đoạn hội thoại và độc thoại cấp độ {level}",
                MucDo=level,
                TrangThai="ACTIVE",
            )
            db.add(course)
        listening_courses[level] = course
    db.flush()

    # Đọc CSV transcript + questions
    csv_file = LISTENING_DIR / "train_listenning - Trang tính1.csv"
    if not csv_file.exists():
        print(f"  [SKIP] CSV not found: {csv_file}")
        return

    # Parse CSV thủ công (multi-row per audio)
    audio_data = {}  # filename -> {transcript, questions[]}
    current_audio = None
    current_transcript = ""

    with open(str(csv_file), encoding="utf-8-sig", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            file_audio = (row.get("FileAudio") or "").strip()
            transcript  = (row.get("Transcripts") or "").strip()
            question    = (row.get("Question") or "").strip()
            opt_a       = (row.get("Option A") or "").strip()
            opt_b       = (row.get("Option B") or "").strip()
            opt_c       = (row.get("Option C") or "").strip()
            opt_d       = (row.get("Option D") or "").strip()
            correct     = (row.get("Correct Answer") or "").strip().upper()

            if file_audio:
                current_audio = file_audio.strip()
                current_transcript = transcript
                audio_data[current_audio] = {
                    "transcript": transcript,
                    "questions": []
                }
            elif current_audio and current_audio in audio_data:
                # Same audio, additional transcript rows
                if transcript and not audio_data[current_audio]["transcript"]:
                    audio_data[current_audio]["transcript"] = transcript

            if current_audio and question and correct:
                audio_data[current_audio]["questions"].append({
                    "question": question,
                    "A": opt_a, "B": opt_b, "C": opt_c, "D": opt_d,
                    "correct": correct,
                })

    lesson_order = {"A": 1, "B": 1, "C": 1}

    for filename, data in sorted(audio_data.items()):
        level = get_listening_level(filename)
        course = listening_courses[level]
        audio_path = f"audios/{filename}"  # relative to /static/ — pool 258 files

        print(f"  [{level}] {filename} → {len(data['questions'])} questions")

        # Tạo BaiHoc
        bai_hoc = models.BaiHoc(
            MaBaiHoc=uuid.uuid4(),
            MaKhoaHoc=course.MaKhoaHoc,
            TenBaiHoc=f"Bài nghe: {filename.replace('.mp3', '')}",
            ThuTu=lesson_order[level],
            NoiDungLyThuyet={"transcript": data["transcript"]},
            TrangThai="ACTIVE",
            KyNang="LISTENING",
            ChuDe=filename.replace(".mp3", ""),
            FileAudio=audio_path,
        )
        db.add(bai_hoc)
        db.flush()  # lấy MaBaiHoc ngay
        lesson_order[level] += 1

        # Tạo câu hỏi
        for q_row in data["questions"]:
            q = models.NganHangCauHoi(
                MaCauHoi=uuid.uuid4(),
                MaKhoaHoc=course.MaKhoaHoc,
                MaBaiHoc=bai_hoc.MaBaiHoc,
                KyNang="LISTENING",
                MucDo=level,
                NoiDung=q_row["question"],
                DSDapAn={"A": q_row["A"], "B": q_row["B"], "C": q_row["C"], "D": q_row["D"]},
                DapAnDung=q_row["correct"],
                FileAudio=audio_path,
            )
            db.add(q)

    db.commit()
    print("  [OK] Listening seeded")


# ─────────────────────────────────────────────
# VOCABULARY SEED
# ─────────────────────────────────────────────

def seed_vocabulary(db: Session):
    print("\n═══ SEEDING VOCABULARY ═══")

    vocab_dir  = VOCAB_DIR / "vocabulary"
    quizz_dir  = VOCAB_DIR / "quizz"

    # KhoaHoc cho Vocabulary
    vocab_courses = {}
    for level in ("A", "B", "C"):
        course = db.query(models.KhoaHoc).filter(
            models.KhoaHoc.TenKhoaHoc == f"Từ vựng - Cấp {level}",
        ).first()
        if not course:
            course = models.KhoaHoc(
                MaKhoaHoc=uuid.uuid4(),
                TenKhoaHoc=f"Từ vựng - Cấp {level}",
                MoTa=f"Từ vựng theo chủ đề cấp độ {level}",
                MucDo=level,
                TrangThai="ACTIVE",
            )
            db.add(course)
        vocab_courses[level] = course
    db.flush()

    lesson_order = {"A": 1, "B": 1, "C": 1}

    # Vocab theory files: topic_01_CULTURE_IDENTITY.csv ... topic_30_*.csv
    vocab_files = sorted(vocab_dir.glob("topic_*.csv"))

    for vocab_file in vocab_files:
        # Extract topic number from filename
        try:
            topic_num = int(vocab_file.stem.split("_")[1])
        except (IndexError, ValueError):
            continue

        level = get_vocab_level(topic_num)
        course = vocab_courses[level]

        # Topic name from filename (e.g. topic_01_CULTURE_IDENTITY → CULTURE IDENTITY)
        parts = vocab_file.stem.split("_", 2)
        topic_name = parts[2].replace("_", " ") if len(parts) > 2 else vocab_file.stem

        # Read vocabulary words
        rows = read_csv(vocab_file)
        words = []
        for row in rows:
            word = row.get("tu_vung") or row.get("word") or ""
            word_type = row.get("tu_loai") or row.get("type") or ""
            phonetic = row.get("phien_am") or row.get("phonetic") or ""
            meaning = row.get("nghia") or row.get("meaning") or ""
            if word:
                words.append({
                    "word": word,
                    "type": word_type,
                    "phonetic": phonetic,
                    "meaning": meaning,
                })

        print(f"  [{level}] Topic {topic_num:02d}: {topic_name} ({len(words)} words)")

        bai_hoc = models.BaiHoc(
            MaBaiHoc=uuid.uuid4(),
            MaKhoaHoc=course.MaKhoaHoc,
            TenBaiHoc=f"Từ vựng: {topic_name}",
            ThuTu=lesson_order[level],
            NoiDungLyThuyet={"topic": topic_name, "words": words},
            TrangThai="ACTIVE",
            KyNang="VOCABULARY",
            ChuDe=topic_name,
        )
        db.add(bai_hoc)
        db.flush()  # lấy MaBaiHoc ngay
        lesson_order[level] += 1

        # Tìm quiz file tương ứng: quizz/topic_N.csv (không có leading zero)
        quizz_file = quizz_dir / f"topic_{topic_num}.csv"
        if not quizz_file.exists():
            quizz_file = quizz_dir / f"topic_{topic_num:02d}.csv"

        if quizz_file.exists():
            quiz_rows = read_csv(quizz_file)
            q_count = 0
            for row in quiz_rows:
                question = row.get("cau_hoi") or row.get("question") or ""
                opt_a = row.get("A") or row.get("a") or ""
                opt_b = row.get("B") or row.get("b") or ""
                opt_c = row.get("C") or row.get("c") or ""
                opt_d = row.get("D") or row.get("d") or ""
                correct = row.get("dap_an") or row.get("answer") or ""
                explain = row.get("giai_thich") or row.get("explanation") or ""

                if not question or not correct:
                    continue

                q = models.NganHangCauHoi(
                    MaCauHoi=uuid.uuid4(),
                    MaKhoaHoc=course.MaKhoaHoc,
                    MaBaiHoc=bai_hoc.MaBaiHoc,
                    KyNang="VOCABULARY",
                    MucDo=level,
                    NoiDung=question,
                    DSDapAn={"A": opt_a, "B": opt_b, "C": opt_c, "D": opt_d},
                    DapAnDung=correct.strip().upper(),
                    GiaiThich=explain or None,
                )
                db.add(q)
                q_count += 1

            print(f"              → {q_count} quiz questions")
        else:
            print(f"              → No quiz file found")

    db.commit()
    print("  [OK] Vocabulary seeded")


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def main():
    force = "--force" in sys.argv

    print("=" * 50)
    print("SEED LEARNING DATA")
    print("=" * 50)

    db: Session = database.SessionLocal()
    try:
        existing_grammar = db.query(models.NganHangCauHoi).filter(
            models.NganHangCauHoi.KyNang == "GRAMMAR"
        ).count()
        existing_listening = db.query(models.NganHangCauHoi).filter(
            models.NganHangCauHoi.KyNang == "LISTENING"
        ).count()
        existing_vocab = db.query(models.NganHangCauHoi).filter(
            models.NganHangCauHoi.KyNang == "VOCABULARY"
        ).count()

        if existing_grammar + existing_listening + existing_vocab > 0:
            print(f"\n[WARNING] Data already exists in DB:")
            print(f"  Grammar  : {existing_grammar} questions")
            print(f"  Listening: {existing_listening} questions")
            print(f"  Vocab    : {existing_vocab} questions")
            if not force:
                ans = input("\nDelete and re-seed? (y/N): ").strip().lower()
                if ans != "y":
                    print("Aborted. Use --force to skip this prompt.")
                    return
            else:
                print("--force flag detected. Deleting and re-seeding...")

            print("Deleting existing data...")
            db.query(models.BaiHoc).filter(
                models.BaiHoc.KyNang.in_(["GRAMMAR", "LISTENING", "VOCABULARY"])
            ).delete(synchronize_session=False)
            db.query(models.NganHangCauHoi).filter(
                models.NganHangCauHoi.KyNang.in_(["GRAMMAR", "LISTENING", "VOCABULARY"])
            ).delete(synchronize_session=False)
            for level in ("A", "B", "C"):
                for prefix in ("Ngu phap", "Luyen nghe", "Tu vung"):
                    pass  # handled by cascade from bai_hoc delete
            # Delete courses
            for level in ("A", "B", "C"):
                for name in [f"Ngu phap - Cap {level}", f"Luyen nghe - Cap {level}", f"Tu vung - Cap {level}",
                             f"Ng\u1eef ph\u00e1p - C\u1ea5p {level}", f"Luy\u1ec7n nghe - C\u1ea5p {level}", f"T\u1eeb v\u1ef1ng - C\u1ea5p {level}"]:
                    db.query(models.KhoaHoc).filter(
                        models.KhoaHoc.TenKhoaHoc == name
                    ).delete(synchronize_session=False)
            db.commit()
            print("Cleared.")

        seed_grammar(db)
        seed_listening(db)
        seed_vocabulary(db)

        print("\n" + "=" * 50)
        print("SEED COMPLETE - Summary:")
        g = db.query(models.NganHangCauHoi).filter(models.NganHangCauHoi.KyNang == "GRAMMAR").count()
        l = db.query(models.NganHangCauHoi).filter(models.NganHangCauHoi.KyNang == "LISTENING").count()
        v = db.query(models.NganHangCauHoi).filter(models.NganHangCauHoi.KyNang == "VOCABULARY").count()
        bh = db.query(models.BaiHoc).filter(models.BaiHoc.KyNang != None).count()
        print(f"  BaiHoc     : {bh}")
        print(f"  Grammar Qs : {g}")
        print(f"  Listening Qs: {l}")
        print(f"  Vocab Qs   : {v}")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()



if __name__ == "__main__":
    main()
