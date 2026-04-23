from rank_bm25 import BM25Okapi
import json
import re
from pathlib import Path

STORES_DIR = Path("rag_stores")


class BM25Store:
    def __init__(self, namespace: str):
        self.namespace = namespace
        self.store_dir = STORES_DIR / namespace
        self.store_dir.mkdir(parents=True, exist_ok=True)
        self.bm25_path = self.store_dir / "bm25_corpus.json"
        self.corpus: list[dict] = []
        self.bm25: BM25Okapi = None
        self._load()

    def _tokenize(self, text: str) -> list[str]:
        tokens = re.findall(r"\b[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]+\b", text.lower())
        return tokens if tokens else ["<empty>"]

    def _rebuild_bm25(self):
        if self.corpus:
            self.bm25 = BM25Okapi([c["tokens"] for c in self.corpus])
        else:
            self.bm25 = None

    def _load(self):
        if self.bm25_path.exists():
            with open(self.bm25_path, "r", encoding="utf-8") as f:
                self.corpus = json.load(f)
            self._rebuild_bm25()

    def _save(self):
        with open(self.bm25_path, "w", encoding="utf-8") as f:
            json.dump(self.corpus, f, ensure_ascii=False)

    def add_document(self, doc_id: str, chunks: list[dict], source_name: str):
        for chunk in chunks:
            self.corpus.append({
                "tokens": self._tokenize(chunk["text"]),
                "text": chunk["text"],
                "chunk_id": chunk["chunk_id"],
                "doc_id": doc_id,
                "source": source_name,
            })
        self._rebuild_bm25()
        self._save()

    def search(self, query: str, top_k: int = 8) -> list[dict]:
        if self.bm25 is None or not self.corpus:
            return []
        scores = self.bm25.get_scores(self._tokenize(query))
        top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k]
        results = []
        for idx in top_indices:
            if scores[idx] > 0:
                chunk = dict(self.corpus[idx])
                chunk.pop("tokens", None)
                chunk["sparse_score"] = float(scores[idx])
                results.append(chunk)
        return results

    def delete_document(self, doc_id: str):
        self.corpus = [c for c in self.corpus if c.get("doc_id") != doc_id]
        self._rebuild_bm25()
        self._save()


_bm25_cache: dict[str, BM25Store] = {}


def get_bm25_store(namespace: str) -> BM25Store:
    if namespace not in _bm25_cache:
        _bm25_cache[namespace] = BM25Store(namespace)
    return _bm25_cache[namespace]
