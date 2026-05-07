"""
Train English Learning Engine từ synth data.

Outputs (export ONNX, ghi vào --artifacts):
  - grammar.onnx, listening.onnx, vocab.onnx — binary XGBoost (input=[None,10])
  - severity.onnx — 3-class XGBoost (input=[None,10])
  - trend_gru.onnx — torch GRU (input='history' [B,T,3] → 'next_skill' [B,3])

Usage:
    python train_engine.py --data ./out --artifacts /home/nghiatran/KLTN2/KLTN/backend/learning_engine/artifacts
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

from onnxmltools.convert import convert_xgboost
from onnxmltools.convert.common.data_types import FloatTensorType

FEATURES = [
    "level", "grammar", "listening", "vocab",
    "g_gap", "l_gap", "v_gap",
    "trend_g", "trend_l", "trend_v",
]
N_FEATURES = len(FEATURES)


def train_binary_xgb(X_tr, y_tr, X_te, y_te, name: str) -> XGBClassifier:
    model = XGBClassifier(
        n_estimators=200, max_depth=4, learning_rate=0.08,
        objective="binary:logistic", eval_metric="logloss",
        random_state=42, n_jobs=4,
    )
    model.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], verbose=False)
    train_acc = model.score(X_tr, y_tr)
    test_acc = model.score(X_te, y_te)
    print(f"  [{name}] train_acc={train_acc:.3f}  test_acc={test_acc:.3f}")
    return model


def train_multiclass_xgb(X_tr, y_tr, X_te, y_te) -> XGBClassifier:
    model = XGBClassifier(
        n_estimators=200, max_depth=4, learning_rate=0.08,
        objective="multi:softprob", num_class=3, eval_metric="mlogloss",
        random_state=42, n_jobs=4,
    )
    model.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], verbose=False)
    print(f"  [severity] train_acc={model.score(X_tr, y_tr):.3f}  test_acc={model.score(X_te, y_te):.3f}")
    return model


def export_xgb_onnx(model: XGBClassifier, n_features: int, out_path: Path):
    initial_types = [("input", FloatTensorType([None, n_features]))]
    onx = convert_xgboost(model, initial_types=initial_types, target_opset=15)
    out_path.write_bytes(onx.SerializeToString())
    print(f"  → {out_path.name}")


# ---------- GRU forecaster ----------
class TrendGRU(nn.Module):
    def __init__(self, input_size=3, hidden_size=16, output_size=3):
        super().__init__()
        self.gru = nn.GRU(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        self.sig = nn.Sigmoid()

    def forward(self, history):  # history: [B, T, 3]
        out, _ = self.gru(history)
        last = out[:, -1, :]
        return self.sig(self.fc(last))  # [B, 3] in [0,1]


def train_gru(X: np.ndarray, y: np.ndarray, epochs: int = 30, batch: int = 256) -> TrendGRU:
    Xt = torch.from_numpy(X)
    yt = torch.from_numpy(y)
    n_train = int(0.8 * len(Xt))
    perm = torch.randperm(len(Xt))
    tr_idx, te_idx = perm[:n_train], perm[n_train:]
    X_tr, y_tr = Xt[tr_idx], yt[tr_idx]
    X_te, y_te = Xt[te_idx], yt[te_idx]

    model = TrendGRU()
    opt = torch.optim.Adam(model.parameters(), lr=1e-3)
    loss_fn = nn.MSELoss()

    for ep in range(epochs):
        model.train()
        for i in range(0, len(X_tr), batch):
            xb = X_tr[i:i + batch]
            yb = y_tr[i:i + batch]
            opt.zero_grad()
            pred = model(xb)
            loss = loss_fn(pred, yb)
            loss.backward()
            opt.step()
        if (ep + 1) % 10 == 0:
            model.eval()
            with torch.no_grad():
                te_loss = loss_fn(model(X_te), y_te).item()
            print(f"  [gru] epoch {ep+1}: test_mse={te_loss:.5f}")
    return model


def export_gru_onnx(model: TrendGRU, out_path: Path):
    model.eval()
    dummy = torch.randn(1, 4, 3)
    torch.onnx.export(
        model, dummy, str(out_path),
        input_names=["history"],
        output_names=["next_skill"],
        dynamic_axes={"history": {0: "batch", 1: "timesteps"}, "next_skill": {0: "batch"}},
        opset_version=15,
        dynamo=False,
    )
    print(f"  → {out_path.name}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", type=str, default=str(Path(__file__).parent / "out"))
    ap.add_argument("--artifacts", type=str, required=True)
    args = ap.parse_args()

    data_dir = Path(args.data)
    art_dir = Path(args.artifacts)
    art_dir.mkdir(parents=True, exist_ok=True)

    print(f"[INFO] Reading {data_dir / 'tabular.csv'}")
    df = pd.read_csv(data_dir / "tabular.csv")
    X = df[FEATURES].values.astype(np.float32)

    print("\n[STEP 1] Train 3 binary models (weak_grammar/listening/vocab)")
    for skill, label in [("grammar", "weak_grammar"),
                         ("listening", "weak_listening"),
                         ("vocab", "weak_vocab")]:
        y = df[label].values.astype(np.int64)
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        m = train_binary_xgb(X_tr, y_tr, X_te, y_te, skill)
        export_xgb_onnx(m, N_FEATURES, art_dir / f"{skill}.onnx")

    print("\n[STEP 2] Train severity (3-class)")
    y = df["severity"].values.astype(np.int64)
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    m = train_multiclass_xgb(X_tr, y_tr, X_te, y_te)
    export_xgb_onnx(m, N_FEATURES, art_dir / "severity.onnx")

    print("\n[STEP 3] Train GRU (forecast next-skill from history)")
    seqs = np.load(data_dir / "sequences.npz")
    X_seq = seqs["X"]; y_seq = seqs["y"]
    gru = train_gru(X_seq, y_seq, epochs=30)
    export_gru_onnx(gru, art_dir / "trend_gru.onnx")

    print(f"\n[OK] Artifacts written to {art_dir}")


if __name__ == "__main__":
    main()
