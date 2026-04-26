import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
import database, models, schemas
from api.auth import get_current_user

router = APIRouter(prefix="/exam", tags=["Exam & Review"])

EXAM_CONFIG = {
    "total_questions": 30,
    "time_limit_minutes": 30,
    "distribution": [
        {"skill": "Grammar", "levels": {"1": 4, "2": 3, "3": 3}},
        {"skill": "Vocabulary", "levels": {"1": 4, "2": 3, "3": 3}},
        {"skill": "Listening", "levels": {"1": 10, "2": 0, "3": 0}},
    ]
}

@router.get("/placement-test/status")
def get_placement_test_status(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    exam = db.query(models.BaiKiemTra).filter(
        models.BaiKiemTra.MaNguoiDung == current_user.MaNguoiDung,
        models.BaiKiemTra.LoaiBaiKiemTra == "DAU_VAO",
        models.BaiKiemTra.TrangThai == "COMPLETED"
    ).order_by(models.BaiKiemTra.created_at.desc()).first()
    
    if not exam:
        return {"has_completed": False}
        
    pkts = db.query(models.PhanKiemTra).filter(models.PhanKiemTra.MaBaiKiemTra == exam.MaBaiKiemTra).all()
    percentages = {p.KyNang: p.PhanTramDiem for p in pkts}
    
    details = db.query(models.ChiTietLamBai, models.NganHangCauHoi)\
        .join(models.NganHangCauHoi, models.ChiTietLamBai.MaCauHoi == models.NganHangCauHoi.MaCauHoi)\
        .filter(models.ChiTietLamBai.MaBaiKiemTra == exam.MaBaiKiemTra).all()
        
    detailed_results = []
    total_correct = 0
    stats = {
        "VOCABULARY": {"correct": 0, "total": 0},
        "GRAMMAR": {"correct": 0, "total": 0},
        "LISTENING": {"correct": 0, "total": 0}
    }
    
    for c, q in details:
        kynang = q.KyNang.upper()
        if kynang not in stats: kynang = "VOCABULARY"
        stats[kynang]["total"] += 1
        if c.LaCauDung:
            stats[kynang]["correct"] += 1
            total_correct += 1
            
        correct_val = q.DapAnDung.strip()
        correct_text = correct_val
        if isinstance(q.DSDapAn, dict):
            correct_text = q.DSDapAn.get(correct_val, correct_val).strip()
        elif isinstance(q.DSDapAn, list):
            for opt in q.DSDapAn:
                opt_clean = opt.strip()
                if opt_clean.startswith(f"({correct_val})") or opt_clean.startswith(f"{correct_val}.") or opt_clean.startswith(f"{correct_val})"):
                    correct_text = opt_clean
                    break
                    
        dap_an_list = list(q.DSDapAn.values()) if isinstance(q.DSDapAn, dict) else list(q.DSDapAn)
        
        detailed_results.append({
            "MaCauHoi": q.MaCauHoi,
            "KyNang": q.KyNang.upper(),
            "NoiDung": q.NoiDung,
            "UserAnswer": c.LuaChon,
            "CorrectAnswer": correct_text,
            "IsCorrect": c.LaCauDung,
            "GiaiThich": q.GiaiThich,
            "Transcript": q.NoiDung if q.KyNang.upper() == 'LISTENING' else None,
            "FileAudio": q.FileAudio,
            "DSDapAn": dap_an_list
        })
        
    return {
        "has_completed": True,
        "result": {
            "total_score": exam.TongDiem,
            "total_correct": total_correct,
            "total_questions": len(detailed_results),
            "percentages": percentages,
            "stats": stats,
            "details": detailed_results
        }
    }

@router.get("/placement-test")
def get_placement_test(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Lấy ngẫu nhiên câu hỏi theo cấu hình EXAM_CONFIG.
    Chặn nếu đã làm rồi.
    """
    existing_exam = db.query(models.BaiKiemTra).filter(
        models.BaiKiemTra.MaNguoiDung == current_user.MaNguoiDung,
        models.BaiKiemTra.LoaiBaiKiemTra == "DAU_VAO",
        models.BaiKiemTra.TrangThai == "COMPLETED"
    ).first()
    
    if existing_exam:
        raise HTTPException(status_code=400, detail="Bạn đã hoàn thành bài test đầu vào rồi.")

    questions = []
    
    for entry in EXAM_CONFIG["distribution"]:
        skill = entry["skill"]
        for level, count in entry["levels"].items():
            if count == 0:
                continue
                
            query = db.query(models.NganHangCauHoi).filter(
                func.upper(models.NganHangCauHoi.KyNang) == skill.upper(),
                models.NganHangCauHoi.MucDo == str(level)
            )
            
            # Nếu là Listening thì đảm bảo có Audio
            if skill.upper() == "LISTENING":
                query = query.filter(
                    models.NganHangCauHoi.FileAudio.isnot(None),
                    models.NganHangCauHoi.FileAudio != "",
                    models.NganHangCauHoi.FileAudio != "null"
                )
                
            qs = query.order_by(func.random()).limit(count).all()
            
            # Nếu thiếu câu hỏi ở level này, lấy bù từ level khác của cùng kỹ năng
            if len(qs) < count:
                missing = count - len(qs)
                fallback_query = db.query(models.NganHangCauHoi).filter(
                    func.upper(models.NganHangCauHoi.KyNang) == skill.upper(),
                    models.NganHangCauHoi.MucDo != str(level)
                )
                if skill.upper() == "LISTENING":
                    fallback_query = fallback_query.filter(
                        models.NganHangCauHoi.FileAudio.isnot(None),
                        models.NganHangCauHoi.FileAudio != "",
                        models.NganHangCauHoi.FileAudio != "null"
                    )
                fallback_qs = fallback_query.order_by(func.random()).limit(missing).all()
                qs.extend(fallback_qs)
                
            questions.extend(qs)
            
    # Process return data to hide exact correct answer
    results = []
    for q in questions:
        if isinstance(q.DSDapAn, dict):
            dap_an_list = list(q.DSDapAn.values())
        else:
            dap_an_list = list(q.DSDapAn)
        
        # Không đảo đáp án cho Listening
        if q.KyNang.upper() != "LISTENING":
            random.shuffle(dap_an_list)
            
        results.append({
            "MaCauHoi": q.MaCauHoi,
            "KyNang": q.KyNang.upper(),
            "NoiDung": q.NoiDung,
            "DSDapAn": dap_an_list,
            "FileAudio": q.FileAudio
        })
        
    return {
        "total_questions": len(results),
        "time_limit_minutes": EXAM_CONFIG["time_limit_minutes"],
        "questions": results
    }

@router.post("/placement-submit")
def submit_placement_test(
    payload: dict, # expect {"answers": [{"MaCauHoi": "...", "CauTraLoi": "..."}, ...]}
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    existing_exam = db.query(models.BaiKiemTra).filter(
        models.BaiKiemTra.MaNguoiDung == current_user.MaNguoiDung,
        models.BaiKiemTra.LoaiBaiKiemTra == "DAU_VAO",
        models.BaiKiemTra.TrangThai == "COMPLETED"
    ).first()
    
    if existing_exam:
        raise HTTPException(status_code=400, detail="Bạn đã nộp bài test đầu vào rồi.")

    answers = payload.get("answers", [])
    if not answers:
        raise HTTPException(status_code=400, detail="Không nhận được đáp án nào.")
        
    # Query tất cả câu hỏi được submit
    cauhoi_ids = [ans["MaCauHoi"] for ans in answers]
    db_questions = db.query(models.NganHangCauHoi).filter(models.NganHangCauHoi.MaCauHoi.in_(cauhoi_ids)).all()
    
    q_map = {str(q.MaCauHoi): q for q in db_questions}
    
    stats = {
        "VOCABULARY": {"correct": 0, "total": 0},
        "GRAMMAR": {"correct": 0, "total": 0},
        "LISTENING": {"correct": 0, "total": 0}
    }
    
    detailed_results = []
    total_correct = 0
    
    for ans in answers:
        qid = str(ans["MaCauHoi"])
        user_ans = str(ans.get("CauTraLoi", "")).strip()
        if qid in q_map:
            q = q_map[qid]
            kynang = q.KyNang.upper() if q.KyNang.upper() in stats else "VOCABULARY" # fallback
            stats[kynang]["total"] += 1
            
            correct_val = q.DapAnDung.strip()
            correct_text = correct_val
            
            if isinstance(q.DSDapAn, dict):
                correct_text = q.DSDapAn.get(correct_val, correct_val).strip()
            elif isinstance(q.DSDapAn, list):
                for opt in q.DSDapAn:
                    opt_clean = opt.strip()
                    if opt_clean.startswith(f"({correct_val})") or opt_clean.startswith(f"{correct_val}.") or opt_clean.startswith(f"{correct_val})"):
                        correct_text = opt_clean
                        break
                        
            is_correct = (correct_text.lower() == user_ans.lower())
            
            if is_correct:
                stats[kynang]["correct"] += 1
                total_correct += 1
                
            dap_an_list = list(q.DSDapAn.values()) if isinstance(q.DSDapAn, dict) else list(q.DSDapAn)
            
            detailed_results.append({
                "MaCauHoi": q.MaCauHoi,
                "KyNang": q.KyNang.upper(),
                "NoiDung": q.NoiDung,
                "UserAnswer": user_ans,
                "CorrectAnswer": correct_text,
                "IsCorrect": is_correct,
                "GiaiThich": q.GiaiThich,
                "Transcript": q.NoiDung if q.KyNang.upper() == 'LISTENING' else None,
                "FileAudio": q.FileAudio,
                "DSDapAn": dap_an_list
            })
            
    percentages = {}
    for k, v in stats.items():
        percentages[k] = round((v["correct"] / v["total"]) * 100, 1) if v["total"] > 0 else 0
        
    overall_score = round((total_correct / len(answers)) * 100, 1) if answers else 0
    
    # Save to database
    exam = models.BaiKiemTra(
        MaNguoiDung=current_user.MaNguoiDung,
        LoaiBaiKiemTra="DAU_VAO",
        TrangThai="COMPLETED",
        TongDiem=overall_score
    )
    db.add(exam)
    db.flush()
    
    for k, pct in percentages.items():
        pkt = models.PhanKiemTra(
            MaBaiKiemTra=exam.MaBaiKiemTra,
            KyNang=k,
            PhanTramDiem=pct
        )
        db.add(pkt)
        
    for detail in detailed_results:
        chi_tiet = models.ChiTietLamBai(
            MaBaiKiemTra=exam.MaBaiKiemTra,
            MaCauHoi=detail["MaCauHoi"],
            LuaChon=detail["UserAnswer"],
            LaCauDung=detail["IsCorrect"],
            ThoiGianLamCauHoi=0 # optional
        )
        db.add(chi_tiet)
        
    # Also update user overall score
    current_user.DiemNangLuc = overall_score / 10 # Map to 10 point scale maybe
    db.commit()
    
    return {
        "exam_id": str(exam.MaBaiKiemTra),
        "total_score": overall_score,
        "total_correct": total_correct,
        "total_questions": len(answers),
        "percentages": percentages,
        "stats": stats,
        "details": detailed_results
    }

@router.get("/daily-review")
def get_daily_review(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Lấy 10 flashcards cần ôn tập hằng ngày.
    Ưu tiên thẻ đến hạn (NextDue) hoặc thẻ mới (Repetitions=0).
    """
    # 1. Kiểm tra xem user có bộ deck nào không
    user_decks = db.query(models.BoDTheFlashcard).filter(
        models.BoDTheFlashcard.MaNguoiDung == current_user.MaNguoiDung
    ).all()
    
    if not user_decks:
        return {
            "has_decks": False,
            "cards": [],
            "message": "Bạn chưa có bộ flashcard nào."
        }

    # 2. Lấy 10 thẻ từ các bộ của user
    # Dùng outerjoin đề phòng trường hợp thẻ chưa có bản ghi SR
    flashcards_review = db.query(models.TrangThaiSR, models.BoDTheFlashcard).outerjoin(
        models.TrangThaiSR, models.BoDTheFlashcard.MaBoDe == models.TrangThaiSR.MaBoDe
    ).filter(
        models.BoDTheFlashcard.MaNguoiDung == current_user.MaNguoiDung
    ).order_by(
        models.TrangThaiSR.NextDue.asc().nullsfirst(), # Ưu tiên thẻ chưa bao giờ học (NextDue is null)
        models.TrangThaiSR.EasinessFactor.asc()
    ).limit(30).all() # Lấy 30 thẻ để lọc ra 10 thẻ hợp lệ
    
    cards_to_review = []
    from api.flashcard_store import _coerce_card
    import json

    for sr, deck in flashcards_review:
        if len(cards_to_review) >= 10:
            break
            
        data = deck.DuLieuThe
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except:
                continue
        
        if not isinstance(data, list):
            continue
            
        # Nếu sr là None (do outerjoin), ta lấy index 0 hoặc tất cả thẻ trong deck đó
        # Nhưng thường TrangThaiSR mapping với từng index. 
        # Nếu SR bị thiếu, ta tự tạo card_index mặc định (giả sử index 0)
        idx = sr.IndexThe if sr else 0
        
        if len(data) > idx:
            card_data = data[idx]
            normalized_card = _coerce_card(card_data)
            
            cards_to_review.append({
                "deck_id": str(deck.MaBoDe),
                "deck_title": deck.TenBoDe,
                "card_index": idx,
                "card": normalized_card,
                "sr_state": {
                    "ef": sr.EasinessFactor if sr else 2.5,
                    "interval": sr.Interval if sr else 0,
                    "reps": sr.Repetitions if sr else 0,
                    "next_due": sr.NextDue.isoformat() if sr and sr.NextDue else datetime.utcnow().isoformat()
                }
            })
            
    return {
        "has_decks": True,
        "cards": cards_to_review
    }

@router.post("/daily-review-submit")
def submit_daily_review(
    payload: dict, # expect {"results": [{"deck_id": "...", "card_index": 0, "quality": 3}, ...]}
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    from api.flashcard_store import calculate_sm2
    results = payload.get("results", [])
    updated_count = 0
    
    for item in results:
        deck_id = item.get("deck_id")
        card_index = item.get("card_index")
        quality = item.get("quality") # 0 for "Chưa thuộc", 3 for "Đã thuộc" (mapped for SM2)
        
        if quality is None or deck_id is None or card_index is None:
            continue
            
        sr = db.query(models.TrangThaiSR).filter(
            models.TrangThaiSR.MaBoDe == deck_id,
            models.TrangThaiSR.IndexThe == card_index
        ).first()
        
        if sr:
            # Map quality: if user says "Đã thuộc" (quality 3), if "Chưa thuộc" (quality 0)
            res = calculate_sm2(sr.EasinessFactor, sr.Interval, sr.Repetitions, quality)
            sr.EasinessFactor = res["ef"]
            sr.Interval = res["interval"]
            sr.Repetitions = res["reps"]
            sr.NextDue = res["next_due"]
            updated_count += 1
            
    db.commit()
    return {"updated": updated_count}

@router.get("/section-test")
def get_section_test(
    type: str,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Tạo bài test theo kỹ năng (vocabulary, grammar, listening) hoặc final.
    """
    questions = []
    
    if type == "final":
        distribution = EXAM_CONFIG["distribution"]
    elif type == "vocabulary":
        distribution = [{"skill": "Vocabulary", "levels": {"1": 5, "2": 5, "3": 5}}]
    elif type == "grammar":
        distribution = [{"skill": "Grammar", "levels": {"1": 5, "2": 5, "3": 5}}]
    elif type == "listening":
        distribution = [{"skill": "Listening", "levels": {"1": 15, "2": 0, "3": 0}}]
    else:
        raise HTTPException(status_code=400, detail="Loại bài test không hợp lệ")

    for entry in distribution:
        skill = entry["skill"]
        for level, count in entry["levels"].items():
            if count == 0: continue
            
            query = db.query(models.NganHangCauHoi).filter(
                func.upper(models.NganHangCauHoi.KyNang) == skill.upper(),
                models.NganHangCauHoi.MucDo == str(level)
            )
            
            if skill.upper() == "LISTENING":
                query = query.filter(
                    models.NganHangCauHoi.FileAudio.isnot(None),
                    models.NganHangCauHoi.FileAudio != "",
                    models.NganHangCauHoi.FileAudio != "null"
                )
                
            qs = query.order_by(func.random()).limit(count).all()
            
            if len(qs) < count:
                missing = count - len(qs)
                fallback_query = db.query(models.NganHangCauHoi).filter(
                    func.upper(models.NganHangCauHoi.KyNang) == skill.upper(),
                    models.NganHangCauHoi.MucDo != str(level)
                )
                if skill.upper() == "LISTENING":
                    fallback_query = fallback_query.filter(
                        models.NganHangCauHoi.FileAudio.isnot(None),
                        models.NganHangCauHoi.FileAudio != "",
                        models.NganHangCauHoi.FileAudio != "null"
                    )
                fallback_qs = fallback_query.order_by(func.random()).limit(missing).all()
                qs.extend(fallback_qs)
                
            questions.extend(qs)

    results = []
    for q in questions:
        if isinstance(q.DSDapAn, dict):
            dap_an_list = list(q.DSDapAn.values())
        else:
            dap_an_list = list(q.DSDapAn)
        
        if q.KyNang.upper() != "LISTENING":
            random.shuffle(dap_an_list)
            
        results.append({
            "MaCauHoi": q.MaCauHoi,
            "KyNang": q.KyNang.upper(),
            "NoiDung": q.NoiDung,
            "DSDapAn": dap_an_list,
            "FileAudio": q.FileAudio
        })
        
    return {
        "total_questions": len(results),
        "time_limit_minutes": 15 if type != "final" else 30,
        "questions": results,
        "type": type
    }

@router.post("/section-submit")
def submit_section_test(
    payload: dict,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    type_test = payload.get("type", "final")
    answers = payload.get("answers", [])
    if not answers:
        raise HTTPException(status_code=400, detail="Không nhận được đáp án nào.")
        
    cauhoi_ids = [ans["MaCauHoi"] for ans in answers]
    db_questions = db.query(models.NganHangCauHoi).filter(models.NganHangCauHoi.MaCauHoi.in_(cauhoi_ids)).all()
    q_map = {str(q.MaCauHoi): q for q in db_questions}
    
    stats = {
        "VOCABULARY": {"correct": 0, "total": 0},
        "GRAMMAR": {"correct": 0, "total": 0},
        "LISTENING": {"correct": 0, "total": 0}
    }
    
    detailed_results = []
    total_correct = 0
    
    for ans in answers:
        qid = str(ans["MaCauHoi"])
        user_ans = str(ans.get("CauTraLoi", "")).strip()
        if qid in q_map:
            q = q_map[qid]
            kynang = q.KyNang.upper() if q.KyNang.upper() in stats else "VOCABULARY"
            stats[kynang]["total"] += 1
            
            correct_val = q.DapAnDung.strip()
            correct_text = correct_val
            
            if isinstance(q.DSDapAn, dict):
                correct_text = q.DSDapAn.get(correct_val, correct_val).strip()
            elif isinstance(q.DSDapAn, list):
                for opt in q.DSDapAn:
                    opt_clean = opt.strip()
                    if opt_clean.startswith(f"({correct_val})") or opt_clean.startswith(f"{correct_val}.") or opt_clean.startswith(f"{correct_val})"):
                        correct_text = opt_clean
                        break
                        
            is_correct = (correct_text.lower() == user_ans.lower())
            
            if is_correct:
                stats[kynang]["correct"] += 1
                total_correct += 1
                
            dap_an_list = list(q.DSDapAn.values()) if isinstance(q.DSDapAn, dict) else list(q.DSDapAn)
            
            detailed_results.append({
                "MaCauHoi": q.MaCauHoi,
                "KyNang": q.KyNang.upper(),
                "NoiDung": q.NoiDung,
                "UserAnswer": user_ans,
                "CorrectAnswer": correct_text,
                "IsCorrect": is_correct,
                "GiaiThich": q.GiaiThich,
                "Transcript": q.NoiDung if q.KyNang.upper() == 'LISTENING' else None,
                "FileAudio": q.FileAudio,
                "DSDapAn": dap_an_list
            })
            
    percentages = {}
    for k, v in stats.items():
        if v["total"] > 0:
            percentages[k] = round((v["correct"] / v["total"]) * 100, 1)
        
    overall_score = round((total_correct / len(answers)) * 100, 1) if answers else 0
    
    # Save exam
    exam_type = "FINAL" if type_test == "final" else f"TEST_{type_test.upper()}"
    exam = models.BaiKiemTra(
        MaNguoiDung=current_user.MaNguoiDung,
        LoaiBaiKiemTra=exam_type,
        TrangThai="COMPLETED",
        TongDiem=overall_score
    )
    db.add(exam)
    db.flush()
    
    for k, pct in percentages.items():
        pkt = models.PhanKiemTra(
            MaBaiKiemTra=exam.MaBaiKiemTra,
            KyNang=k,
            PhanTramDiem=pct
        )
        db.add(pkt)
        
    for detail in detailed_results:
        chi_tiet = models.ChiTietLamBai(
            MaBaiKiemTra=exam.MaBaiKiemTra,
            MaCauHoi=detail["MaCauHoi"],
            LuaChon=detail["UserAnswer"],
            LaCauDung=detail["IsCorrect"],
            ThoiGianLamCauHoi=0
        )
        db.add(chi_tiet)
    
    # Compare with placement test (DAU_VAO)
    baseline_exam = db.query(models.BaiKiemTra).filter(
        models.BaiKiemTra.MaNguoiDung == current_user.MaNguoiDung,
        models.BaiKiemTra.LoaiBaiKiemTra == "DAU_VAO",
        models.BaiKiemTra.TrangThai == "COMPLETED"
    ).order_by(models.BaiKiemTra.created_at.asc()).first()

    progress = {}
    if baseline_exam:
        baseline_pkts = db.query(models.PhanKiemTra).filter(models.PhanKiemTra.MaBaiKiemTra == baseline_exam.MaBaiKiemTra).all()
        baseline_percentages = {p.KyNang: p.PhanTramDiem for p in baseline_pkts}
        
        progress["overall"] = round(overall_score - baseline_exam.TongDiem, 1)
        for k, pct in percentages.items():
            baseline_pct = baseline_percentages.get(k, 0)
            progress[k] = round(pct - baseline_pct, 1)
    
    # Update user score if final test
    if type_test == "final":
        current_user.DiemNangLuc = overall_score / 10
        
    db.commit()
    
    return {
        "exam_id": str(exam.MaBaiKiemTra),
        "total_score": overall_score,
        "total_correct": total_correct,
        "total_questions": len(answers),
        "percentages": percentages,
        "stats": stats,
        "details": detailed_results,
        "progress": progress
    }
