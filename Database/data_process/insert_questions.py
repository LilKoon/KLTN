"""
Insert questions from questions.json into nganhangcauhoi table.
Supports both GRAMMAR and VOCABULARY questions.
Includes duplicate check to avoid re-inserting existing questions.
"""
import json
import psycopg2

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "DB_KLTN_final",
    "user": "postgres",
    "password": "bun123"
}

def main():
    with open(r'c:\Bun\KLTN_main\Database\data_process\questions.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"Loaded {len(questions)} questions from JSON")

    # Show summary by skill
    skill_counts = {}
    for q in questions:
        skill = q["skill"]
        skill_counts[skill] = skill_counts.get(skill, 0) + 1
    for skill, count in sorted(skill_counts.items()):
        print(f"  {skill}: {count} questions")

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    # Check how many questions already exist per skill
    cur.execute("SELECT kynang, COUNT(*) FROM nganhangcauhoi GROUP BY kynang")
    existing = dict(cur.fetchall())
    if existing:
        print(f"\nExisting questions in DB:")
        for skill, count in sorted(existing.items()):
            print(f"  {skill}: {count}")

    insert_sql = """
        INSERT INTO nganhangcauhoi 
        (kynang, mucdo, noidung, dsdapan, dapandung, giaithich, mucdichsudung)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    # Check for duplicates using question content
    check_sql = """
        SELECT COUNT(*) FROM nganhangcauhoi 
        WHERE noidung = %s AND kynang = %s
    """

    inserted = 0
    skipped = 0
    errors = 0

    for i, q in enumerate(questions):
        try:
            # Check if question already exists
            cur.execute(check_sql, (q["question"], q["skill"]))
            count = cur.fetchone()[0]
            if count > 0:
                skipped += 1
                continue

            dsdapan = json.dumps({
                "A": q["a"],
                "B": q["b"],
                "C": q["c"],
                "D": q["d"]
            }, ensure_ascii=False)

            cur.execute(insert_sql, (
                q["skill"],
                q["level"],
                q["question"],
                dsdapan,
                q["correct"],
                q["explanation"],
                "EXAM"
            ))
            inserted += 1
        except Exception as e:
            errors += 1
            print(f"Error inserting question {i+1}: {e}")
            conn.rollback()
            cur = conn.cursor()

    conn.commit()
    cur.close()
    conn.close()

    print(f"")
    print(f"Successfully inserted: {inserted} questions")
    print(f"Skipped (already exist): {skipped} questions")
    print(f"Errors: {errors}")

if __name__ == '__main__':
    main()
