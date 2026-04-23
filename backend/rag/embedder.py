from sentence_transformers import SentenceTransformer
import numpy as np


class EmbedderSingleton:
    _model: SentenceTransformer | None = None

    @classmethod
    def get(cls) -> SentenceTransformer:
        if cls._model is None:
            cls._model = SentenceTransformer("BAAI/bge-small-en-v1.5")
        return cls._model


def embed_texts(texts: list[str], is_query: bool = False) -> np.ndarray:
    """
    BGE requires different prefix for query vs document.
    Query:    "Represent this sentence for searching relevant passages: {text}"
    Document: text as-is
    """
    model = EmbedderSingleton.get()
    if is_query:
        texts = [f"Represent this sentence for searching relevant passages: {t}" for t in texts]
    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        batch_size=32,
        show_progress_bar=False,
        convert_to_numpy=True,
    )
    return embeddings.astype(np.float32)


def embed_documents(texts: list[str]) -> np.ndarray:
    return embed_texts(texts, is_query=False)


def embed_query(query: str) -> np.ndarray:
    return embed_texts([query], is_query=True)
