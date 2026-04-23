import psycopg2

conn = psycopg2.connect(host='localhost', port=5432, database='DB_KLTN_final', user='postgres', password='bun123')
cur = conn.cursor()

for table in ['nganhangcauhoi', 'baikiemtra', 'chitietlambai']:
    cur.execute(f"""
        SELECT column_name, data_type, column_default, is_nullable
        FROM information_schema.columns 
        WHERE table_name = '{table}'
        ORDER BY ordinal_position
    """)
    rows = cur.fetchall()
    print(f"\n=== {table} ===")
    for r in rows:
        print(f"  {r[0]:25s} | {r[1]:30s} | default: {str(r[2])[:30]:30s} | nullable: {r[3]}")

cur.close()
conn.close()
