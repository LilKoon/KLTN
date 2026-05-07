"""
Sinh dữ liệu ảo cho training English Learning Engine.

Tạo 2 dataset:
1. tabular.csv — features 10-D (level, scores, gaps, trends) + 4 labels (3 weak + severity)
   Dùng để train 3 binary XGBoost (weak_grammar/listening/vocab) + 1 multiclass severity (0/1/2)

2. sequences.npz — sequences (N, T, 3) score history + targets (N, 3) next-skill
   Dùng để train GRU dự đoán điểm tiếp theo

Usage:
    python generate_synth_data.py --n 10000 --out ./out
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

LEVELS = [1, 2, 3, 4, 5, 6]  # A1, A2, B1, B2, C1, C2 → idx 1..6
LEVEL_PROB = [0.15, 0.20, 0.20, 0.20, 0.15, 0.10]


def sample_user_skills(n: int, rng: np.random.Generator) -> tuple[np.ndarray, ...]:
    """Sinh level + LATENT ability (ẩn) + observed score (có noise).

    Trả: levels, (g_latent, l_latent, v_latent), (g_obs, l_obs, v_obs).
    Labels được tính từ latent (ground truth ẩn). Model chỉ thấy observed.
    """
    levels = rng.choice(LEVELS, size=n, p=LEVEL_PROB)
    base = levels / 6.0 + rng.normal(0, 0.08, n)
    base = np.clip(base, 0.05, 0.99)
    bias = rng.normal(0, 0.12, (n, 3))  # bias per skill per user
    g_lat = np.clip(base + bias[:, 0], 0.0, 1.0)
    l_lat = np.clip(base + bias[:, 1], 0.0, 1.0)
    v_lat = np.clip(base + bias[:, 2], 0.0, 1.0)
    # Observed = latent + noise (do may rủi, mệt, đoán đúng/sai trên 30 câu MCQ)
    obs_noise = rng.normal(0, 0.08, (n, 3))
    g_obs = np.clip(g_lat + obs_noise[:, 0], 0.0, 1.0)
    l_obs = np.clip(l_lat + obs_noise[:, 1], 0.0, 1.0)
    v_obs = np.clip(v_lat + obs_noise[:, 2], 0.0, 1.0)
    return levels, (g_lat, l_lat, v_lat), (g_obs, l_obs, v_obs)


def build_tabular(n: int, rng: np.random.Generator,
                  flip_rate: float = 0.08) -> pd.DataFrame:
    levels, (g_lat, l_lat, v_lat), (g, l, v) = sample_user_skills(n, rng)
    overall_obs = (g + l + v) / 3.0
    overall_lat = (g_lat + l_lat + v_lat) / 3.0

    # Trends: random + correlation nhẹ với latent ability
    trend_g = rng.normal(0, 0.10, n) - 0.05 * (1.0 - g_lat)
    trend_l = rng.normal(0, 0.10, n) - 0.05 * (1.0 - l_lat)
    trend_v = rng.normal(0, 0.10, n) - 0.05 * (1.0 - v_lat)

    # Features model thấy: chỉ observed (KHÔNG có latent)
    df = pd.DataFrame({
        "level": levels.astype(np.float32),
        "grammar": g.astype(np.float32),
        "listening": l.astype(np.float32),
        "vocab": v.astype(np.float32),
        "g_gap": (overall_obs - g).astype(np.float32),
        "l_gap": (overall_obs - l).astype(np.float32),
        "v_gap": (overall_obs - v).astype(np.float32),
        "trend_g": trend_g.astype(np.float32),
        "trend_l": trend_l.astype(np.float32),
        "trend_v": trend_v.astype(np.float32),
    })

    # Labels: tính từ LATENT (ground truth) — model phải estimate latent từ observed
    weak_g = ((g_lat < 0.55) | (overall_lat - g_lat > 0.15)).astype(int)
    weak_l = ((l_lat < 0.55) | (overall_lat - l_lat > 0.15)).astype(int)
    weak_v = ((v_lat < 0.55) | (overall_lat - v_lat > 0.15)).astype(int)

    # Label flip: ~flip_rate% nhãn bị nhiễu (data thực luôn có)
    flip = rng.random((n, 3)) < flip_rate
    weak_g = np.where(flip[:, 0], 1 - weak_g, weak_g)
    weak_l = np.where(flip[:, 1], 1 - weak_l, weak_l)
    weak_v = np.where(flip[:, 2], 1 - weak_v, weak_v)

    df["weak_grammar"] = weak_g
    df["weak_listening"] = weak_l
    df["weak_vocab"] = weak_v

    # Severity 3-class trên LATENT:
    min_lat = np.minimum(np.minimum(g_lat, l_lat), v_lat)
    sev = np.ones(n, dtype=int)
    sev[(g_lat >= 0.65) & (l_lat >= 0.65) & (v_lat >= 0.65)] = 0
    sev[min_lat < 0.30] = 2
    # Label flip cho severity: 5% sai (nhỏ hơn vì 3-class)
    sev_flip = rng.random(n) < 0.05
    # Khi flip, đẩy lên hoặc xuống 1 mức
    drift = rng.choice([-1, 1], size=n)
    sev_flipped = np.clip(sev + drift, 0, 2)
    sev = np.where(sev_flip, sev_flipped, sev)
    df["severity"] = sev

    return df


def build_sequences(n: int, t_max: int, rng: np.random.Generator) -> tuple[np.ndarray, np.ndarray]:
    """Sinh n sequence chiều dài T_max của 3 skill (g, l, v) ∈ [0,1].
    target = skill ở thời điểm T_max+1 (forecast). Có noise observation."""
    _, _, (g0, l0, v0) = sample_user_skills(n, rng)
    seqs = np.zeros((n, t_max, 3), dtype=np.float32)
    seqs[:, 0, 0] = g0
    seqs[:, 0, 1] = l0
    seqs[:, 0, 2] = v0
    # Random walk: drift + noise
    drift = rng.normal(0, 0.05, (n, t_max - 1, 3))
    for t in range(1, t_max):
        seqs[:, t, :] = np.clip(seqs[:, t - 1, :] + drift[:, t - 1, :], 0.0, 1.0)
    # Target = next step với noise — không phải pure extrapolation
    last_drift = (seqs[:, -1, :] - seqs[:, -2, :])
    target_noise = rng.normal(0, 0.04, (n, 3))
    targets = np.clip(seqs[:, -1, :] + last_drift + target_noise, 0.0, 1.0).astype(np.float32)
    return seqs, targets


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=10000, help="Số user (rows)")
    ap.add_argument("--seq_len", type=int, default=4, help="Sequence length cho GRU")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--out", type=str, default=str(Path(__file__).parent / "out"))
    args = ap.parse_args()

    rng = np.random.default_rng(args.seed)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    print(f"[INFO] Sinh tabular dataset: {args.n} rows")
    df = build_tabular(args.n, rng)
    df.to_csv(out / "tabular.csv", index=False)
    print(f"  → {out / 'tabular.csv'}")
    print(f"  Label balance:")
    for col in ["weak_grammar", "weak_listening", "weak_vocab"]:
        print(f"    {col}: {df[col].mean():.3f} weak ratio")
    print(f"    severity distribution: {df['severity'].value_counts().sort_index().to_dict()}")

    print(f"\n[INFO] Sinh sequence dataset: {args.n} sequences × T={args.seq_len}")
    seqs, targets = build_sequences(args.n, args.seq_len, rng)
    np.savez(out / "sequences.npz", X=seqs, y=targets)
    print(f"  → {out / 'sequences.npz'} (X shape={seqs.shape}, y shape={targets.shape})")

    print("\n[OK] Done.")


if __name__ == "__main__":
    main()
