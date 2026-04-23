def build_rag_chat_system(has_context: bool) -> str:
    base = (
        "B\u1ea1n l\u00e0 EdTech AI \u2014 tr\u1ee3 l\u00fd h\u1ecdc ti\u1ebfng Anh th\u00f4ng minh cho h\u1ecdc sinh Vi\u1ec7t Nam.\n"
        "- D\u00f9ng ti\u1ebfng Vi\u1ec7t \u0111\u1ec3 gi\u1ea3i th\u00edch, ti\u1ebfng Anh cho v\u00ed d\u1ee5 v\u00e0 thu\u1eadt ng\u1eef.\n"
        "- Tr\u1ea3 l\u1eddi ng\u1eafn g\u1ecdn, c\u00f3 c\u1ea5u tr\u00fac. D\u00f9ng **bold** cho thu\u1eadt ng\u1eef quan tr\u1ecdng.\n"
        "- Khuy\u1ebfn kh\u00edch v\u00e0 h\u1ed7 tr\u1ee3 t\u00edch c\u1ef1c."
    )

    if has_context:
        base += (
            "\n\nB\u1ea1n c\u00f3 t\u00e0i li\u1ec7u tham kh\u1ea3o d\u01b0\u1edbi \u0111\u00e2y. H\u00e3y \u01b0u ti\u00ean tr\u1ea3 l\u1eddi d\u1ef1a tr\u00ean t\u00e0i li\u1ec7u.\n"
            "N\u1ebfu t\u00e0i li\u1ec7u kh\u00f4ng \u0111\u1ee7 th\u00f4ng tin, d\u00f9ng ki\u1ebfn th\u1ee9c chung nh\u01b0ng h\u00e3y n\u00f3i r\u00f5.\n"
            "Lu\u00f4n tr\u00edch d\u1eabn ngu\u1ed3n khi d\u00f9ng th\u00f4ng tin t\u1eeb t\u00e0i li\u1ec7u: (Ngu\u1ed3n: [t\u00ean file])"
        )

    return base


def build_rag_user_message(query: str, context: str) -> str:
    if context:
        return (
            "T\u00e0i li\u1ec7u tham kh\u1ea3o:\n"
            "---\n"
            f"{context}\n"
            "---\n\n"
            f"C\u00e2u h\u1ecfi: {query}"
        )
    return query
