from .vector_store import get_vector_store
from .bm25_store import get_bm25_store


def reciprocal_rank_fusion(
    dense_results: list[dict],
    sparse_results: list[dict],
    alpha: float = 0.6,
    k: int = 60,
) -> list[dict]:
    scores: dict[str, float] = {}
    chunk_map: dict[str, dict] = {}

    def chunk_key(c: dict) -> str:
        return f"{c.get('doc_id', '')}::{c.get('chunk_id', 0)}"

    for rank, chunk in enumerate(dense_results):
        key = chunk_key(chunk)
        scores[key] = scores.get(key, 0) + alpha * (1 / (rank + k))
        chunk_map[key] = chunk

    for rank, chunk in enumerate(sparse_results):
        key = chunk_key(chunk)
        scores[key] = scores.get(key, 0) + (1 - alpha) * (1 / (rank + k))
        chunk_map.setdefault(key, chunk)

    ranked = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
    return [{**chunk_map[key], "rrf_score": scores[key]} for key in ranked]


def hybrid_search(namespace: str, query: str, top_k: int = 5) -> list[dict]:
    dense = get_vector_store(namespace).search(query, top_k=top_k * 2)
    sparse = get_bm25_store(namespace).search(query, top_k=top_k * 2)
    if not dense and not sparse:
        return []
    return reciprocal_rank_fusion(dense, sparse, alpha=0.6)[:top_k]


def hybrid_search_multi_namespace(
    namespaces: list[str], query: str, top_k: int = 5
) -> list[dict]:
    all_results = []
    for ns in namespaces:
        for r in hybrid_search(ns, query, top_k=top_k):
            r["namespace"] = ns
            all_results.append(r)
    all_results.sort(key=lambda x: x.get("rrf_score", 0), reverse=True)
    return all_results[:top_k]
