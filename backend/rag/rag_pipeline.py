from .chunker import process_pdf
from .vector_store import get_vector_store
from .bm25_store import get_bm25_store
from .hybrid_retriever import hybrid_search_multi_namespace
from .reranker import rerank_chunks
from .context_compressor import compress_chunks
from .hallucination_detector import detect_hallucination


def index_pdf(pdf_path: str, doc_id: str, source_name: str, namespace: str) -> dict:
    chunks = process_pdf(pdf_path)
    if not chunks:
        raise ValueError("Kh\u00f4ng tr\u00edch xu\u1ea5t \u0111\u01b0\u1ee3c n\u1ed9i dung t\u1eeb PDF")
    n = get_vector_store(namespace).add_document(doc_id, chunks, source_name)
    get_bm25_store(namespace).add_document(doc_id, chunks, source_name)
    return {"doc_id": doc_id, "chunks_indexed": n, "namespace": namespace}


def delete_pdf_index(doc_id: str, namespace: str):
    get_vector_store(namespace).delete_document(doc_id)
    get_bm25_store(namespace).delete_document(doc_id)


def retrieve_context(query: str, user_id: str, top_k: int = 5) -> tuple[str, list[dict]]:
    """Legacy simple retrieval (no rerank) — kept for backward compatibility."""
    namespaces = [f"user_{user_id}", "admin"]
    chunks = hybrid_search_multi_namespace(namespaces, query, top_k)
    if not chunks:
        return "", []
    default_source = "T\u00e0i li\u1ec7u"
    context_parts = []
    for i, c in enumerate(chunks):
        source = c.get("source", default_source)
        text = c["text"]
        context_parts.append(f"[{i+1}] (Ngu\u1ed3n: {source})\n{text}")
    return "\n\n---\n\n".join(context_parts), chunks


def retrieve_and_compress(
    query: str,
    user_id: str,
    top_k_hybrid: int = 20,
    top_k_rerank: int = 6,
    token_budget: int = 800,
) -> dict:
    """Full RAG pipeline: hybrid search → rerank → compress."""
    namespaces = [f"user_{user_id}", "admin"]
    raw_chunks = hybrid_search_multi_namespace(namespaces, query, top_k=top_k_hybrid)

    if not raw_chunks:
        return {"context": "", "source_chunks": [], "retrieval_stats": {"found": 0}}

    reranked = rerank_chunks(query, raw_chunks, top_k=top_k_rerank)
    context, kept_chunks = compress_chunks(
        query=query,
        chunks=reranked,
        token_budget=token_budget,
        sentence_threshold=0.30,
    )

    stats = {
        "found_hybrid": len(raw_chunks),
        "after_rerank": len(reranked),
        "after_compress": len(kept_chunks),
        "context_tokens_est": int(len(context.split()) * 1.3),
        "sources": list({c.get("source", "?") for c in kept_chunks}),
    }

    return {"context": context, "source_chunks": kept_chunks, "retrieval_stats": stats}


async def rag_generate_and_check(
    query: str,
    user_id: str,
    llm_call_fn,
    check_hallucination: bool = True,
    hallucination_threshold: float = 0.5,
) -> dict:
    """End-to-end RAG with hallucination detection."""
    retrieval = retrieve_and_compress(query, user_id)
    context = retrieval["context"]

    reply = await llm_call_fn(context=context)

    hal_result = {}
    if check_hallucination and context:
        hal_result = detect_hallucination(
            llm_response=reply,
            context=context,
            hallucination_threshold=hallucination_threshold,
        )

    return {
        "reply": reply,
        "context_used": context,
        "sources": retrieval["retrieval_stats"].get("sources", []),
        "hallucination": hal_result,
        "retrieval_stats": retrieval["retrieval_stats"],
        "used_rag": bool(context),
    }
