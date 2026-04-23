import faiss
import numpy as np
import json
from pathlib import Path
from .embedder import embed_documents, embed_query

STORES_DIR = Path("rag_stores")
STORES_DIR.mkdir(exist_ok=True)


class FAISSVectorStore:
    def __init__(self, namespace: str):
        self.namespace = namespace
        self.store_dir = STORES_DIR / namespace
        self.store_dir.mkdir(parents=True, exist_ok=True)
        self.index_path = self.store_dir / "faiss.index"
        self.chunks_path = self.store_dir / "chunks.json"
        self.dim = 384
        self.index: faiss.IndexFlatIP = None
        self.chunks: list[dict] = []
        self._load()

    def _load(self):
        if self.index_path.exists() and self.chunks_path.exists():
            self.index = faiss.read_index(str(self.index_path))
            with open(self.chunks_path, "r", encoding="utf-8") as f:
                self.chunks = json.load(f)
        else:
            self.index = faiss.IndexFlatIP(self.dim)
            self.chunks = []

    def _save(self):
        faiss.write_index(self.index, str(self.index_path))
        with open(self.chunks_path, "w", encoding="utf-8") as f:
            json.dump(self.chunks, f, ensure_ascii=False, indent=2)

    def add_document(self, doc_id: str, chunks: list[dict], source_name: str) -> int:
        texts = [c["text"] for c in chunks]
        embeddings = embed_documents(texts)
        tagged = [{**c, "doc_id": doc_id, "source": source_name} for c in chunks]
        self.index.add(embeddings)
        self.chunks.extend(tagged)
        self._save()
        return len(chunks)

    def search(self, query: str, top_k: int = 8) -> list[dict]:
        if self.index.ntotal == 0:
            return []
        q_embed = embed_query(query)
        distances, indices = self.index.search(q_embed, min(top_k, self.index.ntotal))
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx >= 0:
                chunk = dict(self.chunks[idx])
                chunk["dense_score"] = float(dist)
                results.append(chunk)
        return results

    def delete_document(self, doc_id: str):
        remaining = [c for c in self.chunks if c.get("doc_id") != doc_id]
        if len(remaining) == len(self.chunks):
            return
        self.index = faiss.IndexFlatIP(self.dim)
        self.chunks = remaining
        if remaining:
            texts = [c["text"] for c in remaining]
            self.index.add(embed_documents(texts))
        self._save()

    @property
    def total_chunks(self) -> int:
        return self.index.ntotal


_store_cache: dict[str, FAISSVectorStore] = {}


def get_vector_store(namespace: str) -> FAISSVectorStore:
    if namespace not in _store_cache:
        _store_cache[namespace] = FAISSVectorStore(namespace)
    return _store_cache[namespace]
