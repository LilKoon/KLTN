import re
import numpy as np
from .embedder import embed_texts


def _split_sentences(text: str) -> list[str]:
    sentences = re.split(r'(?<=[.!?])\s+|\n{2,}', text.strip())
    return [s.strip() for s in sentences if len(s.strip()) > 20]


def _estimate_tokens(text: str) -> int:
    return int(len(text.split()) * 1.3)


def extract_relevant_sentences(
    query: str,
    text: str,
    similarity_threshold: float = 0.35,
    max_sentences: int = 5,
) -> str:
    sentences = _split_sentences(text)
    if not sentences:
        return text
    if len(sentences) <= 2:
        return text

    all_texts = [query] + sentences
    embeddings = embed_texts(all_texts, is_query=False)

    q_embed = embeddings[0]
    sent_embeds = embeddings[1:]
    similarities = sent_embeds @ q_embed

    scored = [
        (sim, sent)
        for sim, sent in zip(similarities, sentences)
        if sim >= similarity_threshold
    ]
    scored.sort(reverse=True)
    top_sents = {s for _, s in scored[:max_sentences]}

    original_order = [s for s in sentences if s in top_sents]
    return " ".join(original_order) if original_order else text


def compress_chunks(
    query: str,
    chunks: list[dict],
    token_budget: int = 800,
    sentence_threshold: float = 0.35,
) -> tuple[str, list[dict]]:
    if not chunks:
        return "", []

    compressed_parts = []
    kept_chunks = []
    used_tokens = 0

    for chunk in chunks:
        original_text = chunk["text"]
        source = chunk.get("source", "T\u00e0i li\u1ec7u")

        compressed_text = extract_relevant_sentences(
            query=query,
            text=original_text,
            similarity_threshold=sentence_threshold,
            max_sentences=4,
        )

        chunk_tokens = _estimate_tokens(compressed_text)
        if used_tokens + chunk_tokens > token_budget:
            remaining_budget = token_budget - used_tokens
            if remaining_budget < 50:
                break
            words = compressed_text.split()
            approx_words = int(remaining_budget / 1.3)
            compressed_text = " ".join(words[:approx_words]) + "..."

        compressed_parts.append(f"[Ngu\u1ed3n: {source}]\n{compressed_text}")
        kept_chunks.append({**chunk, "compressed_text": compressed_text})
        used_tokens += _estimate_tokens(compressed_text)

        if used_tokens >= token_budget:
            break

    context = "\n\n---\n\n".join(compressed_parts)
    return context, kept_chunks
