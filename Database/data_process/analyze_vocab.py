"""Analyze word frequency distribution to find optimal thresholds."""
import json
from wordfreq import zipf_frequency

data = json.load(open(r'c:\HOCTAP\KLTN_main\Database\questions.json', 'r', encoding='utf-8'))
vocab = [q for q in data if q['skill'] == 'VOCABULARY']

# Collect all correct answer frequencies
freqs = []
for q in vocab:
    correct = q['correct']
    if not correct:
        continue
    ans = q[correct.lower()]
    freq = zipf_frequency(ans.lower(), 'en')
    freqs.append((freq, ans))

freqs.sort(reverse=True)

print(f"Total vocab words: {len(freqs)}")
print(f"Max freq: {freqs[0][0]:.2f} ({freqs[0][1]})")
print(f"Min freq: {freqs[-1][0]:.2f} ({freqs[-1][1]})")

# Distribution histogram
print("\n=== FREQUENCY DISTRIBUTION ===")
bins = [(0, 2), (2, 3), (3, 3.5), (3.5, 4), (4, 4.5), (4.5, 5), (5, 5.5), (5.5, 6), (6, 8)]
for lo, hi in bins:
    count = sum(1 for f, _ in freqs if lo <= f < hi)
    words = [w for f, w in freqs if lo <= f < hi]
    sample = ', '.join(words[:5])
    print(f"  {lo:.1f}-{hi:.1f}: {count:3d} questions | e.g. {sample}")

# Find percentile-based thresholds (33%/66%)
n = len(freqs)
p33 = freqs[int(n * 0.33)][0]
p66 = freqs[int(n * 0.66)][0]
print(f"\n=== PERCENTILE-BASED THRESHOLDS ===")
print(f"33rd percentile: {p33:.2f}")
print(f"66th percentile: {p66:.2f}")

# Simulate different threshold options
print("\n=== THRESHOLD SIMULATIONS ===")
options = [
    ("Current: 4.5 / 3.0", 4.5, 3.0),
    ("Option A: 5.0 / 4.0", 5.0, 4.0),
    ("Option B: 4.8 / 3.8", 4.8, 3.8),
    ("Option C: 4.6 / 3.5", 4.6, 3.5),
    (f"Percentile: {p66:.1f} / {p33:.1f}", p66, p33),
]

for name, t1, t2 in options:
    l1 = sum(1 for f, _ in freqs if f >= t1)
    l2 = sum(1 for f, _ in freqs if t2 <= f < t1)
    l3 = sum(1 for f, _ in freqs if f < t2)
    print(f"  {name:30s} -> L1={l1:3d}, L2={l2:3d}, L3={l3:3d}")
