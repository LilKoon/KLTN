"""Migration: thêm bảng admin (DanhGia, ThongBao, NhatKyHoatDong, CauHinhHeThong)
   và cột LaHeThong vào bo_the_flashcard.

Chạy:
    cd backend && python -m scripts.migrate_admin_tables
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import inspect, text
import database, models


def column_exists(conn, table: str, column: str) -> bool:
    insp = inspect(conn)
    return any(c["name"] == column for c in insp.get_columns(table))


def main():
    engine = database.engine
    print(f"[admin-migrate] DB: {engine.url}")

    # Tạo các bảng mới (nếu thiếu) bằng SQLAlchemy metadata
    models.Base.metadata.create_all(bind=engine)
    print("[admin-migrate] OK: create_all (DanhGia, ThongBao, NhatKyHoatDong, CauHinhHeThong)")

    # ALTER bo_the_flashcard thêm cột LaHeThong nếu chưa có
    with engine.begin() as conn:
        if not column_exists(conn, "bo_the_flashcard", "LaHeThong"):
            conn.execute(text(
                'ALTER TABLE bo_the_flashcard ADD COLUMN "LaHeThong" BOOLEAN DEFAULT FALSE'
            ))
            print('[admin-migrate] ADDED column bo_the_flashcard."LaHeThong"')
        else:
            print('[admin-migrate] SKIP column bo_the_flashcard."LaHeThong" (đã tồn tại)')

        # NganHangCauHoi: model có TrangThai + DoKho nhưng DB cũ thiếu (path_engine truy vấn)
        if not column_exists(conn, "NganHangCauHoi", "TrangThai"):
            conn.execute(text(
                'ALTER TABLE "ngan_hang_cau_hoi" ADD COLUMN "TrangThai" VARCHAR(50) DEFAULT \'ACTIVE\''
            ))
            print('[admin-migrate] ADDED column NganHangCauHoi."TrangThai"')
        else:
            print('[admin-migrate] SKIP column NganHangCauHoi."TrangThai" (đã tồn tại)')

        if not column_exists(conn, "NganHangCauHoi", "DoKho"):
            conn.execute(text(
                'ALTER TABLE "ngan_hang_cau_hoi" ADD COLUMN "DoKho" DOUBLE PRECISION DEFAULT 0.5'
            ))
            print('[admin-migrate] ADDED column NganHangCauHoi."DoKho"')
        else:
            print('[admin-migrate] SKIP column NganHangCauHoi."DoKho" (đã tồn tại)')

        # Seed cấu hình mặc định
        defaults = [
            ("maintenance_mode", "false", "Bật/tắt chế độ bảo trì"),
            ("allow_signup", "true", "Cho phép đăng ký mới"),
            ("default_language", "vi", "Ngôn ngữ mặc định"),
        ]
        for k, v, m in defaults:
            row = conn.execute(
                text('SELECT 1 FROM "cau_hinh_he_thong" WHERE "Khoa" = :k'), {"k": k}
            ).first()
            if not row:
                conn.execute(text(
                    'INSERT INTO "cau_hinh_he_thong" ("Khoa","GiaTri","MoTa") VALUES (:k,:v,:m)'
                ), {"k": k, "v": v, "m": m})
                print(f"[admin-migrate] SEED setting {k}={v}")

    print("[admin-migrate] DONE")


if __name__ == "__main__":
    main()
