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

LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"]

SKILL_VI = {"grammar": "Ngữ pháp", "listening": "Kỹ năng nghe", "vocab": "Từ vựng"}
SKILL_DB = {"grammar": "GRAMMAR", "listening": "LISTENING", "vocab": "VOCABULARY"}

SEVERITY_NODE_TOTAL = {0: 6, 1: 9, 2: 12}

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
        idx = 2  # default B1
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
) -> List[dict]:
    """
    inference: kết quả từ EnglishLearningEngine.predict()
    current_level: CEFR hiện tại của học viên (vd 'B1')
    scores: dict {grammar, listening, vocab} điểm 0-10 (để ghi nhận vào node nếu cần)

    Trả về list node dict, mỗi node:
      {
        "thu_tu": int,
        "skill": "GRAMMAR" | "LISTENING" | "VOCABULARY",
        "kind": "CORE" | "PRACTICE",
        "title": str,
        "description": str,
        "target_level": "A1".."C2",
        "exercises_count": int,
        "weight": float,
        "is_weak": bool,
      }
    """
    severity = inference.get("severity", 1)
    weights = inference.get("weights", {"grammar": 1/3, "listening": 1/3, "vocab": 1/3})
    weak_skills = inference.get("weak_skills", [])

    total_nodes = SEVERITY_NODE_TOTAL.get(severity, 9)

    # CEFR target shift theo severity
    if severity == 0:
        target_level = _shift_level(current_level, +1)
    elif severity == 2:
        target_level = _shift_level(current_level, -1)
    else:
        target_level = current_level.upper() if current_level else "B1"

    counts = _allocate_counts(total_nodes, weights, must_include=weak_skills)

    # Tạo nodes cho từng skill
    nodes_by_skill: Dict[str, List[dict]] = {}
    for skill, n in counts.items():
        if n <= 0:
            continue
        templates = CORE_TEMPLATES[skill]
        skill_nodes = []
        for i in range(n):
            tmpl_title, tmpl_desc = templates[i % len(templates)]
            # Cứ mỗi 2 node lý thuyết xen 1 node luyện tập
            if i > 0 and i % 2 == 0:
                kind = "PRACTICE"
                title = PRACTICE_TEMPLATES[skill].format(topic=tmpl_title.lower())
                desc = f"Luyện tập kết hợp ôn lại '{tmpl_title}'."
                ex_count = {"grammar": 10, "listening": 5, "vocab": 15}[skill]
            else:
                kind = "CORE"
                title = tmpl_title
                desc = tmpl_desc
                ex_count = {"grammar": 6, "listening": 4, "vocab": 10}[skill]
            skill_nodes.append({
                "skill": SKILL_DB[skill],
                "skill_vi": SKILL_VI[skill],
                "kind": kind,
                "title": title,
                "description": desc,
                "target_level": target_level,
                "exercises_count": ex_count,
                "weight": weights.get(skill, 0.0),
                "is_weak": skill in weak_skills,
            })
        nodes_by_skill[skill] = skill_nodes

    # Sắp xếp xen kẽ — bắt đầu từ skill weight cao nhất
    skills_ordered = sorted(nodes_by_skill.keys(), key=lambda k: weights.get(k, 0), reverse=True)
    interleaved: List[dict] = []
    cursors = {k: 0 for k in skills_ordered}
    while any(cursors[k] < len(nodes_by_skill[k]) for k in skills_ordered):
        for k in skills_ordered:
            if cursors[k] < len(nodes_by_skill[k]):
                interleaved.append(nodes_by_skill[k][cursors[k]])
                cursors[k] += 1

    # Gán thứ tự
    for idx, node in enumerate(interleaved, start=1):
        node["thu_tu"] = idx

    return interleaved


def overall_to_cefr(overall_0_10: float) -> str:
    """Map overall score (0-10) → CEFR. Theo LEVEL_RANGES trong notebook."""
    s = max(0.0, min(10.0, overall_0_10))
    if s < 3.0:
        return "A1"
    if s < 5.0:
        return "A2"
    if s < 7.0:
        return "B1"
    if s < 8.5:
        return "B2"
    if s < 9.5:
        return "C1"
    return "C2"
