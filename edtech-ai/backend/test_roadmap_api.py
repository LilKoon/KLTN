"""
test_roadmap_api.py — Test end-to-end roadmap service.
Lay JWT token cua user co san trong DB, goi generate_roadmap va in ket qua.
"""
import asyncio
import json
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text
from jose import jwt
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

DATABASE_URL = "postgresql+asyncpg://postgres:bun123@localhost:5432/DB_KLTN_final"
SECRET_KEY = "edtech-ai-super-secret-key-2024"
ALGORITHM = "HS256"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def test():
    async with AsyncSessionLocal() as db:
        # 1. Lay user dau tien co bai DAU_VAO COMPLETED
        res = await db.execute(text("""
            SELECT bkt.mabaikiemtra, bkt.manguoidung, nd.tennguoidung, nd.email
            FROM baikiemtra bkt
            JOIN nguoidung nd ON nd.manguoidung = bkt.manguoidung
            WHERE bkt.loaibaikiemtra = 'DAU_VAO' AND bkt.trangthai = 'COMPLETED'
            ORDER BY bkt.created_at DESC
            LIMIT 1
        """))
        row = res.fetchone()
        if not row:
            print("[ERROR] Khong co user nao co bai DAU_VAO COMPLETED")
            print("  -> Hay chay ung dung va lam bai kiem tra dau vao truoc!")
            return

        exam_id = str(row[0])
        user_id = str(row[1])
        ten = row[2]
        email = row[3]
        print(f"[INFO] Test voi user: (email: {email})")
        print(f"[INFO] exam_id DAU_VAO: {exam_id}")
        print(f"[INFO] user_id: {user_id}")

        # 2. Lay diem ky nang
        res2 = await db.execute(text("""
            SELECT kynang, phantramdiem FROM phankiemtra
            WHERE mabaikiemtra = :eid
        """), {"eid": exam_id})
        skills = res2.fetchall()
        print(f"\n[SKILLS] Ket qua ky nang:")
        for s in skills:
            print(f"   {s[0]}: {s[1]}%")

        # 3. Goi generate_roadmap
        print(f"\n[TEST] Goi generate_roadmap...")
        from app.core.roadmap_service import generate_roadmap
        result = await generate_roadmap(db, user_id, exam_id)

        if "error" in result:
            print(f"[ERROR] {result['error']}")
            return

        print(f"\n[OK] Roadmap da duoc tao!")
        print(f"   roadmap_id : {result['roadmap_id']}")
        print(f"   khoa hoc   : {result['khoa_hoc']['ten']} [{result['khoa_hoc']['cap_do']}]")
        print(f"   tien do    : {result['tien_do']['hoan_thanh']}/{result['tien_do']['tong']} node")
        print(f"\n[NODES] Thu tu hoc:")
        for i, node in enumerate(result['nodes']):
            lock_icon = "[OPEN]" if node['trang_thai'] == 'UNLOCKED' else "[LOCK]" if node['trang_thai'] == 'LOCKED' else "[DONE]"
            print(f"   {i+1}. {lock_icon} [{node['loai_bai_hoc']}] {node['ten_bai_hoc']}")

        print(f"\n[DONE] Test thanh cong!")

        # 4. Test get_user_roadmap
        print(f"\n[TEST] Goi get_user_roadmap...")
        from app.core.roadmap_service import get_user_roadmap
        result2 = await get_user_roadmap(db, user_id)
        if result2:
            print(f"[OK] get_user_roadmap: roadmap_id = {result2['roadmap_id']}")
        else:
            print("[ERROR] get_user_roadmap tra ve None")

if __name__ == "__main__":
    asyncio.run(test())
