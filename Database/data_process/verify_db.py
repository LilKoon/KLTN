"""Verify the final state of questions in the database."""
import psycopg2

conn = psycopg2.connect(host='localhost', port=5432, database='DB_KLTN_final', user='postgres', password='bun123')
cur = conn.cursor()

cur.execute("SELECT kynang, mucdo, COUNT(*) FROM nganhangcauhoi GROUP BY kynang, mucdo ORDER BY kynang, mucdo")
rows = cur.fetchall()

print("=== DATABASE SUMMARY ===")
print(f"{'Skill':<15} {'Level':<8} {'Count':<8}")
print("-" * 31)
total = 0
for skill, level, count in rows:
    print(f"{skill:<15} {level:<8} {count:<8}")
    total += count
print("-" * 31)
print(f"{'TOTAL':<24} {total}")

# Show sample questions per level for VOCABULARY
print("\n=== SAMPLE VOCABULARY QUESTIONS ===")
for level in [1, 2, 3]:
    cur.execute(
        "SELECT noidung, dapandung, giaithich FROM nganhangcauhoi WHERE kynang='VOCABULARY' AND mucdo=%s LIMIT 3",
        (level,)
    )
    print(f"\n--- Level {level} ---")
    for q, ans, exp in cur.fetchall():
        print(f"  Q: {q[:70]}...")
        print(f"  A: {ans} | {exp[:60]}")

cur.close()
conn.close()
