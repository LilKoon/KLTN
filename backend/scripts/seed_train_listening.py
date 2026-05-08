"""Seed audio + transcript + câu hỏi từ folder Database/Database_for_learning_path/train/train.

Idempotent:
- Copy mp3 vào static/audios/ nếu chưa có
- Tạo BaiHoc cho mỗi audio mới (gắn vào KhoaHoc Luyện nghe theo level)
- Insert câu hỏi nếu chưa có (kiểm tra trùng theo NoiDung + MaBaiHoc)

Cách dùng:
    cd backend && python -m scripts.seed_train_listening
"""
import sys
import os
import csv
import shutil
import uuid
from collections import OrderedDict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import database, models

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TRAIN_DIR = os.path.join(REPO_ROOT, "Database", "Database_for_learning_path", "train", "train")
CSV_PATH = os.path.join(TRAIN_DIR, "train_listenning - Trang tính1.csv")
STATIC_AUDIOS = os.path.join("static", "audios")


def detect_level(filename: str) -> str:
    """T_x_y.mp3 → 1-6=A, 7-12=B, 13-18=C. AudioTrack X.mp3 → distribute by parity."""
    base = os.path.splitext(filename)[0]
    if "_" in base and base[0].upper() == "T" and base[1].isdigit():
        try:
            idx = int(base.split("_")[1])
        except ValueError:
            return "B"
        if idx <= 6: return "A"
        if idx <= 12: return "B"
        return "C"
    if base.startswith("AudioTrack"):
        try:
            n = int(base.replace("AudioTrack", "").strip())
        except ValueError:
            return "B"
        # 26-30 → A, 31-34 → B, 35-38 → C
        if n <= 30: return "A"
        if n <= 34: return "B"
        return "C"
    return "B"


def copy_audio_files(report):
    os.makedirs(STATIC_AUDIOS, exist_ok=True)
    for fn in os.listdir(TRAIN_DIR):
        if not fn.lower().endswith(".mp3"):
            continue
        src = os.path.join(TRAIN_DIR, fn)
        dst = os.path.join(STATIC_AUDIOS, fn)
        if os.path.exists(dst):
            report["audio_skipped"] += 1
        else:
            shutil.copy2(src, dst)
            report["audio_copied"] += 1


def get_or_create_listening_course(db, level: str):
    course = db.query(models.KhoaHoc).filter(
        models.KhoaHoc.MucDo == level,
        models.KhoaHoc.TenKhoaHoc.ilike("%nghe%"),
    ).first()
    if course:
        return course
    # Tạo mới
    course = models.KhoaHoc(
        MaKhoaHoc=uuid.uuid4(),
        TenKhoaHoc=f"Luyện nghe - Cấp {level}",
        MoTa=f"Bài luyện nghe trình độ {level}",
        MucDo=level,
        TrangThai='ACTIVE',
    )
    db.add(course)
    db.flush()
    return course


def get_or_create_baihoc(db, course, filename: str, transcript: str, lesson_idx: int):
    file_audio = f"audios/{filename}"
    bh = db.query(models.BaiHoc).filter(models.BaiHoc.FileAudio == file_audio).first()
    if bh:
        # Cập nhật transcript nếu thiếu
        if (not bh.NoiDungLyThuyet or not bh.NoiDungLyThuyet.get("transcript")) and transcript:
            bh.NoiDungLyThuyet = {"transcript": transcript}
        return bh, False
    bh = models.BaiHoc(
        MaBaiHoc=uuid.uuid4(),
        MaKhoaHoc=course.MaKhoaHoc,
        TenBaiHoc=f"Bài nghe: {os.path.splitext(filename)[0]}",
        ThuTu=lesson_idx,
        NoiDungLyThuyet={"transcript": transcript or ""},
        KyNang='LISTENING',
        ChuDe=os.path.splitext(filename)[0],
        FileAudio=file_audio,
        TrangThai='ACTIVE',
    )
    db.add(bh)
    db.flush()
    return bh, True


def insert_question(db, bh, course, q_text: str, opts: dict, correct_letter: str, report):
    # opts = {'A': 'text', 'B': ..., 'C': ..., 'D': ...}
    norm_q = (q_text or "").strip()
    if not norm_q or len(opts) < 2:
        report["question_skipped"] += 1
        return
    # Skip nếu đã có cùng NoiDung trong cùng BaiHoc
    exists = db.query(models.NganHangCauHoi).filter(
        models.NganHangCauHoi.MaBaiHoc == bh.MaBaiHoc,
        models.NganHangCauHoi.NoiDung == norm_q,
    ).first()
    if exists:
        report["question_skipped"] += 1
        return
    letter = (correct_letter or "").strip().upper()[:1]
    if letter not in opts:
        report["question_skipped"] += 1
        return
    q = models.NganHangCauHoi(
        MaCauHoi=uuid.uuid4(),
        MaKhoaHoc=course.MaKhoaHoc,
        MaBaiHoc=bh.MaBaiHoc,
        KyNang='LISTENING',
        MucDo='MEDIUM',
        NoiDung=norm_q,
        DSDapAn=opts,
        DapAnDung=letter,
        FileAudio=bh.FileAudio,
        TrangThai='ACTIVE',
    )
    db.add(q)
    report["question_added"] += 1


def main():
    if not os.path.exists(TRAIN_DIR):
        raise FileNotFoundError(f"Không thấy folder {TRAIN_DIR}")
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Không thấy file CSV {CSV_PATH}")

    report = {
        "audio_copied": 0, "audio_skipped": 0,
        "baihoc_added": 0, "baihoc_existing": 0,
        "question_added": 0, "question_skipped": 0,
    }

    print(f"[seed-train] CSV: {CSV_PATH}")
    print(f"[seed-train] Static audios: {os.path.abspath(STATIC_AUDIOS)}")

    # 1. Copy audio
    copy_audio_files(report)

    # 2. Parse CSV — group by audio file
    grouped = OrderedDict()  # filename -> {transcript, questions: [...]}
    current_file = None
    current_transcript = ""
    with open(CSV_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            fa = (row.get("FileAudio") or "").strip()
            tr = (row.get("Transcripts") or "").strip()
            if fa:
                current_file = fa
                current_transcript = tr
                if current_file not in grouped:
                    grouped[current_file] = {"transcript": current_transcript, "questions": []}
            if not current_file:
                continue
            q_text = (row.get("Question") or "").strip()
            if not q_text:
                continue
            opts = {}
            for letter in ("A", "B", "C", "D"):
                v = (row.get(f"Option {letter}") or "").strip()
                if v: opts[letter] = v
            corr = (row.get("Correct Answer") or "").strip()
            grouped[current_file]["questions"].append({
                "question": q_text, "options": opts, "correct": corr
            })

    # 3. Insert into DB
    db = database.SessionLocal()
    try:
        # cache courses by level
        course_cache = {}
        # Track lesson index per course
        next_thutu = {}
        for level in ("A", "B", "C"):
            c = get_or_create_listening_course(db, level)
            course_cache[level] = c
            mx = db.query(models.BaiHoc).filter(
                models.BaiHoc.MaKhoaHoc == c.MaKhoaHoc,
                models.BaiHoc.KyNang == 'LISTENING',
            ).count()
            next_thutu[level] = mx + 1

        for filename, data in grouped.items():
            level = detect_level(filename)
            course = course_cache[level]
            bh, created = get_or_create_baihoc(
                db, course, filename, data["transcript"], next_thutu[level]
            )
            if created:
                report["baihoc_added"] += 1
                next_thutu[level] += 1
            else:
                report["baihoc_existing"] += 1

            for q in data["questions"]:
                insert_question(db, bh, course, q["question"], q["options"], q["correct"], report)

        db.commit()
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()

    print("\n[seed-train] DONE")
    for k, v in report.items():
        print(f"  {k:20s} = {v}")


if __name__ == "__main__":
    main()
