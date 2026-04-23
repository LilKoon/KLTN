"""
Kiểm tra phân phối level của tất cả LISTENING trong DB.
"""
import psycopg2
import re
from collections import Counter

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "DB_KLTN_final",
    "user": "postgres",
    "password": "bun123"
}

conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

cur.execute("""
    SELECT mucdo, fileaudiodinhkem
    FROM nganhangcauhoi 
    WHERE kynang='LISTENING' AND mucdichsudung='DAU_VAO'
    ORDER BY fileaudiodinhkem
""")
rows = cur.fetchall()

print(f"Total LISTENING: {len(rows)}")

# Đếm theo level
level_counts = Counter(r[0] for r in rows)
print("\nLevel distribution:")
for lvl in sorted(level_counts.keys()):
    print(f"  Level {lvl}: {level_counts[lvl]} câu")

# Đếm theo test
test_counts = Counter()
for r in rows:
    audio = r[1] or ''
    m = re.match(r'Test(\d+)_', audio, re.IGNORECASE)
    if m:
        test_counts[int(m.group(1))] += 1
        
print("\nPer test:")
for t in sorted(test_counts.keys()):
    print(f"  Test {t}: {test_counts[t]} câu")

# Level per test
print("\nLevel per test:")
test_level = {}
for r in rows:
    audio = r[1] or ''
    m = re.match(r'Test(\d+)_', audio, re.IGNORECASE)
    if m:
        t = int(m.group(1))
        if t not in test_level:
            test_level[t] = Counter()
        test_level[t][r[0]] += 1

for t in sorted(test_level.keys()):
    print(f"  Test {t}: {dict(sorted(test_level[t].items()))}")

cur.close()
conn.close()
