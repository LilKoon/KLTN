"""
roadmap_service.py — Business logic sinh lộ trình học cá nhân hóa.

Flow:
  1. Đọc PhanKiemTra (VOCAB%, GRAMMAR%, LISTENING%) từ bài DAU_VAO
  2. Phân loại từng kỹ năng: WEAK / MEDIUM / STRONG
  3. Tính Level tổng → chọn KhoaHoc phù hợp
  4. Sắp xếp node theo thứ tự ưu tiên (yếu nhất học trước)
  5. Tạo LoTrinhHoc + TrangThaiNode vào DB
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.models import (
    PhanKiemTra, BaiKiemTra,
    KhoaHoc, NodeKhoaHoc, BaiHoc,
    LoTrinhHoc, TrangThaiNode
)
from datetime import datetime, timezone
import uuid


# ─── Bảng phân loại trình độ ─────────────────────────────────────────────

SKILL_MAP = {
    # tên kỹ năng trong DB → LoaiBaiHoc trong BaiHoc
    "VOCAB":     "VOCABULARIES",
    "VOCABULARY": "VOCABULARIES",
    "GRAMMAR":   "GRAMMAR",
    "LISTENING": "LISTENING",
}

LEVEL_BY_MUCDO = {
    "BEGINNER":     1,
    "INTERMEDIATE": 2,
    "ADVANCED":     3,
}

MUCDO_BY_AVG = [
    (40,  "BEGINNER"),       # avg < 40%  → BEGINNER
    (70,  "INTERMEDIATE"),   # 40 ≤ avg < 70% → INTERMEDIATE
    (101, "ADVANCED"),       # avg ≥ 70%  → ADVANCED
]


def classify_skill(pct: float) -> str:
    """Phân loại kỹ năng theo % đúng."""
    if pct < 40:
        return "WEAK"
    elif pct < 70:
        return "MEDIUM"
    else:
        return "STRONG"


def determine_mucdo(avg_pct: float) -> str:
    """Xác định MucDo KhoaHoc dựa trên điểm trung bình."""
    for threshold, mucdo in MUCDO_BY_AVG:
        if avg_pct < threshold:
            return mucdo
    return "INTERMEDIATE"


def sort_skills_by_priority(skill_pcts: dict) -> list:
    """
    Sắp xếp kỹ năng theo thứ tự ưu tiên: yếu nhất học trước.
    Khi điểm bằng nhau, ưu tiên thứ tự mặc định: GRAMMAR → LISTENING → VOCABULARIES.
    Trả về list LoaiBaiHoc đã sắp xếp.
    """
    # Thứ tự mặc định khi điểm bằng nhau
    DEFAULT_ORDER = {"GRAMMAR": 0, "LISTENING": 1, "VOCABULARIES": 2}

    # Normalize tên skill → LoaiBaiHoc
    normalized = {}
    for skill, pct in skill_pcts.items():
        loai = SKILL_MAP.get(skill.upper(), skill.upper())
        # Nếu trùng loại (VOCAB & VOCABULARY), lấy điểm thấp hơn
        if loai not in normalized or pct < normalized[loai]:
            normalized[loai] = pct

    # Sắp xếp: ưu tiên theo điểm (tăng dần), tie-break theo DEFAULT_ORDER
    sorted_skills = sorted(
        normalized.items(),
        key=lambda x: (x[1], DEFAULT_ORDER.get(x[0], 99))
    )
    return [s[0] for s in sorted_skills]  # chỉ trả tên


# ─── Hàm chính: Sinh lộ trình ─────────────────────────────────────────────

async def generate_roadmap(db: AsyncSession, user_id: str, exam_id: str) -> dict:
    """
    Sinh lộ trình học cá nhân hóa cho user sau khi hoàn thành bài DAU_VAO.

    Returns:
        dict với roadmap_id, course_info, nodes (danh sách node theo thứ tự)
    """
    uid = uuid.UUID(user_id)
    eid = uuid.UUID(exam_id)

    # 0. Kiểm tra bài thi tồn tại và đã COMPLETED
    res_exam = await db.execute(
        select(BaiKiemTra).where(
            BaiKiemTra.MaBaiKiemTra == eid,
            BaiKiemTra.MaNguoiDung == uid,
            BaiKiemTra.TrangThai == "COMPLETED",
        )
    )
    exam = res_exam.scalar_one_or_none()
    if not exam:
        return {"error": "Bài kiểm tra không tồn tại hoặc chưa hoàn thành"}

    # 1. Kiểm tra đã có lộ trình chưa → tránh tạo trùng
    res_existing = await db.execute(
        select(LoTrinhHoc).where(
            LoTrinhHoc.MaNguoiDung == uid,
            LoTrinhHoc.MaBaiKiemTraDauVao == eid,
        )
    )
    existing = res_existing.scalar_one_or_none()
    if existing:
        # Trả về lộ trình đã có
        return await _build_roadmap_response(db, existing)

    # 2. Lấy điểm từng kỹ năng từ PhanKiemTra
    res_skills = await db.execute(
        select(PhanKiemTra).where(PhanKiemTra.MaBaiKiemTra == eid)
    )
    skill_records = res_skills.scalars().all()

    if not skill_records:
        return {"error": "Không tìm thấy dữ liệu điểm kỹ năng"}

    skill_pcts = {s.KyNang: float(s.PhanTramDiem or 0) for s in skill_records}

    # 3. Tính Level tổng → xác định KhoaHoc phù hợp
    avg_pct = sum(skill_pcts.values()) / len(skill_pcts) if skill_pcts else 0
    mucdo = determine_mucdo(avg_pct)

    # 4. Lấy KhoaHoc theo MucDo
    res_kh = await db.execute(
        select(KhoaHoc).where(
            KhoaHoc.MucDo == mucdo,
            KhoaHoc.TrangThai == "ACTIVE",
        ).limit(1)
    )
    khoa_hoc = res_kh.scalar_one_or_none()
    if not khoa_hoc:
        return {"error": f"Không tìm thấy khóa học cho cấp độ {mucdo}"}

    # 5. Lấy danh sách NodeKhoaHoc của khóa học, sắp xếp theo ThuTu
    res_nodes = await db.execute(
        select(NodeKhoaHoc, BaiHoc).join(
            BaiHoc, NodeKhoaHoc.MaBaiHoc == BaiHoc.MaBaiHoc
        ).where(
            NodeKhoaHoc.MaKhoaHoc == khoa_hoc.MaKhoaHoc
        ).order_by(NodeKhoaHoc.ThuTu)
    )
    node_bai_pairs = res_nodes.all()

    if not node_bai_pairs:
        return {"error": "Khóa học chưa có nội dung"}

    # 6. Sắp xếp lại thứ tự node ưu tiên kỹ năng yếu nhất
    priority_skills = sort_skills_by_priority(skill_pcts)

    def node_priority_key(pair):
        node, bai = pair
        if bai.LoaiBaiHoc == "TONG_HOP":
            return (99, 0)  # Luôn xếp cuối
        try:
            idx = priority_skills.index(bai.LoaiBaiHoc)
            return (0, idx)
        except ValueError:
            return (1, bai.ThuTu)

    sorted_pairs = sorted(node_bai_pairs, key=node_priority_key)

    # Xử lý trường hợp có nhiều node cùng LoaiBaiHoc (VD: 2 node VOCABULARIES)
    # Sắp xếp thứ cấp theo ThuTu gốc để ổn định
    seen_loai = {}
    final_pairs = []
    for pair in sorted_pairs:
        node, bai = pair
        loai = bai.LoaiBaiHoc or "UNKNOWN"
        if loai not in seen_loai:
            seen_loai[loai] = []
        seen_loai[loai].append(pair)

    # Ghép lại: skill đầu tiên → tất cả node của skill đó theo ThuTu, rồi skill tiếp theo...
    visited = set()
    final_pairs = []
    for pair in sorted_pairs:
        node, bai = pair
        loai = bai.LoaiBaiHoc or "UNKNOWN"
        if loai not in visited and loai != "TONG_HOP":
            visited.add(loai)
            # Thêm tất cả node cùng loại, sắp xếp theo ThuTu
            same_loai = sorted(
                [p for p in sorted_pairs if p[1].LoaiBaiHoc == loai],
                key=lambda p: p[0].ThuTu
            )
            final_pairs.extend(same_loai)

    # Thêm node TONG_HOP vào cuối
    tong_hop_pairs = [p for p in sorted_pairs if p[1].LoaiBaiHoc == "TONG_HOP"]
    final_pairs.extend(sorted(tong_hop_pairs, key=lambda p: p[0].ThuTu))

    sorted_pairs = final_pairs

    # 7. Tạo LoTrinhHoc
    lo_trinh = LoTrinhHoc(
        MaNguoiDung=uid,
        MaKhoaHoc=khoa_hoc.MaKhoaHoc,
        MaBaiKiemTraDauVao=eid,
        TrangThai="IN_PROGRESS",
    )
    db.add(lo_trinh)
    await db.flush()  # Lấy MaLoTrinh trước khi tạo TrangThaiNode

    # 8. Tạo TrangThaiNode cho từng node (node đầu UNLOCKED, còn lại LOCKED)
    for i, (node, bai) in enumerate(sorted_pairs):
        trang_thai = "UNLOCKED" if i == 0 else "LOCKED"
        tsn = TrangThaiNode(
            MaLoTrinh=lo_trinh.MaLoTrinh,
            MaNode=node.MaNode,
            TrangThai=trang_thai,
            NoiDungAI={"thu_tu_hoc": i},  # lưu thứ tự học để sort đúng
        )
        db.add(tsn)

    await db.commit()
    await db.refresh(lo_trinh)

    return await _build_roadmap_response(db, lo_trinh)


# ─── Lấy lộ trình hiện tại ────────────────────────────────────────────────

async def get_user_roadmap(db: AsyncSession, user_id: str) -> dict | None:
    """
    Lấy lộ trình đang học của user (lấy mới nhất).
    """
    uid = uuid.UUID(user_id)
    res = await db.execute(
        select(LoTrinhHoc).where(
            LoTrinhHoc.MaNguoiDung == uid,
        ).order_by(LoTrinhHoc.CreatedAt.desc()).limit(1)
    )
    lo_trinh = res.scalar_one_or_none()
    if not lo_trinh:
        return None
    return await _build_roadmap_response(db, lo_trinh)


# ─── Hoàn thành một node ──────────────────────────────────────────────────

async def complete_node(db: AsyncSession, user_id: str, node_state_id: str) -> dict:
    """
    Đánh dấu node hiện tại là COMPLETED và mở khóa node tiếp theo.
    node_state_id: MaTrangThaiNode (UUID)
    """
    uid = uuid.UUID(user_id)
    tsn_id = uuid.UUID(node_state_id)

    # 1. Lấy TrangThaiNode cần hoàn thành
    res = await db.execute(
        select(TrangThaiNode, LoTrinhHoc).join(
            LoTrinhHoc, TrangThaiNode.MaLoTrinh == LoTrinhHoc.MaLoTrinh
        ).where(
            TrangThaiNode.MaTrangThaiNode == tsn_id,
            LoTrinhHoc.MaNguoiDung == uid,
            TrangThaiNode.TrangThai == "UNLOCKED",
        )
    )
    row = res.first()
    if not row:
        return {"error": "Không tìm thấy node hoặc node chưa được mở khóa"}

    current_tsn, lo_trinh = row

    # 2. Đánh dấu COMPLETED
    current_tsn.TrangThai = "COMPLETED"
    current_tsn.ThoiGianHoanThanh = datetime.now(timezone.utc)

    # 3. Lấy toàn bộ node của lộ trình, tìm node tiếp theo theo thứ tự node template
    res_all = await db.execute(
        select(TrangThaiNode, NodeKhoaHoc).join(
            NodeKhoaHoc, TrangThaiNode.MaNode == NodeKhoaHoc.MaNode
        ).where(
            TrangThaiNode.MaLoTrinh == lo_trinh.MaLoTrinh
        ).order_by(TrangThaiNode.CreatedAt)  # thứ tự tạo = thứ tự học
    )
    all_nodes = res_all.all()

    # Tìm node tiếp theo sau node vừa completed
    found_current = False
    next_unlocked = False
    for tsn, node in all_nodes:
        if tsn.MaTrangThaiNode == tsn_id:
            found_current = True
            continue
        if found_current and tsn.TrangThai == "LOCKED":
            tsn.TrangThai = "UNLOCKED"
            next_unlocked = True
            break

    # 4. Nếu không còn node nào LOCKED → lộ trình hoàn thành
    if not next_unlocked:
        all_completed = all(
            tsn.TrangThai in ("COMPLETED", "SKIPPED")
            for tsn, _ in all_nodes
            if tsn.MaTrangThaiNode != tsn_id  # exclude current (vừa set)
        )
        if all_completed:
            lo_trinh.TrangThai = "COMPLETED"

    await db.commit()
    return {"success": True, "roadmap_completed": lo_trinh.TrangThai == "COMPLETED"}


# ─── Helper: Build response JSON ──────────────────────────────────────────

async def _build_roadmap_response(db: AsyncSession, lo_trinh: LoTrinhHoc) -> dict:
    """Xây dựng response JSON đầy đủ từ LoTrinhHoc."""

    # Lấy KhoaHoc
    res_kh = await db.execute(
        select(KhoaHoc).where(KhoaHoc.MaKhoaHoc == lo_trinh.MaKhoaHoc)
    )
    khoa_hoc = res_kh.scalar_one_or_none()

    # Lấy TrangThaiNode + NodeKhoaHoc + BaiHoc — sort theo thu_tu_hoc trong NoiDungAI
    res_nodes = await db.execute(
        select(TrangThaiNode, NodeKhoaHoc, BaiHoc).join(
            NodeKhoaHoc, TrangThaiNode.MaNode == NodeKhoaHoc.MaNode
        ).join(
            BaiHoc, NodeKhoaHoc.MaBaiHoc == BaiHoc.MaBaiHoc
        ).where(
            TrangThaiNode.MaLoTrinh == lo_trinh.MaLoTrinh
        )
    )
    rows = res_nodes.all()

    # Sort theo thu_tu_hoc được lưu trong NoiDungAI (fallback về CreatedAt)
    def sort_key(row):
        tsn, node, bai = row
        if tsn.NoiDungAI and isinstance(tsn.NoiDungAI, dict):
            return tsn.NoiDungAI.get("thu_tu_hoc", 999)
        return 999

    rows = sorted(rows, key=sort_key)

    nodes_out = []
    completed_count = 0
    for tsn, node, bai in rows:
        if tsn.TrangThai == "COMPLETED":
            completed_count += 1
        nodes_out.append({
            "node_state_id": str(tsn.MaTrangThaiNode),
            "node_id": str(node.MaNode),
            "bai_hoc_id": str(bai.MaBaiHoc),
            "ten_bai_hoc": bai.TenBaiHoc,
            "loai_bai_hoc": bai.LoaiBaiHoc,
            "loai_node": node.LoaiNode,
            "thu_tu": node.ThuTu,
            "trang_thai": tsn.TrangThai,           # LOCKED / UNLOCKED / COMPLETED
            "noi_dung": bai.NoiDungLyThuyet,        # JSONB metadata
            "thoi_gian_hoan_thanh": tsn.ThoiGianHoanThanh.isoformat()
                if tsn.ThoiGianHoanThanh else None,
        })

    total = len(nodes_out)
    progress_pct = round((completed_count / total) * 100) if total > 0 else 0

    return {
        "roadmap_id": str(lo_trinh.MaLoTrinh),
        "trang_thai_lo_trinh": lo_trinh.TrangThai,
        "khoa_hoc": {
            "id": str(khoa_hoc.MaKhoaHoc) if khoa_hoc else None,
            "ten": khoa_hoc.TenKhoaHoc if khoa_hoc else "",
            "cap_do": khoa_hoc.MucDo if khoa_hoc else "",
            "mo_ta": khoa_hoc.MoTa if khoa_hoc else "",
        },
        "tien_do": {
            "hoan_thanh": completed_count,
            "tong": total,
            "phan_tram": progress_pct,
        },
        "nodes": nodes_out,
    }
