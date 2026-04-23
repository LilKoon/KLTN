from datetime import datetime, timedelta
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import database, models, schemas
from api.auth import get_current_user

router = APIRouter(prefix="/flashcards", tags=["Flashcard Storage"])


def calculate_sm2(ef: float, interval: int, reps: int, quality: int) -> dict:
    q = [0, 2, 4, 5][quality]
    if q < 3:
        reps = 0
        interval = 1
    else:
        if reps == 0:
            interval = {5: 7, 4: 3}.get(q, 1)
        elif reps == 1:
            interval = {5: 14, 4: 7}.get(q, 3)
        else:
            interval = round(interval * ef)
        ef = max(1.3, ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        reps += 1
    next_due = datetime.utcnow() + timedelta(days=interval)
    return {"ef": ef, "interval": interval, "reps": reps, "next_due": next_due}


@router.get("/", response_model=List[schemas.DeckResponse])
def list_decks(
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    decks = (
        db.query(models.BoDTheFlashcard)
        .filter(models.BoDTheFlashcard.MaNguoiDung == current_user.MaNguoiDung)
        .all()
    )
    now = datetime.utcnow()
    result = []
    for deck in decks:
        due_count = sum(
            1 for sr in deck.trang_thai_sr if sr.NextDue <= now
        )
        result.append(
            schemas.DeckResponse(
                id=deck.MaBoDe,
                topic=deck.TenBoDe,
                level=deck.CapDo,
                count=deck.SoLuongThe,
                created_at=deck.NgayTao,
                due_today=due_count,
            )
        )
    return result


@router.post("/", response_model=schemas.DeckResponse)
def create_deck(
    req: schemas.DeckCreate,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    cards_data = [c.model_dump() for c in req.cards]
    deck = models.BoDTheFlashcard(
        MaNguoiDung=current_user.MaNguoiDung,
        TenBoDe=req.topic,
        CapDo=req.level,
        SoLuongThe=len(req.cards),
        DuLieuThe=cards_data,
    )
    db.add(deck)
    db.flush()
    for i in range(len(req.cards)):
        sr = models.TrangThaiSR(MaBoDe=deck.MaBoDe, IndexThe=i)
        db.add(sr)
    db.commit()
    db.refresh(deck)
    return schemas.DeckResponse(
        id=deck.MaBoDe,
        topic=deck.TenBoDe,
        level=deck.CapDo,
        count=deck.SoLuongThe,
        created_at=deck.NgayTao,
        due_today=len(req.cards),
    )


@router.delete("/{deck_id}")
def delete_deck(
    deck_id: UUID,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    deck = db.query(models.BoDTheFlashcard).filter(
        models.BoDTheFlashcard.MaBoDe == deck_id,
        models.BoDTheFlashcard.MaNguoiDung == current_user.MaNguoiDung,
    ).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    db.delete(deck)
    db.commit()
    return {"detail": "Deleted"}


@router.get("/{deck_id}/review")
def get_due_cards(
    deck_id: UUID,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    deck = db.query(models.BoDTheFlashcard).filter(
        models.BoDTheFlashcard.MaBoDe == deck_id,
        models.BoDTheFlashcard.MaNguoiDung == current_user.MaNguoiDung,
    ).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    now = datetime.utcnow()
    cards_data = deck.DuLieuThe
    result = []
    for sr in deck.trang_thai_sr:
        if sr.NextDue <= now:
            result.append({
                "index": sr.IndexThe,
                "card": cards_data[sr.IndexThe],
                "sr_state": {
                    "index": sr.IndexThe,
                    "ef": sr.EasinessFactor,
                    "interval": sr.Interval,
                    "reps": sr.Repetitions,
                    "next_due": sr.NextDue.isoformat(),
                },
            })
    return result


@router.post("/{deck_id}/review")
def submit_review(
    deck_id: UUID,
    req: schemas.ReviewSubmitRequest,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user),
):
    deck = db.query(models.BoDTheFlashcard).filter(
        models.BoDTheFlashcard.MaBoDe == deck_id,
        models.BoDTheFlashcard.MaNguoiDung == current_user.MaNguoiDung,
    ).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    sr_map = {sr.IndexThe: sr for sr in deck.trang_thai_sr}
    next_dates = {}
    for item in req.results:
        if item.quality < 0 or item.quality > 3:
            raise HTTPException(status_code=422, detail="quality must be 0-3")
        sr = sr_map.get(item.card_index)
        if not sr:
            continue
        result = calculate_sm2(sr.EasinessFactor, sr.Interval, sr.Repetitions, item.quality)
        sr.EasinessFactor = result["ef"]
        sr.Interval = result["interval"]
        sr.Repetitions = result["reps"]
        sr.NextDue = result["next_due"]
        next_dates[item.card_index] = result["next_due"].isoformat()
    db.commit()
    return {"updated": len(req.results), "next_review_dates": next_dates}
