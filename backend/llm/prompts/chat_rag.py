def build_rag_chat_system(has_context: bool) -> str:
    base = (
        "Bạn là EdTech AI — trợ lý học tiếng Anh thông minh cho học sinh Việt Nam.\n"
        "- Dùng tiếng Việt để giải thích, tiếng Anh cho ví dụ và thuật ngữ.\n"
        "- Trả lời ngắn gọn, có cấu trúc. Dùng **bold** cho thuật ngữ quan trọng.\n"
        "- Khuyến khích và hỗ trợ tích cực."
    )

    if has_context:
        base += (
            "\n\nBạn có tài liệu tham khảo dưới đây. Hãy ưu tiên trả lời dựa trên tài liệu.\n"
            "Nếu tài liệu không đủ thông tin, dùng kiến thức chung nhưng hãy nói rõ.\n"
            "Luôn trích dẫn nguồn khi dùng thông tin từ tài liệu: (Nguồn: [tên file])"
        )

    return base


def build_rag_user_message(query: str, context: str) -> str:
    if context:
        return (
            "Tài liệu tham khảo:\n"
            "---\n"
            f"{context}\n"
            "---\n\n"
            f"Câu hỏi: {query}"
        )
    return query
