"""
Rules + mapping từ output của EnglishLearningEngine sang danh sách node học tập
(`TrangThaiNode.NoiDungBoost`).

Thuật toán (deterministic, không gọi LLM):

1. Số node tổng phụ thuộc severity:
     low (0)  → 6 node
     med (1)  → 9 node
     high (2) → 12 node

2. Phân bổ node giữa 3 kỹ năng theo `weights` từ engine.
   Bảo đảm mỗi kỹ năng có ≥ 1 node nếu kỹ năng đó được flag yếu.

3. Xác định CEFR target: 1 bậc cao hơn current_level nếu severity=low,
   bằng level hiện tại nếu med, thấp hơn 1 bậc nếu high (để củng cố nền).

4. Mỗi node có:
     - skill: GRAMMAR / LISTENING / VOCABULARY
     - target_level: CEFR
     - kind: 'CORE' (lý thuyết) hoặc 'PRACTICE' (luyện tập)
     - title, description, exercises_count

5. Thứ tự node: skill có weight cao nhất xuất hiện trước, các skill xen kẽ
   để tránh nhàm chán cùng 1 dạng.
"""

from __future__ import annotations

from typing import List, Dict

LEVEL_ORDER = ["A", "B", "C"]
LEVEL_LABEL_VI = {"A": "Sơ cấp (A)", "B": "Trung cấp (B)", "C": "Nâng cao (C)"}

SKILL_VI = {"grammar": "Ngữ pháp", "listening": "Kỹ năng nghe", "vocab": "Từ vựng"}
SKILL_DB = {"grammar": "GRAMMAR", "listening": "LISTENING", "vocab": "VOCABULARY"}


# Số CORE nodes theo severity → tổng trạm thực tế sau khi chèn REVIEW + FINAL:
#   low  (0): 12 CORE + 3 REVIEW + 1 FINAL = 16 trạm
#   med  (1): 15 CORE + 4 REVIEW + 1 FINAL = 20 trạm  ← ~20 trạm mỗi level
#   high (2): 18 CORE + 5 REVIEW + 1 FINAL = 24 trạm
SEVERITY_NODE_TOTAL = {0: 12, 1: 15, 2: 18}


CORE_TEMPLATES = {
    "grammar": [
        ("Ôn cấu trúc câu cơ bản", "Củng cố cấu trúc S+V+O, thì hiện tại/quá khứ thường gặp."),
        ("Thì hiện tại hoàn thành", "Phân biệt present perfect vs past simple với ví dụ thực tế."),
        ("Mệnh đề quan hệ", "who/which/that — rút gọn mệnh đề trong câu phức."),
        ("Câu điều kiện", "Type 0/1/2/3 — tình huống thường dùng và ngoại lệ."),
        ("Câu bị động", "Chuyển từ chủ động sang bị động trong nhiều thì."),
        ("Mệnh đề danh từ", "that-clause, wh-clause, so sánh hơn/nhất."),
    ],
    "listening": [
        ("Nghe chi tiết hội thoại ngắn", "Bắt từ khoá thông tin: thời gian, địa điểm, người."),
        ("Nghe ý chính bài độc thoại", "Xác định gist và mục đích người nói."),
        ("Nghe phân biệt âm gần giống", "Minimal pairs, trọng âm, ngữ điệu."),
        ("Nghe và tóm tắt", "Note-taking trong khi nghe đoạn dài."),
        ("Nghe phỏng vấn", "Xác định quan điểm, thái độ người trả lời."),
        ("Nghe học thuật", "Cấu trúc bài giảng, dấu hiệu chuyển ý."),
    ],
    "vocab": [
        ("Từ vựng giao tiếp hàng ngày", "Từ và collocation thường dùng theo chủ đề family/work."),
        ("Phrasal verbs cơ bản", "Top 30 phrasal verb thường gặp + ví dụ."),
        ("Idioms & cách diễn đạt", "Idiom thông dụng trong văn nói và viết."),
        ("Từ vựng học thuật", "Academic Word List — nhóm 1 đến 3."),
        ("Word formation", "Chuyển đổi noun/verb/adjective với hậu tố."),
        ("Synonyms & antonyms", "Tránh lặp từ, nâng cao văn phong."),
    ],
}

PRACTICE_TEMPLATES = {
    "grammar": "Bài tập trắc nghiệm 10 câu về {topic}",
    "listening": "Luyện 5 đoạn audio kèm câu hỏi về {topic}",
    "vocab": "Quiz 15 từ + flashcard luyện nhớ về {topic}",
}


def _shift_level(current: str, delta: int) -> str:
    try:
        idx = LEVEL_ORDER.index(current.upper())
    except ValueError:
        idx = 1  # default B (trung cấp)
    new_idx = max(0, min(len(LEVEL_ORDER) - 1, idx + delta))
    return LEVEL_ORDER[new_idx]


def _allocate_counts(total: int, weights: Dict[str, float], must_include: List[str]) -> Dict[str, int]:
    """Phân bổ `total` slot theo weights, đảm bảo các skill trong must_include có ≥1."""
    raw = {k: max(0.0, weights.get(k, 0.0)) * total for k in ("grammar", "listening", "vocab")}
    counts = {k: int(round(v)) for k, v in raw.items()}
    # Bảo đảm mỗi weak skill có ≥1 node
    for k in must_include:
        if counts.get(k, 0) < 1:
            counts[k] = 1
    # Hiệu chỉnh tổng
    diff = total - sum(counts.values())
    while diff != 0:
        # Thêm vào skill có raw fractional cao nhất / bớt từ skill có nhiều nhất nhưng không phải must
        if diff > 0:
            target = max(counts, key=lambda k: raw[k] - counts[k])
            counts[target] += 1
            diff -= 1
        else:
            cand = sorted(counts.keys(), key=lambda k: counts[k], reverse=True)
            for k in cand:
                if counts[k] > 1 or k not in must_include:
                    counts[k] -= 1
                    diff += 1
                    break
            else:
                break  # không thể giảm thêm
    return counts


def build_learning_path(
    inference: dict,
    current_level: str,
    scores: Dict[str, float] | None = None,
    weak_topics: Dict[str, List[str]] | None = None,
) -> List[dict]:
    """
    Template mới: cứ 3 bài CORE → 1 trạm REVIEW ôn tập.
    Cuối lộ trình: 1 FINAL_TEST đánh giá tất cả skills.

    inference: kết quả từ EnglishLearningEngine.predict()
    current_level: CEFR hiện tại (vd 'B1')
    scores: {grammar, listening, vocab} 0-10
    weak_topics: {GRAMMAR: [chude...], LISTENING: [...], VOCABULARY: [...]} — chủ đề user yếu (acc < 60%)
    """
    severity = inference.get("severity", 1)
    weights = inference.get("weights", {"grammar": 1/3, "listening": 1/3, "vocab": 1/3})
    weak_skills = inference.get("weak_skills", [])

    total_core = SEVERITY_NODE_TOTAL.get(severity, 9)

    # CEFR target
    if severity == 0:
        target_level = _shift_level(current_level, +1)
    elif severity == 2:
        target_level = _shift_level(current_level, -1)
    else:
        target_level = current_level.upper() if current_level else "B1"

    counts = _allocate_counts(total_core, weights, must_include=weak_skills)

    # Tạo CORE nodes cho từng skill
    nodes_by_skill: Dict[str, List[dict]] = {}
    weak_topics = weak_topics or {}
    for skill, n in counts.items():
        if n <= 0:
            continue
        templates = CORE_TEMPLATES[skill]
        topics = weak_topics.get(SKILL_DB[skill], [])
        skill_nodes = []
        for i in range(n):
            if topics:
                # Round-robin qua các chủ đề yếu
                chude = topics[i % len(topics)]
                title = f"Củng cố: {chude}"
                description = f"Bạn cần luyện thêm chủ đề '{chude}' để nâng accuracy lên ≥ 80%."
                preferred_chude = chude
            else:
                title, description = templates[i % len(templates)]
                preferred_chude = None
            skill_nodes.append({
                "skill": SKILL_DB[skill],
                "skill_vi": SKILL_VI[skill],
                "kind": "CORE",
                "title": title,
                "description": description,
                "target_level": target_level,
                "exercises_count": {"grammar": 6, "listening": 4, "vocab": 10}[skill],
                "weight": weights.get(skill, 0.0),
                "is_weak": skill in weak_skills,
                "preferred_chude": preferred_chude,
            })
        nodes_by_skill[skill] = skill_nodes

    # Xen kẽ skills (skill weight cao nhất trước)
    skills_ordered = sorted(nodes_by_skill.keys(), key=lambda k: weights.get(k, 0), reverse=True)
    core_nodes: List[dict] = []
    cursors = {k: 0 for k in skills_ordered}
    while any(cursors[k] < len(nodes_by_skill[k]) for k in skills_ordered):
        for k in skills_ordered:
            if cursors[k] < len(nodes_by_skill[k]):
                core_nodes.append(nodes_by_skill[k][cursors[k]])
                cursors[k] += 1

    # Chèn REVIEW sau mỗi 3 CORE nodes
    final_nodes: List[dict] = []
    for i, node in enumerate(core_nodes):
        final_nodes.append(node)
        # Sau node thứ 3, 6, 9... → chèn REVIEW
        if (i + 1) % 3 == 0 and (i + 1) < len(core_nodes):
            final_nodes.append({
                "skill": "MIXED",
                "skill_vi": "Ôn tập",
                "kind": "REVIEW",
                "title": f"Ôn tập Trạm {i-1}–{i+1}",
                "description": "Kiểm tra lại kiến thức 3 bài học vừa rồi. Cần đạt 80% để tiếp tục.",
                "target_level": target_level,
                "exercises_count": 10,
                "weight": 1.0,
                "is_weak": False,
                "review_group": list(range(len(final_nodes) - 3, len(final_nodes))),  # index 3 bài trước
            })

    # Cuối lộ trình: FINAL_TEST
    final_nodes.append({
        "skill": "MIXED",
        "skill_vi": "Kiểm tra cuối",
        "kind": "FINAL_TEST",
        "title": "Kiểm tra cuối lộ trình",
        "description": "Đánh giá toàn diện Grammar, Vocabulary và Listening. Kết quả sẽ sinh lộ trình giai đoạn tiếp theo.",
        "target_level": target_level,
        "exercises_count": 15,
        "weight": 1.0,
        "is_weak": False,
    })

    # Gán thứ tự
    for idx, node in enumerate(final_nodes, start=1):
        node["thu_tu"] = idx

    return final_nodes



def build_checkpoint_only_path(target_level: str = "C") -> List[dict]:
    """Sinh path 'toàn trạm kiểm tra' cho học viên đã master cấp C.
    10 REVIEW (mixed Grammar/Vocab/Listening) + 1 FINAL_TEST."""
    nodes: List[dict] = []
    for i in range(10):
        nodes.append({
            "skill": "MIXED",
            "skill_vi": "Trạm kiểm tra",
            "kind": "REVIEW",
            "title": f"Trạm kiểm tra {i + 1}",
            "description": "10 câu hỏi tổng hợp Grammar, Vocab, Listening cấp C. Đạt 80% để tiếp tục.",
            "target_level": target_level,
            "exercises_count": 10,
            "weight": 1.0,
            "is_weak": False,
            "checkpoint_loop": True,
        })
    nodes.append({
        "skill": "MIXED",
        "skill_vi": "Kiểm tra cuối",
        "kind": "FINAL_TEST",
        "title": "Kiểm tra cuối lộ trình",
        "description": "Đánh giá toàn diện cấp C. Hoàn thành để mở loop kiểm tra mới.",
        "target_level": target_level,
        "exercises_count": 15,
        "weight": 1.0,
        "is_weak": False,
        "checkpoint_loop": True,
    })
    for idx, n in enumerate(nodes, start=1):
        n["thu_tu"] = idx
    return nodes


def overall_to_level(overall_0_10: float) -> str:
    """Map điểm tổng (0-10) → 3 mức A/B/C.

    A < 5  : Sơ cấp
    B 5-8  : Trung cấp
    C ≥ 8  : Nâng cao
    """
    s = max(0.0, min(10.0, overall_0_10))
    if s < 5.0:
        return "A"
    if s < 8.0:
        return "B"
    return "C"


# Backwards-compat alias để code cũ không vỡ ngay
def overall_to_cefr(overall_0_10: float) -> str:  # pragma: no cover
    return overall_to_level(overall_0_10)
