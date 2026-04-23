from gliclass import GLiClassModel, ZeroShotClassificationPipeline
from transformers import AutoTokenizer


class GLiClassSingleton:
    _pipeline = None

    @classmethod
    def get(cls) -> ZeroShotClassificationPipeline:
        if cls._pipeline is None:
            model = GLiClassModel.from_pretrained(
                "knowledgator/gliclass-small-v1",
                trust_remote_code=True,
            )
            tokenizer = AutoTokenizer.from_pretrained("knowledgator/gliclass-small-v1")
            cls._pipeline = ZeroShotClassificationPipeline(
                model=model,
                tokenizer=tokenizer,
                classification_type="multi-label",
                device="cpu",
            )
        return cls._pipeline


HALLUCINATION_LABELS = [
    "the answer is grounded in the provided context",
    "the answer contains information not found in the context",
    "the answer contradicts the provided context",
    "the answer is a partial hallucination",
]

_GROUNDED_LABEL = "the answer is grounded in the provided context"
_HALLUCINATION_GROUP = {
    "the answer contains information not found in the context",
    "the answer contradicts the provided context",
    "the answer is a partial hallucination",
}


def detect_hallucination(
    llm_response: str,
    context: str,
    hallucination_threshold: float = 0.5,
) -> dict:
    if not context.strip():
        return {
            "verdict": "no_context",
            "confidence": 0.0,
            "grounded_score": 0.0,
            "hallucination_score": 0.0,
            "should_warn": False,
            "label_scores": {},
        }

    pipeline = GLiClassSingleton.get()
    combined_text = (
        f"Context: {context[:1000]}\n\n"
        f"Answer: {llm_response[:500]}"
    )

    try:
        results = pipeline(combined_text, HALLUCINATION_LABELS, threshold=0.0)
        label_scores = {r["label"]: r["score"] for r in results}

        grounded_score = label_scores.get(_GROUNDED_LABEL, 0.0)
        hallucination_score = max(
            (label_scores.get(lbl, 0.0) for lbl in _HALLUCINATION_GROUP),
            default=0.0,
        )

        if grounded_score > 0.7 and hallucination_score < hallucination_threshold:
            verdict = "grounded"
        elif hallucination_score >= hallucination_threshold:
            partial = label_scores.get("the answer is a partial hallucination", 0.0)
            verdict = "partial" if partial > 0.4 else "hallucinated"
        else:
            verdict = "uncertain"

        return {
            "verdict": verdict,
            "confidence": max(grounded_score, hallucination_score),
            "grounded_score": round(grounded_score, 3),
            "hallucination_score": round(hallucination_score, 3),
            "should_warn": hallucination_score >= hallucination_threshold,
            "label_scores": {k: round(v, 3) for k, v in label_scores.items()},
        }
    except Exception as e:
        return {
            "verdict": "detector_error",
            "confidence": 0.0,
            "grounded_score": 0.0,
            "hallucination_score": 0.0,
            "should_warn": False,
            "label_scores": {},
            "error": str(e),
        }
