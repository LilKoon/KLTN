import sys
import os
import uuid
from sqlalchemy.orm import Session

# Add the parent directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

import database
import models

def seed_core_course(db: Session):
    # Check if we already seeded a course
    course = db.query(models.KhoaHoc).filter(models.KhoaHoc.TenKhoaHoc == "IELTS Nền tảng 5.0").first()
    if course:
        print("Course already seeded!")
        return course.MaKhoaHoc

    print("Creating core course...")
    new_course = models.KhoaHoc(
        MaKhoaHoc=uuid.uuid4(),
        TenKhoaHoc="IELTS Nền tảng 5.0",
        MoTa="Khóa học xây dựng nền tảng từ vựng và ngữ pháp cơ bản nhất cho kỳ thi IELTS.",
        MucDo="BEGINNER"
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    
    # Create 5 core lessons
    lessons = [
        {"TenBaiHoc": "Từ vựng Nền tảng 1", "ThuTu": 1},
        {"TenBaiHoc": "Ngữ pháp Căn bản: Các thì cơ bản", "ThuTu": 2},
        {"TenBaiHoc": "Phát âm chuẩn IPA", "ThuTu": 3},
        {"TenBaiHoc": "Luyện Nghe Phản xạ (Cơ bản)", "ThuTu": 4},
        {"TenBaiHoc": "Đọc hiểu cấu trúc câu", "ThuTu": 5},
    ]

    for index, l in enumerate(lessons):
        new_lesson = models.BaiHoc(
            MaBaiHoc=uuid.uuid4(),
            MaKhoaHoc=new_course.MaKhoaHoc,
            TenBaiHoc=l["TenBaiHoc"],
            ThuTu=l["ThuTu"]
        )
        db.add(new_lesson)
        
    db.commit()
    print("Core Course and 5 Lessons seeded successfully!")
    return new_course.MaKhoaHoc

if __name__ == "__main__":
    # Ensure tables are created (especially the new ones)
    models.Base.metadata.create_all(bind=database.engine)
    
    db = database.SessionLocal()
    try:
        seed_core_course(db)
    finally:
        db.close()
