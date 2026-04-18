from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
import models
import schemas
from services.ai_flashcard_service import normalize_topic, generate_flashcards, extract_topics_from_file

router = APIRouter(prefix="/flashcards", tags=["flashcards"])

def get_current_user(db: Session = Depends(get_db)):
    # Bypassing auth for now to make prototype work, or grab first user.
    user = db.query(models.NguoiDung).first()
    if not user:
        user = models.NguoiDung(TenNguoiDung="Test User", Email="test@example.com", MatKhau="123")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.post("/generate/text", response_model=schemas.FlashcardGenerateResponse)
def generate_flashcards_from_text(request: schemas.FlashcardGenerateRequest, db: Session = Depends(get_db)):
    # 1. Normalize Topic
    try:
        normalized_topic = normalize_topic(request.topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # 2. Check Cache
    chu_de = db.query(models.ChuDeFlashcard).filter(models.ChuDeFlashcard.TenChuDe == normalized_topic).first()
    
    if chu_de: # Cache HIT
        flashcards = db.query(models.TheGhiNho).filter(models.TheGhiNho.MaChuDe == chu_de.MaChuDe).all()
        # Convert to Pydantic
        items = [schemas.FlashcardItemDetail(
            TuVung=f.TuVung, LoaiTu=f.LoaiTu, PhienAm=f.PhienAm, Nghia=f.Nghia, ViDuNguCanh=f.ViDuNguCanh
        ) for f in flashcards]
        return schemas.FlashcardGenerateResponse(MaChuDe=chu_de.MaChuDe, TenChuDe=chu_de.TenChuDe, is_from_cache=True, flashcards=items)
    
    # 3. Cache Miss - Generate using LLM
    try:
        items = generate_flashcards(normalized_topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Error: {str(e)}")
    
    # 4. Save to Database
    new_chu_de = models.ChuDeFlashcard(TenChuDe=normalized_topic)
    db.add(new_chu_de)
    db.flush() # To get MaChuDe
    
    for item in items:
        new_card = models.TheGhiNho(
            MaChuDe=new_chu_de.MaChuDe,
            TuVung=item.TuVung,
            LoaiTu=item.LoaiTu,
            PhienAm=item.PhienAm,
            Nghia=item.Nghia,
            ViDuNguCanh=item.ViDuNguCanh
        )
        db.add(new_card)
    db.commit()
    
    return schemas.FlashcardGenerateResponse(MaChuDe=new_chu_de.MaChuDe, TenChuDe=new_chu_de.TenChuDe, is_from_cache=False, flashcards=items)


@router.post("/generate/document", response_model=schemas.FlashcardGenerateResponse)
async def generate_flashcards_from_doc(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    try:
        extracted_topic = extract_topics_from_file(content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process document: {str(e)}")
    
    # Re-use the text logic with the extracted topic
    return generate_flashcards_from_text(schemas.FlashcardGenerateRequest(topic=extracted_topic), db)


@router.post("/save")
def save_flashcard_deck(request: schemas.FlashcardSaveRequest, db: Session = Depends(get_db), current_user: models.NguoiDung = Depends(get_current_user)):
    chu_de = db.query(models.ChuDeFlashcard).filter(models.ChuDeFlashcard.MaChuDe == request.MaChuDe).first()
    if not chu_de:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    cards = db.query(models.TheGhiNho).filter(models.TheGhiNho.MaChuDe == request.MaChuDe).all()
    
    deck = models.BoTheGhiNho(MaNguoiDung=current_user.MaNguoiDung, TenBoThe=request.TenBoThe or chu_de.TenChuDe)
    db.add(deck)
    db.flush()
    
    for c in cards:
        user_card = models.TheGhiNho_NguoiDung(
            MaNguoiDung=current_user.MaNguoiDung,
            MaThe=c.MaThe,
            MaBoThe=deck.MaBoThe
        )
        db.add(user_card)
    
    db.commit()
    return {"message": "Saved successfully", "MaBoThe": deck.MaBoThe}

@router.get("/decks")
def get_user_decks(db: Session = Depends(get_db), current_user: models.NguoiDung = Depends(get_current_user)):
    decks = db.query(models.BoTheGhiNho).filter(models.BoTheGhiNho.MaNguoiDung == current_user.MaNguoiDung).order_by(models.BoTheGhiNho.created_at.desc()).all()
    
    result = []
    colors = ['from-emerald-400 to-teal-600', 'from-sky-400 to-indigo-600', 'from-rose-400 to-orange-500', 'from-violet-400 to-purple-600', 'from-amber-400 to-orange-500']
    
    for i, d in enumerate(decks):
        term_count = db.query(models.TheGhiNho_NguoiDung).filter(models.TheGhiNho_NguoiDung.MaBoThe == d.MaBoThe).count()
        last_studied = "Vừa tạo"
        # Optional: check progress to calculate last_studied correctly
        
        result.append({
            "id": d.MaBoThe,
            "title": d.TenBoThe,
            "terms": term_count,
            "lastStudied": last_studied,
            "color": colors[i % len(colors)]
        })
    return result

from typing import List

@router.get("/decks/{ma_bo_the}/cards", response_model=List[schemas.FlashcardItemDetail])
def get_deck_cards(ma_bo_the: UUID, db: Session = Depends(get_db), current_user: models.NguoiDung = Depends(get_current_user)):
    user_cards = db.query(models.TheGhiNho).join(
        models.TheGhiNho_NguoiDung, models.TheGhiNho.MaThe == models.TheGhiNho_NguoiDung.MaThe
    ).filter(
        models.TheGhiNho_NguoiDung.MaBoThe == ma_bo_the,
        models.TheGhiNho_NguoiDung.MaNguoiDung == current_user.MaNguoiDung
    ).all()
    
    return [
        schemas.FlashcardItemDetail(
            TuVung=c.TuVung,
            LoaiTu=c.LoaiTu,
            PhienAm=c.PhienAm,
            Nghia=c.Nghia,
            ViDuNguCanh=c.ViDuNguCanh
        ) for c in user_cards
    ]
