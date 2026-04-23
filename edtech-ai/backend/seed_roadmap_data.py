"""
seed_roadmap_data.py -- Tao du lieu mau cho tinh nang Lo Trinh Hoc.

Chay lenh:
    cd c:\\Bun\\KLTN_main\\KLTN\\edtech-ai\\backend
    .\\venv\\Scripts\\python.exe seed_roadmap_data.py

Script nay tao:
  - 3 KhoaHoc (BEGINNER / INTERMEDIATE / ADVANCED)
  - Moi khoa co 5 BaiHoc (VOCAB, GRAMMAR, LISTENING, VOCAB_ADV, TONG_HOP)
  - NodeKhoaHoc tuong ung cho tung BaiHoc

Chu y: Chay lai script se bo qua neu du lieu da ton tai (idempotent).
"""

import asyncio
import uuid
import json
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

# --- Cau hinh ket noi DB (giong config.py) ---
DATABASE_URL = "postgresql+asyncpg://postgres:bun123@localhost:5432/DB_KLTN_final"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# --- Du lieu Seed ---

COURSES = [
    {
        "ten": "Tieng Anh Co Ban (Beginner)",
        "mota": "Danh cho nguoi moi bat dau hoc tieng Anh. Xay dung nen tang tu vung, ngu phap va ky nang nghe co ban.",
        "mucdo": "BEGINNER",
        "bai_hoc": [
            {
                "ten": "Tu Vung Co Ban - Chu De Hang Ngay",
                "thu_tu": 1,
                "loai": "VOCABULARIES",
                "noi_dung": {
                    "gioi_thieu": "Hoc 100 tu vung tieng Anh co ban nhat ve gia dinh, do vat, mau sac va so dem.",
                    "muc_tieu": ["Ghi nho 100 tu vung co ban", "Phat am dung", "Dung duoc trong cau don gian"],
                    "chu_de": ["Gia dinh", "Mau sac", "Con so", "Do vat trong nha"],
                    "so_tu_vung": 100,
                    "thoi_luong_phut": 45
                }
            },
            {
                "ten": "Ngu Phap Nen Tang - Thi Hien Tai",
                "thu_tu": 2,
                "loai": "GRAMMAR",
                "noi_dung": {
                    "gioi_thieu": "Nam vung thi hien tai don va hien tai tiep dien - nen tang cua giao tiep hang ngay.",
                    "muc_tieu": ["Dung dung thi hien tai don", "Dung dung thi hien tai tiep dien", "Phan biet 2 thi"],
                    "cau_truc": ["S + V(s/es)", "S + am/is/are + V-ing"],
                    "so_bai_tap": 30,
                    "thoi_luong_phut": 60
                }
            },
            {
                "ten": "Luyen Nghe Co Ban - Hoi Thoai Doi Thuong",
                "thu_tu": 3,
                "loai": "LISTENING",
                "noi_dung": {
                    "gioi_thieu": "Luyen nghe cac doan hoi thoai ngan ve chao hoi, gioi thieu ban than, hoi duong.",
                    "muc_tieu": ["Nghe hieu cau chao hoi", "Nam bat thong tin co ban", "Nhan ra tu khoa"],
                    "chu_de": ["Chao hoi", "Gioi thieu ban than", "Hoi duong", "Mua sam"],
                    "so_bai_nghe": 10,
                    "thoi_luong_phut": 40
                }
            },
            {
                "ten": "Tu Vung Theo Chu De - Cong Viec & Truong Hoc",
                "thu_tu": 4,
                "loai": "VOCABULARIES",
                "noi_dung": {
                    "gioi_thieu": "Mo rong von tu vung ve moi truong cong so va hoc duong.",
                    "muc_tieu": ["80 tu ve cong viec", "80 tu ve hoc tap", "Dung trong email co ban"],
                    "chu_de": ["Nghe nghiep", "Van phong", "Truong hoc", "Mon hoc"],
                    "so_tu_vung": 160,
                    "thoi_luong_phut": 50
                }
            },
            {
                "ten": "Bai Kiem Tra Tong Ket Module Co Ban",
                "thu_tu": 5,
                "loai": "TONG_HOP",
                "noi_dung": {
                    "gioi_thieu": "Kiem tra toan bo kien thuc module Beginner truoc khi chuyen sang cap do tiep theo.",
                    "muc_tieu": ["Dat toi thieu 70% diem", "On lai diem yeu", "Mo khoa module Intermediate"],
                    "so_cau_hoi": 20,
                    "thoi_gian_phut": 30
                }
            },
        ]
    },
    {
        "ten": "Tieng Anh Trung Cap (Intermediate)",
        "mota": "Cu cung va nang cao ky nang tieng Anh len muc giao tiep tu tin. Phu hop voi nguoi da co nen tang co ban.",
        "mucdo": "INTERMEDIATE",
        "bai_hoc": [
            {
                "ten": "Tu Vung Hoc Thuat & Chu De Xa Hoi",
                "thu_tu": 1,
                "loai": "VOCABULARIES",
                "noi_dung": {
                    "gioi_thieu": "Hoc tu vung hoc thuat (Academic Word List) va tu vung ve cac chu de xa hoi thong dung.",
                    "muc_tieu": ["200 tu hoc thuat cot loi", "Hieu ngu nghia trong context", "Dung trong bai viet"],
                    "chu_de": ["Moi truong", "Cong nghe", "Y te", "Giao duc"],
                    "so_tu_vung": 200,
                    "thoi_luong_phut": 60
                }
            },
            {
                "ten": "Ngu Phap Nang Cao - Thi Hoan Thanh & Cau Dieu Kien",
                "thu_tu": 2,
                "loai": "GRAMMAR",
                "noi_dung": {
                    "gioi_thieu": "Lam chu thi hien tai hoan thanh, qua khu hoan thanh va cac loai cau dieu kien.",
                    "muc_tieu": ["Dung dung Present/Past Perfect", "Cau truc If Type 1, 2, 3", "Cau bi dong nang cao"],
                    "cau_truc": ["S + have/has + V3", "S + had + V3", "If + S + V2, S + would + V"],
                    "so_bai_tap": 50,
                    "thoi_luong_phut": 75
                }
            },
            {
                "ten": "Luyen Nghe Trung Cap - Podcast & Tin Tuc",
                "thu_tu": 3,
                "loai": "LISTENING",
                "noi_dung": {
                    "gioi_thieu": "Luyen nghe voi toc do tu nhien qua cac doan podcast va tin tuc ngan bang tieng Anh.",
                    "muc_tieu": ["Nghe hieu 70% noi dung podcast", "Nhan dien giong dieu", "Ghi chu khi nghe"],
                    "chu_de": ["Tin tuc quoc te", "Khoa hoc doi song", "Phong van xin viec", "Thao luan nhom"],
                    "so_bai_nghe": 15,
                    "thoi_luong_phut": 60
                }
            },
            {
                "ten": "Ky Nang Doc Hieu & Tu Vung Chuyen Nganh",
                "thu_tu": 4,
                "loai": "VOCABULARIES",
                "noi_dung": {
                    "gioi_thieu": "Doc hieu bai bao tieng Anh va hoc tu vung chuyen nganh kinh doanh, khoa hoc.",
                    "muc_tieu": ["Doc hieu bai bao 400 tu", "150 tu kinh doanh", "Ky thuat skimming/scanning"],
                    "chu_de": ["Business English", "Science & Tech", "Travel & Culture"],
                    "so_tu_vung": 150,
                    "thoi_luong_phut": 55
                }
            },
            {
                "ten": "Bai Kiem Tra Tong Ket Module Trung Cap",
                "thu_tu": 5,
                "loai": "TONG_HOP",
                "noi_dung": {
                    "gioi_thieu": "Danh gia toan dien nang luc Intermediate truoc khi buoc vao cap do nang cao.",
                    "muc_tieu": ["Dat toi thieu 70%", "On lai diem yeu", "Mo khoa module Advanced"],
                    "so_cau_hoi": 25,
                    "thoi_gian_phut": 35
                }
            },
        ]
    },
    {
        "ten": "Tieng Anh Nang Cao (Advanced)",
        "mota": "Chinh phuc tieng Anh o trinh do cao. Phu hop voi muc tieu thi IELTS, lam viec quoc te hoac hoc thuat.",
        "mucdo": "ADVANCED",
        "bai_hoc": [
            {
                "ten": "Tu Vung IELTS & Hoc Thuat Cao Cap",
                "thu_tu": 1,
                "loai": "VOCABULARIES",
                "noi_dung": {
                    "gioi_thieu": "Lam chu cac nhom tu vung IELTS Band 7+ va cum tu hoc thuat phuc tap.",
                    "muc_tieu": ["300 tu IELTS nang cao", "Collocations & Idioms", "Tu da nghia trong ngu canh"],
                    "chu_de": ["Climate & Environment", "Economy & Finance", "Politics & Society", "Medicine & Health"],
                    "so_tu_vung": 300,
                    "thoi_luong_phut": 80
                }
            },
            {
                "ten": "Ngu Phap IELTS - Cau Truc Phuc & Nhan Manh",
                "thu_tu": 2,
                "loai": "GRAMMAR",
                "noi_dung": {
                    "gioi_thieu": "Nam vung cac cau truc ngu phap phuc tap thuong xuat hien trong IELTS Writing & Speaking.",
                    "muc_tieu": ["Inversion (Dao ngu)", "Cleft Sentences", "Mixed Conditionals", "Subjunctive Mood"],
                    "cau_truc": ["Not only...but also", "Hardly had...when", "Were it not for..."],
                    "so_bai_tap": 60,
                    "thoi_luong_phut": 90
                }
            },
            {
                "ten": "Luyen Nghe IELTS - Lecture & Academic Talk",
                "thu_tu": 3,
                "loai": "LISTENING",
                "noi_dung": {
                    "gioi_thieu": "Luyen nghe cac bai giang hoc thuat, thuyet trinh va da giong vung mien nhu trong IELTS.",
                    "muc_tieu": ["Nghe Section 3 & 4 IELTS", "Theo doi luan diem phuc tap", "Nghe nhieu giong vung mien"],
                    "chu_de": ["University Lectures", "Academic Discussions", "Seminar Presentations"],
                    "so_bai_nghe": 20,
                    "thoi_luong_phut": 90
                }
            },
            {
                "ten": "Chien Luoc IELTS Reading & Vocabulary in Context",
                "thu_tu": 4,
                "loai": "VOCABULARIES",
                "noi_dung": {
                    "gioi_thieu": "Luyen doc bai thi IELTS voi chien luoc toi uu va mo rong von tu tu bai doc thuc te.",
                    "muc_tieu": ["Hoan thanh 1 passage IELTS trong 20 phut", "True/False/Not Given", "Matching Headings"],
                    "chu_de": ["IELTS Academic Passages", "Research Papers Excerpts"],
                    "so_tu_vung": 250,
                    "thoi_luong_phut": 75
                }
            },
            {
                "ten": "Mock Test Tong Ket - IELTS Style",
                "thu_tu": 5,
                "loai": "TONG_HOP",
                "noi_dung": {
                    "gioi_thieu": "Bai thi thu toan dien theo chuan IELTS de danh gia nang luc tong the.",
                    "muc_tieu": ["Mo phong dung format IELTS", "Quan ly thoi gian", "Nhan phan hoi chi tiet tu AI"],
                    "so_cau_hoi": 30,
                    "thoi_gian_phut": 40
                }
            },
        ]
    },
]

# --- Ham Seed ---

async def seed():
    async with AsyncSessionLocal() as db:
        print("[START] Bat dau seeding du lieu lo trinh hoc...\n")

        level_map = {"BEGINNER": 1, "INTERMEDIATE": 2, "ADVANCED": 3}

        for course_data in COURSES:
            # Kiem tra KhoaHoc da ton tai chua
            check = await db.execute(
                text("SELECT makhoahoc FROM khoahoc WHERE tenkhoahoc = :ten LIMIT 1"),
                {"ten": course_data["ten"]}
            )
            existing_course = check.fetchone()

            if existing_course:
                khoa_hoc_id = existing_course[0]
                print(f"  [SKIP] KhoaHoc '{course_data['ten']}' da ton tai.")
            else:
                khoa_hoc_id = uuid.uuid4()
                await db.execute(
                    text("""
                        INSERT INTO khoahoc (makhoahoc, tenkhoahoc, mota, mucdo, trangthai, created_at, updated_at)
                        VALUES (:id, :ten, :mota, :mucdo, 'ACTIVE', NOW(), NOW())
                    """),
                    {
                        "id": khoa_hoc_id,
                        "ten": course_data["ten"],
                        "mota": course_data["mota"],
                        "mucdo": course_data["mucdo"],
                    }
                )
                print(f"  [OK] Tao KhoaHoc: [{course_data['mucdo']}] {course_data['ten']}")

            # Tao BaiHoc + NodeKhoaHoc
            for bai in course_data["bai_hoc"]:
                check_bai = await db.execute(
                    text("SELECT mabaihoc FROM baihoc WHERE makhoahoc = :khoa AND tenbaihoc = :ten LIMIT 1"),
                    {"khoa": khoa_hoc_id, "ten": bai["ten"]}
                )
                existing_bai = check_bai.fetchone()

                if existing_bai:
                    bai_hoc_id = existing_bai[0]
                    print(f"      [SKIP] BaiHoc '{bai['ten']}' da ton tai.")
                else:
                    bai_hoc_id = uuid.uuid4()
                    await db.execute(
                        text("""
                            INSERT INTO baihoc (mabaihoc, makhoahoc, tenbaihoc, thutu, loaibaihoc, noidunglythuyet, trangthai, created_at, updated_at)
                            VALUES (:id, :khoa, :ten, :thu_tu, :loai, CAST(:noi_dung AS jsonb), 'ACTIVE', NOW(), NOW())
                        """),
                        {
                            "id": bai_hoc_id,
                            "khoa": khoa_hoc_id,
                            "ten": bai["ten"],
                            "thu_tu": bai["thu_tu"],
                            "loai": bai["loai"],
                            "noi_dung": json.dumps(bai["noi_dung"], ensure_ascii=False),
                        }
                    )
                    print(f"      [OK] Tao BaiHoc [{bai['loai']}]: {bai['ten']}")

                    # Tao NodeKhoaHoc
                    node_id = uuid.uuid4()
                    loai_node = "TEST" if bai["loai"] == "TONG_HOP" else "CORE"
                    await db.execute(
                        text("""
                            INSERT INTO nodekhoahoc (manode, makhoahoc, mabaihoc, thutu, loainode, created_at)
                            VALUES (:id, :khoa, :bai, :thu_tu, :loai, NOW())
                        """),
                        {
                            "id": node_id,
                            "khoa": khoa_hoc_id,
                            "bai": bai_hoc_id,
                            "thu_tu": bai["thu_tu"],
                            "loai": loai_node,
                        }
                    )
                    print(f"         [NODE] [{loai_node}] thu tu {bai['thu_tu']}")

            print()

        await db.commit()
        print("[DONE] Seeding hoan tat!\n")

        # Hien thi tom tat
        count_khoa = (await db.execute(text("SELECT COUNT(*) FROM khoahoc"))).scalar()
        count_bai = (await db.execute(text("SELECT COUNT(*) FROM baihoc"))).scalar()
        count_node = (await db.execute(text("SELECT COUNT(*) FROM nodekhoahoc"))).scalar()
        print("[SUMMARY] Tong ket DB:")
        print(f"   - KhoaHoc  : {count_khoa} ban ghi")
        print(f"   - BaiHoc   : {count_bai} ban ghi")
        print(f"   - Node     : {count_node} ban ghi")


if __name__ == "__main__":
    asyncio.run(seed())
