from sentence_transformers import CrossEncoder
import numpy as np


class RerankerSingleton:
    _model: CrossEncoder | None = None

    @classmethod
    def get(cls) -> CrossEncoder:
        if cls._model is None:
            cls._model = CrossEncoder(
                "cross-encoder/ms-marco-MiniLM-L-6-v2",
                max_length=512,
                default_activation_function=None,
            )
        return cls._model


def rerank_chunks(
    query: str,
    chunks: list[dict],
    top_k: int = 6,
    score_threshold: float = -5.0,
) -> list[dict]:
    """
    Takes output of hybrid_search (top-20), returns top_k reranked chunks.
    Adds 'rerank_score' key to each chunk.
    """
    if not chunks:
        return []

    model = RerankerSingleton.get()
    pairs = [(query, c["text"]) for c in chunks]
    scores: np.ndarray = model.predict(pairs, batch_size=32, show_progress_bar=False)

    for chunk, score in zip(chunks, scores):
        chunk["rerank_score"] = float(score)

    ranked = sorted(chunks, key=lambda x: x["rerank_score"], reverse=True)
    filtered = [c for c in ranked if c["rerank_score"] > score_threshold]
    return filtered[:top_k]
