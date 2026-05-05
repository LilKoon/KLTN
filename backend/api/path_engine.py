import uuid
import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import database, models, schemas
from api.auth import oauth2_scheme

router = APIRouter(prefix="/path", tags=["Hybrid Learning Path"])

# ─── Map skill key (from path_builder) → DB KyNang value ───────────────────
SKILL_KEY_MAP = {
    "GRAMMAR": "GRAMMAR",
    "LISTENING": "LISTENING",
    "VOCABULARY": "VOCABULARY",
    "VOCAB": "VOCABULARY",
}

# ─── Normalize CEFR sub-levels → DB level (A1/A2 → A, B1/B2 → B, C1/C2 → C) ─
def normalize_level(level: str) -> str:
    """Map path_builder levels (A1, A2, B1, B2, C1, C2) to DB levels (A, B, C)."""
    if not level:
        return "B"
    lvl = level.upper().strip()
    if lvl.startswith("A"):
        return "A"
    if lvl.startswith("B"):
        return "B"
    if lvl.startswith("C"):
        return "C"
    return lvl  # already A/B/C or unknown



def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    from jose import jwt, JWTError
    try:
        payload = jwt.decode(token, database.settings.SECRET_KEY, algorithms=[database.settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    user = db.query(models.NguoiDung).filter(models.NguoiDung.Email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def _find_bai_hoc_unused(db: Session, skill: str, level: str, used_ids: set) -> models.BaiHoc | None:
    """Tìm BaiHoc chưa dùng trong path hiện tại, theo skill + level."""
    db_skill = SKILL_KEY_MAP.get(skill.upper(), skill.upper())
    db_level = normalize_level(level)
    candidates = (
        db.query(models.BaiHoc)
        .join(models.KhoaHoc, models.BaiHoc.MaKhoaHoc == models.KhoaHoc.MaKhoaHoc)
        .filter(
            models.BaiHoc.KyNang == db_skill,
            models.KhoaHoc.MucDo == db_level,
            models.BaiHoc.TrangThai == "ACTIVE",
        )
        .all()
    )
    unused = [b for b in candidates if b.MaBaiHoc not in used_ids]
    if unused:
        return random.choice(unused)
    return random.choice(candidates) if candidates else None





@router.get("/stats")
def get_learning_stats(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    """Thống kê toàn diện tiến độ học tập của user cho trang Profile."""
    from sqlalchemy import func

    # ── 1. Lộ trình hiện tại ──────────────────────────────────────────────────
    lo_trinh = db.query(models.LoTrinhCaNhan).filter(
        models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
        models.LoTrinhCaNhan.TrangThai == "ACTIVE",
    ).first()

    path_stats = {"total": 0, "completed": 0, "current": 0, "locked": 0,
                  "progress_pct": 0, "level": "—"}
    skill_breakdown = {"GRAMMAR": {"completed": 0, "total": 0},
                       "VOCABULARY": {"completed": 0, "total": 0},
                       "LISTENING": {"completed": 0, "total": 0}}
    review_history = []

    if lo_trinh:
        nodes = db.query(models.TrangThaiNode).filter(
            models.TrangThaiNode.MaLoTrinh == lo_trinh.MaLoTrinh
        ).order_by(models.TrangThaiNode.ThuTu).all()

        total = len(nodes)
        completed = sum(1 for n in nodes if n.TrangThai == "COMPLETED")
        current_n = next((n for n in nodes if n.TrangThai == "CURRENT"), None)

        path_stats = {
            "total": total,
            "completed": completed,
            "current": sum(1 for n in nodes if n.TrangThai == "CURRENT"),
            "locked": sum(1 for n in nodes if n.TrangThai == "LOCKED"),
            "progress_pct": round(completed / total * 100) if total else 0,
            "level": (nodes[0].NoiDungBoost or {}).get("target_level", "—") if nodes else "—",
        }

        # Phân tích từng skill (chỉ CORE nodes)
        for node in nodes:
            if node.LoaiNode != "CORE":
                continue
            skill = (node.NoiDungBoost or {}).get("skill", "")
            if skill in skill_breakdown:
                skill_breakdown[skill]["total"] += 1
                if node.TrangThai == "COMPLETED":
                    skill_breakdown[skill]["completed"] += 1

        # Lịch sử REVIEW
        for node in nodes:
            if node.LoaiNode in ("REVIEW", "FINAL_TEST") and node.DiemOntap is not None:
                review_history.append({
                    "loai": node.LoaiNode,
                    "tieu_de": node.TieuDe,
                    "diem": round((node.DiemOntap or 0) * 100),
                    "so_lan_thu": node.SoLanThu or 0,
                    "trang_thai": node.TrangThai,
                })

    # ── 2. Điểm Placement Test (lần gần nhất) ──────────────────────────────────
    placement = db.query(models.BaiKiemTra).filter(
        models.BaiKiemTra.MaNguoiDung == current_user.MaNguoiDung,
        models.BaiKiemTra.LoaiBaiKiemTra == "PLACEMENT",
    ).order_by(models.BaiKiemTra.created_at.desc()).first()

    placement_scores = {}
    if placement:
        sections = db.query(models.PhanKiemTra).filter(
            models.PhanKiemTra.MaBaiKiemTra == placement.MaBaiKiemTra
        ).all()
        placement_scores = {s.KyNang: round(s.PhanTramDiem or 0, 1) for s in sections}

    # ── 3. Tổng số lần đã làm bài tập ──────────────────────────────────────────
    total_attempts = db.query(func.count(models.BaiKiemTra.MaBaiKiemTra)).filter(
        models.BaiKiemTra.MaNguoiDung == current_user.MaNguoiDung
    ).scalar() or 0

    # ── 4. Số trạm hoàn thành hôm nay (streak proxy) ───────────────────────────
    from datetime import datetime, date
    # Đơn giản: đếm completed nodes (không có timestamp, dùng tổng)
    completed_total = path_stats["completed"]

    return {
        "path": path_stats,
        "skill_breakdown": skill_breakdown,
        "review_history": review_history,
        "placement_scores": placement_scores,
        "total_quiz_attempts": total_attempts,
        "completed_nodes_total": completed_total,
        "user_name": current_user.TenNguoiDung,
    }


@router.get("/current", response_model=schemas.LoTrinhCaNhanResponse)
def get_current_path(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Lấy Cây Lộ Trình học tập đang Active của User."""
    lo_trinh = db.query(models.LoTrinhCaNhan).filter(
        models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
        models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
    ).first()
    if not lo_trinh:
        raise HTTPException(status_code=404, detail="AI chưa tạo hoặc chưa thi định vị Khóa học.")
    return lo_trinh


@router.get("/current/nodes")
def get_current_path_nodes(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Trả về nodes có bai_hoc_title, skill, level để LearningPath hiển thị đúng tên topic."""
    lo_trinh = db.query(models.LoTrinhCaNhan).filter(
        models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
        models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
    ).first()
    if not lo_trinh:
        raise HTTPException(status_code=404, detail="Chưa có lộ trình.")

    nodes = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaLoTrinh == lo_trinh.MaLoTrinh
    ).order_by(models.TrangThaiNode.ThuTu).all()

    result = []
    for node in nodes:
        boost = node.NoiDungBoost or {}
        skill_vi = boost.get("skill_vi", "")
        target_level = normalize_level(boost.get("target_level", "B"))
        skill = boost.get("skill", "")

        bai_hoc = node.bai_hoc
        bai_hoc_title = None
        if bai_hoc:
            bai_hoc_title = bai_hoc.ChuDe or bai_hoc.TenBaiHoc
        else:
            # Chưa resolve — dùng skill_vi + level làm placeholder
            bai_hoc_title = f"{skill_vi} · Cấp {target_level}" if skill_vi else None

        result.append({
            "MaNode": str(node.MaNode),
            "ThuTu": node.ThuTu,
            "TrangThai": node.TrangThai,
            "LoaiNode": node.LoaiNode,
            "bai_hoc_title": bai_hoc_title,
            "skill": skill,
            "skill_vi": skill_vi,
            "level": target_level,
            "MaBaiHoc": str(node.MaBaiHoc) if node.MaBaiHoc else None,
        })

    return {
        "MaLoTrinh": str(lo_trinh.MaLoTrinh),
        "TrangThai": lo_trinh.TrangThai,
        "nodes": result,
    }



@router.post("/generate", response_model=schemas.LoTrinhCaNhanResponse)
def generate_personalized_path(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Sinh learning path bằng rules-based engine dựa trên điểm placement test."""
    latest_test = db.query(models.BaiKiemTra).filter(
        models.BaiKiemTra.MaNguoiDung == current_user.MaNguoiDung,
        models.BaiKiemTra.LoaiBaiKiemTra == 'DAU_VAO',
        models.BaiKiemTra.TrangThai == 'COMPLETED',
    ).order_by(models.BaiKiemTra.created_at.desc()).first()

    if not latest_test:
        raise HTTPException(
            status_code=400,
            detail="Vui lòng hoàn thành bài test đầu vào trước khi tạo lộ trình.",
        )

    pkts = db.query(models.PhanKiemTra).filter(
        models.PhanKiemTra.MaBaiKiemTra == latest_test.MaBaiKiemTra
    ).all()
    pct = {p.KyNang.upper(): (p.PhanTramDiem or 0.0) for p in pkts}
    g = pct.get("GRAMMAR", 0.0) / 10.0
    l = pct.get("LISTENING", 0.0) / 10.0
    v = pct.get("VOCABULARY", 0.0) / 10.0

    from learning_engine import get_engine, build_learning_path
    from learning_engine.path_builder import overall_to_level
    level = overall_to_level((g + l + v) / 3.0)
    pred = get_engine().predict({"level": level, "grammar": g, "listening": l, "vocab": v})
    path_nodes = build_learning_path(pred, level)

    # Xoá lộ trình cũ
    db.query(models.LoTrinhCaNhan).filter(
        models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung
    ).delete(synchronize_session=False)
    db.flush()

    new_path = models.LoTrinhCaNhan(
        MaLoTrinh=uuid.uuid4(),
        MaNguoiDung=current_user.MaNguoiDung,
        TrangThai='ACTIVE',
    )
    db.add(new_path)
    db.flush()

    # Tạo nodes — REVIEW/FINAL_TEST không link BaiHoc
    used_bai_hoc_ids = set()
    for n in path_nodes:
        skill_key = n.get("skill", "GRAMMAR")
        target_level = n.get("target_level", level)
        node_kind = n.get("kind", "CORE")

        if node_kind in ("REVIEW", "FINAL_TEST"):
            ma_bai_hoc = None
        else:
            bai_hoc = _find_bai_hoc_unused(db, skill_key, normalize_level(target_level), used_bai_hoc_ids)
            if bai_hoc:
                used_bai_hoc_ids.add(bai_hoc.MaBaiHoc)
                ma_bai_hoc = bai_hoc.MaBaiHoc
            else:
                ma_bai_hoc = None

        db.add(models.TrangThaiNode(
            MaNode=uuid.uuid4(),
            MaLoTrinh=new_path.MaLoTrinh,
            MaBaiHoc=ma_bai_hoc,
            TieuDe=n["title"],
            MoTa=n["description"],
            ThuTu=n["thu_tu"],
            LoaiNode=node_kind,
            TrangThai='CURRENT' if n["thu_tu"] == 1 else 'LOCKED',
            NoiDungBoost={
                "skill": n["skill"],
                "skill_vi": n["skill_vi"],
                "target_level": target_level,
                "weight": n["weight"],
                "is_weak": n["is_weak"],
                "exercises_count": n["exercises_count"],
            },
        ))

    db.commit()
    db.refresh(new_path)
    return new_path


@router.post("/reset")
def reset_learning_path(
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Xóa lộ trình hiện tại, reset điểm năng lực."""
    db.query(models.LoTrinhCaNhan).filter(
        models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung
    ).delete()
    current_user.DiemNangLuc = 0.0
    db.commit()
    return {"message": "Lộ trình đã bị hủy. Bạn có thể làm lại bài Test định vị."}


@router.get("/node/{ma_node}")
def get_node_detail(
    ma_node: str,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Trả về thông tin node + BaiHoc đầy đủ (lý thuyết, skill, audio...)."""
    node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaNode == ma_node,
        models.TrangThaiNode.MaLoTrinh.in_(
            db.query(models.LoTrinhCaNhan.MaLoTrinh).filter(
               models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
               models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
            )
        )
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node không tồn tại")

    bai_hoc = node.bai_hoc

    # ── Auto-resolve: nếu node chưa link BaiHoc (lộ trình cũ),
    #    tự tìm BaiHoc phù hợp từ NoiDungBoost skill + level ─────────────────
    if bai_hoc is None and node.NoiDungBoost:
        boost_skill = node.NoiDungBoost.get("skill", "")
        boost_level = normalize_level(node.NoiDungBoost.get("target_level", "B"))
        db_skill = SKILL_KEY_MAP.get(boost_skill.upper(), boost_skill.upper())

        # Lấy các MaBaiHoc đã dùng bởi các node KHÁC trong cùng path
        used_ids = set(
            r[0] for r in db.query(models.TrangThaiNode.MaBaiHoc)
            .filter(
                models.TrangThaiNode.MaLoTrinh == node.MaLoTrinh,
                models.TrangThaiNode.MaNode != node.MaNode,
                models.TrangThaiNode.MaBaiHoc.isnot(None),
            ).all()
        )

        # Lấy tất cả BaiHoc phù hợp skill + level
        candidates = (
            db.query(models.BaiHoc)
            .join(models.KhoaHoc, models.BaiHoc.MaKhoaHoc == models.KhoaHoc.MaKhoaHoc)
            .filter(
                models.BaiHoc.KyNang == db_skill,
                models.KhoaHoc.MucDo == boost_level,
                models.BaiHoc.TrangThai == "ACTIVE",
            )
            .order_by(models.BaiHoc.ThuTu)
            .all()
        )

        # Ưu tiên chưa dùng, nếu hết thì dùng lại theo thứ tự
        unused = [b for b in candidates if b.MaBaiHoc not in used_ids]
        bai_hoc = unused[0] if unused else (candidates[0] if candidates else None)

        # Ghi lại vào node để các lần sau không cần resolve nữa
        if bai_hoc:
            node.MaBaiHoc = bai_hoc.MaBaiHoc
            db.commit()


    bai_hoc_data = None
    if bai_hoc:
        bai_hoc_data = {
            "MaBaiHoc": str(bai_hoc.MaBaiHoc),
            "TenBaiHoc": bai_hoc.TenBaiHoc,
            "KyNang": bai_hoc.KyNang,
            "ChuDe": bai_hoc.ChuDe,
            "FileAudio": bai_hoc.FileAudio,
            "NoiDungLyThuyet": bai_hoc.NoiDungLyThuyet,
            "TrangThai": bai_hoc.TrangThai,
        }

    skill = None
    level = None
    if bai_hoc and bai_hoc.KyNang:
        skill = bai_hoc.KyNang
        if bai_hoc.khoa_hoc:
            level = bai_hoc.khoa_hoc.MucDo
    elif node.NoiDungBoost:
        skill = node.NoiDungBoost.get("skill")
        level = normalize_level(node.NoiDungBoost.get("target_level", "B"))

    return {
        "node": {
            "MaNode": str(node.MaNode),
            "TieuDe": node.TieuDe,
            "MoTa": node.MoTa,
            "ThuTu": node.ThuTu,
            "LoaiNode": node.LoaiNode,
            "TrangThai": node.TrangThai,
            "NoiDungBoost": node.NoiDungBoost,
            "skill": skill,
            "level": level,
        },
        "bai_hoc": bai_hoc_data,
    }


@router.post("/node/{ma_node}/complete")
def complete_node(
    ma_node: str,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Hoàn thành CORE node (không dùng cho REVIEW/FINAL_TEST)."""
    node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaNode == ma_node,
        models.TrangThaiNode.MaLoTrinh.in_(
            db.query(models.LoTrinhCaNhan.MaLoTrinh).filter(
               models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
               models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
            )
        )
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node không tồn tại trong lộ trình.")
    if node.LoaiNode in ('REVIEW', 'FINAL_TEST'):
        raise HTTPException(status_code=400, detail="Dùng endpoint /review/submit hoặc /final-test/submit.")

    node.TrangThai = 'COMPLETED'
    next_node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaLoTrinh == node.MaLoTrinh,
        models.TrangThaiNode.ThuTu > node.ThuTu
    ).order_by(models.TrangThaiNode.ThuTu).first()
    if next_node and next_node.TrangThai == 'LOCKED':
        next_node.TrangThai = 'CURRENT'
    db.commit()
    return {"message": "Hoàn tất bài học. Node tiếp theo đã được mở!"}


@router.get("/node/{ma_node}/review")
def get_review_questions(
    ma_node: str,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Lấy 10 câu hỏi ôn tập từ 3 CORE node ngay trước REVIEW node."""
    node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaNode == ma_node,
        models.TrangThaiNode.MaLoTrinh.in_(
            db.query(models.LoTrinhCaNhan.MaLoTrinh).filter(
               models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
               models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
            )
        )
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node không tồn tại.")
    if node.LoaiNode != 'REVIEW':
        raise HTTPException(status_code=400, detail="Node này không phải REVIEW.")

    # Lấy 3 CORE nodes ngay trước (ThuTu < node.ThuTu, desc limit 3)
    prev_cores = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaLoTrinh == node.MaLoTrinh,
        models.TrangThaiNode.ThuTu < node.ThuTu,
        models.TrangThaiNode.LoaiNode == 'CORE',
    ).order_by(models.TrangThaiNode.ThuTu.desc()).limit(3).all()

    # Thu thập câu hỏi từ các BaiHoc đó
    all_questions = []
    for core in prev_cores:
        if core.MaBaiHoc:
            qs = db.query(models.NganHangCauHoi).filter(
                models.NganHangCauHoi.MaBaiHoc == core.MaBaiHoc
            ).all()
            all_questions.extend(qs)

    # Fallback: skill+level nếu không có
    if not all_questions and node.NoiDungBoost:
        boost_level = normalize_level(node.NoiDungBoost.get("target_level", "B"))
        all_questions = db.query(models.NganHangCauHoi).filter(
            models.NganHangCauHoi.MucDo == boost_level
        ).all()

    selected = random.sample(all_questions, min(10, len(all_questions))) if all_questions else []
    result = []
    for q in selected:
        ds = q.DSDapAn if isinstance(q.DSDapAn, dict) else {}
        opts = list(ds.values())
        random.shuffle(opts)
        letter = (q.DapAnDung or '').strip().upper()
        correct_text = ds.get(letter, letter)
        result.append({
            "MaCauHoi": str(q.MaCauHoi),
            "KyNang": q.KyNang,
            "NoiDung": q.NoiDung,
            "DapAn": opts,
            "DapAnDung": correct_text,
            "GiaiThich": q.GiaiThich,
            "FileAudio": q.FileAudio,
        })
    return {
        "node": {"MaNode": ma_node, "TieuDe": node.TieuDe, "SoLanThu": node.SoLanThu or 0},
        "questions": result,
    }


@router.post("/node/{ma_node}/review/submit")
def submit_review(
    ma_node: str,
    payload: dict,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Nộp kết quả REVIEW. Pass >= 80% → mở node tiếp. Fail → cho làm lại."""
    node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaNode == ma_node,
        models.TrangThaiNode.MaLoTrinh.in_(
            db.query(models.LoTrinhCaNhan.MaLoTrinh).filter(
               models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
               models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
            )
        )
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node không tồn tại.")

    score = int(payload.get("score", 0))
    total = int(payload.get("total", 10))
    ratio = score / total if total > 0 else 0
    passed = ratio >= 0.8

    node.DiemOntap = ratio
    node.SoLanThu = (node.SoLanThu or 0) + 1

    if passed:
        node.TrangThai = 'COMPLETED'
        next_node = db.query(models.TrangThaiNode).filter(
            models.TrangThaiNode.MaLoTrinh == node.MaLoTrinh,
            models.TrangThaiNode.ThuTu > node.ThuTu
        ).order_by(models.TrangThaiNode.ThuTu).first()
        if next_node and next_node.TrangThai == 'LOCKED':
            next_node.TrangThai = 'CURRENT'
    db.commit()
    return {
        "passed": passed,
        "score": score,
        "total": total,
        "ratio": round(ratio * 100),
        "so_lan_thu": node.SoLanThu,
        "message": "Xuất sắc! Bạn đã vượt qua trạm ôn tập." if passed else f"Chưa đạt 80% (đạt {round(ratio*100)}%). Hãy thử lại!",
    }


@router.get("/node/{ma_node}/final-test")
def get_final_test_questions(
    ma_node: str,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Lấy 15 câu hỏi FINAL TEST (5 Grammar + 5 Vocab + 5 Listening)."""
    node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaNode == ma_node,
        models.TrangThaiNode.MaLoTrinh.in_(
            db.query(models.LoTrinhCaNhan.MaLoTrinh).filter(
               models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
               models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
            )
        )
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node không tồn tại.")
    if node.LoaiNode != 'FINAL_TEST':
        raise HTTPException(status_code=400, detail="Node này không phải FINAL_TEST.")

    target_level = normalize_level((node.NoiDungBoost or {}).get("target_level", "B"))
    result = []
    for skill_key, count in [("GRAMMAR", 5), ("VOCABULARY", 5), ("LISTENING", 5)]:
        qs = db.query(models.NganHangCauHoi).filter(
            models.NganHangCauHoi.KyNang == skill_key,
            models.NganHangCauHoi.MucDo == target_level,
        ).all()
        selected = random.sample(qs, min(count, len(qs))) if qs else []
        for q in selected:
            ds = q.DSDapAn if isinstance(q.DSDapAn, dict) else {}
            opts = list(ds.values())
            random.shuffle(opts)
            letter = (q.DapAnDung or '').strip().upper()
            result.append({
                "MaCauHoi": str(q.MaCauHoi),
                "KyNang": q.KyNang,
                "NoiDung": q.NoiDung,
                "DapAn": opts,
                "DapAnDung": ds.get(letter, letter),
                "GiaiThich": q.GiaiThich,
                "FileAudio": q.FileAudio,
            })
    random.shuffle(result)
    return {"node": {"MaNode": ma_node, "TieuDe": node.TieuDe}, "questions": result}


@router.post("/node/{ma_node}/final-test/submit")
def submit_final_test(
    ma_node: str,
    payload: dict,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """
    Nộp kết quả FINAL TEST.
    payload: {"scores": {"GRAMMAR": 0-5, "VOCABULARY": 0-5, "LISTENING": 0-5}}
    → Mark FINAL_TEST COMPLETED → sinh lộ trình mới.
    """
    node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaNode == ma_node,
        models.TrangThaiNode.MaLoTrinh.in_(
            db.query(models.LoTrinhCaNhan.MaLoTrinh).filter(
               models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
               models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
            )
        )
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node không tồn tại.")

    raw_scores = payload.get("scores", {})
    g = (raw_scores.get("GRAMMAR", 0) / 5.0) * 10
    l = (raw_scores.get("LISTENING", 0) / 5.0) * 10
    v = (raw_scores.get("VOCABULARY", 0) / 5.0) * 10
    overall = (g + l + v) / 3.0

    node.TrangThai = 'COMPLETED'
    node.DiemOntap = overall / 10.0
    node.SoLanThu = (node.SoLanThu or 0) + 1

    # Mark path COMPLETED
    lo_trinh = db.query(models.LoTrinhCaNhan).filter(
        models.LoTrinhCaNhan.MaLoTrinh == node.MaLoTrinh
    ).first()
    if lo_trinh:
        lo_trinh.TrangThai = 'COMPLETED'
    db.commit()

    # Sinh lộ trình tiếp theo
    from learning_engine import get_engine, build_learning_path
    from learning_engine.path_builder import overall_to_level
    level = overall_to_level(overall)
    pred = get_engine().predict({"level": level, "grammar": g/10, "listening": l/10, "vocab": v/10})
    path_nodes = build_learning_path(pred, level)

    new_path = models.LoTrinhCaNhan(
        MaLoTrinh=uuid.uuid4(),
        MaNguoiDung=current_user.MaNguoiDung,
        TrangThai='ACTIVE',
    )
    db.add(new_path)
    db.flush()

    used_ids: set = set()
    for n in path_nodes:
        skill_key = n.get("skill", "GRAMMAR")
        target_level = n.get("target_level", level)
        node_kind = n.get("kind", "CORE")
        if node_kind in ("REVIEW", "FINAL_TEST"):
            ma_bai_hoc = None
        else:
            bh = _find_bai_hoc_unused(db, skill_key, normalize_level(target_level), used_ids)
            ma_bai_hoc = bh.MaBaiHoc if bh else None
            if bh:
                used_ids.add(bh.MaBaiHoc)
        db.add(models.TrangThaiNode(
            MaNode=uuid.uuid4(),
            MaLoTrinh=new_path.MaLoTrinh,
            MaBaiHoc=ma_bai_hoc,
            TieuDe=n["title"], MoTa=n["description"],
            ThuTu=n["thu_tu"], LoaiNode=node_kind,
            TrangThai='CURRENT' if n["thu_tu"] == 1 else 'LOCKED',
            NoiDungBoost={"skill": n["skill"], "skill_vi": n["skill_vi"],
                         "target_level": target_level, "exercises_count": n["exercises_count"],
                         "weight": n["weight"], "is_weak": n["is_weak"]},
        ))
    db.commit()

    return {
        "passed": True,
        "overall": round(overall, 1),
        "breakdown": {"GRAMMAR": round(g, 1), "VOCABULARY": round(v, 1), "LISTENING": round(l, 1)},
        "new_level": level,
        "next_path_generated": True,
        "message": f"Xuất sắc! Lộ trình giai đoạn tiếp theo (Cấp {level}) đã được tạo!",
    }


@router.get("/node/{ma_node}/exercises")
def get_node_exercises(
    ma_node: str,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Lấy bài tập đúng skill + level của node."""
    node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaNode == ma_node,
        models.TrangThaiNode.MaLoTrinh.in_(
            db.query(models.LoTrinhCaNhan.MaLoTrinh).filter(
               models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
               models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
            )
        )
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node không tồn tại")

    bai_hoc = node.bai_hoc

    # Auto-resolve nếu chưa link (giống get_node_detail)
    if bai_hoc is None and node.NoiDungBoost:
        boost_skill = node.NoiDungBoost.get("skill", "")
        boost_level = normalize_level(node.NoiDungBoost.get("target_level", "B"))
        db_skill = SKILL_KEY_MAP.get(boost_skill.upper(), boost_skill.upper())
        bai_hoc = (
            db.query(models.BaiHoc)
            .join(models.KhoaHoc, models.BaiHoc.MaKhoaHoc == models.KhoaHoc.MaKhoaHoc)
            .filter(
                models.BaiHoc.KyNang == db_skill,
                models.KhoaHoc.MucDo == boost_level,
                models.BaiHoc.TrangThai == "ACTIVE",
            )
            .order_by(models.BaiHoc.ThuTu)
            .first()
        )

    skill = None
    level = None
    file_audio = None

    if bai_hoc and bai_hoc.KyNang:
        skill = bai_hoc.KyNang
        file_audio = bai_hoc.FileAudio
        if bai_hoc.khoa_hoc:
            level = bai_hoc.khoa_hoc.MucDo
    elif node.NoiDungBoost:
        skill = SKILL_KEY_MAP.get(
            (node.NoiDungBoost.get("skill") or "").upper(),
            node.NoiDungBoost.get("skill")
        )
        level = normalize_level(node.NoiDungBoost.get("target_level", "B"))

    # Ưu tiên lấy câu hỏi gắn với BaiHoc cụ thể (đúng chủ đề lý thuyết)
    ma_bai_hoc = bai_hoc.MaBaiHoc if bai_hoc else None
    if ma_bai_hoc:
        q_query = db.query(models.NganHangCauHoi).filter(
            models.NganHangCauHoi.MaBaiHoc == ma_bai_hoc
        )
    else:
        # Fallback: lọc theo skill + level
        q_query = db.query(models.NganHangCauHoi)
        if skill:
            q_query = q_query.filter(models.NganHangCauHoi.KyNang == skill)
        if level:
            q_query = q_query.filter(models.NganHangCauHoi.MucDo == level)
        if file_audio and skill == "LISTENING":
            q_query = q_query.filter(models.NganHangCauHoi.FileAudio == file_audio)

    all_questions = q_query.all()

    ex_count = 5
    if node.NoiDungBoost:
        ex_count = node.NoiDungBoost.get("exercises_count", 5)
    if skill == "LISTENING":
        ex_count = min(3, len(all_questions))

    selected = random.sample(all_questions, min(ex_count, len(all_questions))) if all_questions else []

    result = []
    for q in selected:
        ds_dap_an = q.DSDapAn if isinstance(q.DSDapAn, dict) else {}
        options = list(ds_dap_an.values()) if ds_dap_an else list(q.DSDapAn)
        random.shuffle(options)
        # Resolve 'B' -> 'fear' (actual answer text)
        letter = (q.DapAnDung or '').strip().upper()
        correct_text = ds_dap_an.get(letter, letter)
        result.append({
            "MaCauHoi": str(q.MaCauHoi),
            "NoiDung": q.NoiDung,
            "DapAn": options,
            "DapAnDung": correct_text,
            "GiaiThich": q.GiaiThich,
            "FileAudio": q.FileAudio,
        })
    return result


@router.get("/node/{ma_node}/checkpoint")
def get_checkpoint_test(
    ma_node: str,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaNode == ma_node,
        models.TrangThaiNode.MaLoTrinh.in_(
            db.query(models.LoTrinhCaNhan.MaLoTrinh).filter(
               models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
               models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
            )
        )
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node không tồn tại")

    skill = None
    level = None
    if node.bai_hoc and node.bai_hoc.KyNang:
        skill = node.bai_hoc.KyNang
        if node.bai_hoc.khoa_hoc:
            level = node.bai_hoc.khoa_hoc.MucDo
    elif node.NoiDungBoost:
        skill = SKILL_KEY_MAP.get((node.NoiDungBoost.get("skill") or "").upper())
        level = node.NoiDungBoost.get("target_level")

    q_query = db.query(models.NganHangCauHoi)
    if skill:
        q_query = q_query.filter(models.NganHangCauHoi.KyNang == skill)
    if level:
        q_query = q_query.filter(models.NganHangCauHoi.MucDo == level)

    questions = q_query.all()
    selected_questions = random.sample(questions, min(5, len(questions)))

    result = []
    for q in selected_questions:
        ds_dap_an = q.DSDapAn if isinstance(q.DSDapAn, dict) else {}
        dap_an = list(ds_dap_an.values()) if ds_dap_an else list(q.DSDapAn)
        random.shuffle(dap_an)
        letter = (q.DapAnDung or '').strip().upper()
        correct_text = ds_dap_an.get(letter, letter)
        result.append({
            "MaCauHoi": str(q.MaCauHoi),
            "NoiDung": q.NoiDung,
            "DapAn": dap_an,
            "DapAnDung": correct_text,
            "GiaiThich": q.GiaiThich,
        })
    return result


@router.post("/node/{ma_node}/checkpoint")
def submit_checkpoint_test(
    ma_node: str,
    payload: schemas.TestSubmitRequest,
    current_user: models.NguoiDung = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    node = db.query(models.TrangThaiNode).filter(
        models.TrangThaiNode.MaNode == ma_node,
        models.TrangThaiNode.MaLoTrinh.in_(
            db.query(models.LoTrinhCaNhan.MaLoTrinh).filter(
               models.LoTrinhCaNhan.MaNguoiDung == current_user.MaNguoiDung,
               models.LoTrinhCaNhan.TrangThai == 'ACTIVE'
            )
        )
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node không tồn tại")

    correct_count = 0
    total_q = len(payload.answers)
    for ans in payload.answers:
        q = db.query(models.NganHangCauHoi).filter(models.NganHangCauHoi.MaCauHoi == str(ans.MaCauHoi)).first()
        if q and q.DapAnDung.strip() == ans.CauTraLoi.strip():
            correct_count += 1

    score = (correct_count / total_q) * 10 if total_q > 0 else 0
    passed = score >= 8.0

    if passed:
        node.TrangThai = 'COMPLETED'
        next_node = db.query(models.TrangThaiNode).filter(
            models.TrangThaiNode.MaLoTrinh == node.MaLoTrinh,
            models.TrangThaiNode.ThuTu > node.ThuTu
        ).order_by(models.TrangThaiNode.ThuTu).first()
        if next_node and next_node.TrangThai == 'LOCKED':
            next_node.TrangThai = 'CURRENT'
        db.commit()

    return {
        "DiemSo": score,
        "XepLoai": "PASS" if passed else "FAIL",
        "TinNhan": "Chúc mừng bạn đã vượt qua." if passed else "Chưa đạt 80% yêu cầu. AI gợi ý bạn xem lại toàn bộ lý thuyết."
    }
