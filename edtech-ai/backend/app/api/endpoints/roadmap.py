"""
roadmap.py — API endpoints cho tính năng Lộ Trình Học Cá Nhân Hóa.
Nhận request → gọi roadmap_service → trả response.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from jose import jwt, JWTError

from app.core.database import get_db
from app.core.config import settings
from app.core.roadmap_service import generate_roadmap, get_user_roadmap, complete_node

router = APIRouter()


# ─── Helper: Decode JWT ───────────────────────────────────────────────────
def get_user_id_from_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Token hết hạn hoặc không hợp lệ")


# ─── Schemas ─────────────────────────────────────────────────────────────
class GenerateRoadmapRequest(BaseModel):
    token: str
    exam_id: str   # MaBaiKiemTra của bài DAU_VAO vừa hoàn thành


class GetRoadmapRequest(BaseModel):
    token: str


class CompleteNodeRequest(BaseModel):
    token: str


# ─── Routes ──────────────────────────────────────────────────────────────

@router.post("/generate")
async def api_generate_roadmap(body: GenerateRoadmapRequest, db: AsyncSession = Depends(get_db)):
    """
    Sinh lộ trình học cá nhân hóa dựa trên kết quả bài kiểm tra đầu vào.
    - Đọc % VOCAB, GRAMMAR, LISTENING từ PhanKiemTra
    - Xác định cấp độ (BEGINNER/INTERMEDIATE/ADVANCED)
    - Sắp xếp node: kỹ năng yếu nhất học trước
    - Tạo LoTrinhHoc + TrangThaiNode
    """
    user_id = get_user_id_from_token(body.token)
    result = await generate_roadmap(db, user_id, body.exam_id)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


@router.post("/me")
async def api_get_my_roadmap(body: GetRoadmapRequest, db: AsyncSession = Depends(get_db)):
    """
    Lấy lộ trình học hiện tại của user (lộ trình mới nhất).
    """
    user_id = get_user_id_from_token(body.token)
    result = await get_user_roadmap(db, user_id)

    if not result:
        raise HTTPException(status_code=404, detail="Chưa có lộ trình học. Hãy hoàn thành bài kiểm tra đầu vào.")

    return result


@router.patch("/node/{node_state_id}/complete")
async def api_complete_node(
    node_state_id: str,
    body: CompleteNodeRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Đánh dấu một node là đã hoàn thành và tự động mở khóa node tiếp theo.
    node_state_id: MaTrangThaiNode (UUID)
    """
    user_id = get_user_id_from_token(body.token)
    result = await complete_node(db, user_id, node_state_id)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result
