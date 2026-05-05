from learning_engine.path_builder import build_learning_path
from collections import Counter

for sev, label in [(0,'LOW'), (1,'MED'), (2,'HIGH')]:
    nodes = build_learning_path(
        {'severity': sev, 'weights': {'grammar':0.4,'listening':0.3,'vocab':0.3}, 'weak_skills': ['grammar']},
        'B'
    )
    kinds = Counter(n['kind'] for n in nodes)
    total = len(nodes)
    core = kinds.get('CORE', 0)
    review = kinds.get('REVIEW', 0)
    final = kinds.get('FINAL_TEST', 0)
    print(f"Severity {label}: {total} tram | CORE={core} REVIEW={review} FINAL={final}")
    template = " -> ".join(
        "CORE" if n["kind"]=="CORE" else ("REV" if n["kind"]=="REVIEW" else "FINAL")
        for n in nodes
    )
    print(f"  {template}")
    print()
