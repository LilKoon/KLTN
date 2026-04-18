import sys
import os
import uuid
from sqlalchemy.orm import Session

# Add the parent directory to Python path so we can import 'database' and 'models'
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

import database
import models

def seed_10_questions(db: Session):
    # Check if we already seeded to avoid duplicates
    count = db.query(models.NganHangCauHoi).count()
    if count >= 10:
        print(f"Database already has {count} questions. No seeding needed.")
        return

    questions_data = [
        {
            "KyNang": "Reading",
            "MucDo": "EASY",
            "NoiDung": "He always ___ his homework before dinner.",
            "DSDapAn": ["do", "does", "doing", "did"],
            "DapAnDung": "does",
            "GiaiThich": "Chủ ngữ số ít 'He' đi với động từ thêm s/es. Hành động thường xuyên dùng thì Hiện tại đơn."
        },
        {
            "KyNang": "Vocabulary",
            "MucDo": "EASY",
            "NoiDung": "The opposite of 'Expensive' is ___.",
            "DSDapAn": ["Cheap", "Rich", "Poor", "Large"],
            "DapAnDung": "Cheap",
            "GiaiThich": "Expensive = mắc, Cheap = rẻ."
        },
        {
            "KyNang": "Grammar",
            "MucDo": "MEDIUM",
            "NoiDung": "If it rains tomorrow, we ___ at home.",
            "DSDapAn": ["stay", "will stay", "would stay", "stayed"],
            "DapAnDung": "will stay",
            "GiaiThich": "Câu điều kiện loại 1 diễn tả sự việc có thể xảy ra trong tương lai: If + HTĐ, Tương lai đơn."
        },
        {
            "KyNang": "Vocabulary",
            "MucDo": "MEDIUM",
            "NoiDung": "Our company has a very strictly enforced dress ___.",
            "DSDapAn": ["code", "suit", "uniform", "rule"],
            "DapAnDung": "code",
            "GiaiThich": "Dress code: Quy định về trang phục."
        },
        {
            "KyNang": "Listening",
            "MucDo": "MEDIUM",
            "NoiDung": "(Audio Transcript) A: Could you turn down the AC? B: Sure, ____.",
            "DSDapAn": ["it is very hot", "I'll adjust the temperature right away", "yes, turn it up", "the AC is broken"],
            "DapAnDung": "I'll adjust the temperature right away",
            "GiaiThich": "Hỏi 'bạn hạ nhiệt độ được không?' -> 'Chắc chắn rồi, tớ sẽ chỉnh ngay'."
        },
        {
            "KyNang": "Reading",
            "MucDo": "HARD",
            "NoiDung": "The manager ___ the team that the project deadline would be extended.",
            "DSDapAn": ["ensured", "assured", "insured", "assumed"],
            "DapAnDung": "assured",
            "GiaiThich": "Assure sb that: Đảm bảo/Cam đoan với ai đó rằng."
        },
        {
            "KyNang": "Grammar",
            "MucDo": "HARD",
            "NoiDung": "Not until he received the letter ___ the truth.",
            "DSDapAn": ["he realized", "did he realize", "he did realize", "that he realized"],
            "DapAnDung": "did he realize",
            "GiaiThich": "Đảo ngữ với 'Not until' (Mãi cho đến khi): Not until + clause/time, trợ động từ + S + V."
        },
        {
            "KyNang": "Vocabulary",
            "MucDo": "HARD",
            "NoiDung": "The new policy had a ___ effect on the company's revenue.",
            "DSDapAn": ["profound", "shallow", "trivial", "superficial"],
            "DapAnDung": "profound",
            "GiaiThich": "Profound effect: Tác động sâu sắc/to lớn."
        },
        {
            "KyNang": "Reading",
            "MucDo": "MEDIUM",
            "NoiDung": "Please ensure that all the windows are closed ___ you leave the office.",
            "DSDapAn": ["before", "after", "while", "during"],
            "DapAnDung": "before",
            "GiaiThich": "Đóng cửa sổ TRƯỚC KHI (before) rời đi."
        },
        {
            "KyNang": "Grammar",
            "MucDo": "EASY",
            "NoiDung": "I have been living in this city ___ 5 years.",
            "DSDapAn": ["since", "for", "in", "during"],
            "DapAnDung": "for",
            "GiaiThich": "Thì hiện tại hoàn thành tiếp diễn: for + khoảng thời gian."
        }
    ]

    for q in questions_data:
        new_q = models.NganHangCauHoi(
            MaCauHoi=uuid.uuid4(),
            KyNang=q["KyNang"],
            MucDo=q["MucDo"],
            NoiDung=q["NoiDung"],
            DSDapAn=q["DSDapAn"],
            DapAnDung=q["DapAnDung"],
            GiaiThich=q["GiaiThich"]
        )
        db.add(new_q)
    
    db.commit()
    print("Successfully seeded 10 questions into NganHangCauHoi table!")

if __name__ == "__main__":
    db = database.SessionLocal()
    try:
        seed_10_questions(db)
    finally:
        db.close()
