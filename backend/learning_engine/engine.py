"""
Personalized English Learning Engine — port từ
train_learning_path/english_learning_engine.ipynb (Cell 16, Part 7+8).

Inference qua 4 model XGBoost (binary weak/strong cho từng kỹ năng + multi-class
severity) đã export sang ONNX. GRU ONNX dùng để tính trend từ history (tuỳ chọn).

Features = [level_idx, grammar, listening, vocab, g_gap, l_gap, v_gap, trend_g, trend_l, trend_v]
trong đó *_gap = overall - skill, overall = mean(3 skill).
"""

from __future__ import annotations

import os
import threading
from pathlib import Path
from typing import Optional

import numpy as np
import onnxruntime as ort

LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"]
LEVEL_TO_NUM = {lv: i + 1 for i, lv in enumerate(LEVEL_ORDER)}

# 3-bucket A/B/C → CEFR proxy ở giữa mỗi bucket (A1+A2 → A2, B1+B2 → B1, C1+C2 → C1).
# Mục đích: ONNX models train theo CEFR; user-facing chỉ dùng A/B/C.
ABC_TO_CEFR = {"A": "A2", "B": "B1", "C": "C1"}


def normalize_level(level: str) -> str:
    """Chấp nhận 'A'/'B'/'C' (mới) hoặc CEFR cũ. Trả về CEFR cho ONNX."""
    if not level:
        return "B1"
    lv = level.strip().upper()
    if lv in ABC_TO_CEFR:
        return ABC_TO_CEFR[lv]
    if lv in LEVEL_TO_NUM:
        return lv
    return "B1"

SKILL_KEYS = ["grammar", "listening", "vocab"]
TREND_KEYS = {"grammar": "trend_g", "listening": "trend_l", "vocab": "trend_v"}

ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"
INPUT_NAME = "input"  # tên input của 4 XGBoost ONNX

_LOCK = threading.Lock()
_INSTANCE: Optional["EnglishLearningEngine"] = None


def compute_weights(weak_flags: dict, trends: dict) -> dict:
    raw = {k: 0.33 for k in SKILL_KEYS}
    for k in SKILL_KEYS:
        if weak_flags.get(k, 0) == 1:
            raw[k] += 0.2
        slope = trends[TREND_KEYS[k]]
        if slope < 0:
            raw[k] += 0.2
        elif slope > 0:
            raw[k] -= 0.1
    raw = {k: max(v, 0.0) for k, v in raw.items()}
    s = sum(raw.values())
    if s == 0:
        return {k: 1 / 3 for k in SKILL_KEYS}
    return {k: round(v / s, 4) for k, v in raw.items()}


class EnglishLearningEngine:
    """Lazy-loaded singleton: nạp ONNX 1 lần, tái sử dụng cho mọi request."""

    def __init__(self, artifact_dir: Path = ARTIFACT_DIR):
        providers = ["CPUExecutionProvider"]
        self.sessions = {
            name: ort.InferenceSession(str(artifact_dir / f"{name}.onnx"), providers=providers)
            for name in ("grammar", "listening", "vocab", "severity")
        }
        gru_path = artifact_dir / "trend_gru.onnx"
        self.gru_session = (
            ort.InferenceSession(str(gru_path), providers=providers)
            if gru_path.is_file() else None
        )

    def _trends_from_history(self, history_arr: np.ndarray):
        if self.gru_session is None:
            raise RuntimeError("GRU ONNX chưa được nạp.")
        x = history_arr.astype(np.float32).reshape(1, -1, 3)
        pred = self.gru_session.run(None, {"history": x})[0].reshape(-1)
        last = history_arr[-1]
        return float(pred[0] - last[0]), float(pred[1] - last[1]), float(pred[2] - last[2])

    def _build_features(self, payload: dict):
        level = normalize_level(payload["level"])
        if level not in LEVEL_TO_NUM:
            raise ValueError(f"Unknown level: {payload['level']}")
        g = float(payload["grammar"])
        l = float(payload["listening"])
        v = float(payload["vocab"])
        overall = (g + l + v) / 3.0
        if "history" in payload and payload["history"] is not None:
            tg, tl, tv = self._trends_from_history(np.asarray(payload["history"], dtype=np.float32))
        else:
            tg = float(payload.get("trend_g", 0.0))
            tl = float(payload.get("trend_l", 0.0))
            tv = float(payload.get("trend_v", 0.0))
        feats = [
            LEVEL_TO_NUM[level], g, l, v,
            overall - g, overall - l, overall - v,
            tg, tl, tv,
        ]
        return np.array([feats], dtype=np.float32), {"trend_g": tg, "trend_l": tl, "trend_v": tv}

    @staticmethod
    def _binary(session, x):
        out = session.run(None, {INPUT_NAME: x})
        return int(np.asarray(out[0]).reshape(-1)[0])

    def predict(self, payload: dict) -> dict:
        x, trends = self._build_features(payload)
        weak_flags = {
            "grammar": self._binary(self.sessions["grammar"], x),
            "listening": self._binary(self.sessions["listening"], x),
            "vocab": self._binary(self.sessions["vocab"], x),
        }
        weak_skills = [k for k, f in weak_flags.items() if f == 1]
        sev = self._binary(self.sessions["severity"], x)
        return {
            "weak_skills": weak_skills,
            "weak_flags": weak_flags,
            "severity": sev,
            "weights": compute_weights(weak_flags, trends),
            "trends": {k: round(v, 4) for k, v in trends.items()},
        }


def get_engine() -> EnglishLearningEngine:
    """Thread-safe lazy singleton."""
    global _INSTANCE
    if _INSTANCE is not None:
        return _INSTANCE
    with _LOCK:
        if _INSTANCE is None:
            _INSTANCE = EnglishLearningEngine()
    return _INSTANCE
