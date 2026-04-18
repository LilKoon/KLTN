from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
import database, models, schemas

router = APIRouter(prefix="/cms", tags=["CMS (Quản trị Admin)"])

@router.post("/courses", response_model=schemas.KhoaHocResponse)
def create_course(course: schemas.KhoaHocCreate, db: Session = Depends(database.get_db)):
    db_course = models.KhoaHoc(**course.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.get("/courses", response_model=list[schemas.KhoaHocResponse])
def get_courses(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.KhoaHoc).offset(skip).limit(limit).all()

@router.post("/lessons", response_model=schemas.BaiHocResponse)
def create_lesson(lesson: schemas.BaiHocCreate, db: Session = Depends(database.get_db)):
    course = db.query(models.KhoaHoc).filter(models.KhoaHoc.MaKhoaHoc == lesson.MaKhoaHoc).first()
    if not course:
        raise HTTPException(status_code=404, detail="Khóa học không tồn tại")
    
    db_lesson = models.BaiHoc(**lesson.model_dump())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.get("/courses/{course_id}/lessons", response_model=list[schemas.BaiHocResponse])
def get_lessons_by_course(course_id: UUID, db: Session = Depends(database.get_db)):
    return db.query(models.BaiHoc).filter(models.BaiHoc.MaKhoaHoc == course_id).order_by(models.BaiHoc.ThuTu).all()

@router.post("/questions", response_model=schemas.NganHangCauHoiResponse)
def create_question(question: schemas.NganHangCauHoiCreate, db: Session = Depends(database.get_db)):
    db_question = models.NganHangCauHoi(**question.model_dump())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.get("/questions", response_model=list[schemas.NganHangCauHoiResponse])
def get_questions(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.NganHangCauHoi).offset(skip).limit(limit).all()
