import pandas as pd
import psycopg2
import json

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "DB_KLTN_final",
    "user": "postgres",
    "password": "bun123"
}

def main():
    excel_path = r'c:\Bun\KLTN_main\Database\listen_data\Dapan_Listenning.xlsx'
    df = pd.read_excel(excel_path)
    
    print(f"Loaded {len(df)} listening questions from Excel")
    
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    insert_sql = """
        INSERT INTO nganhangcauhoi 
        (kynang, mucdo, noidung, dsdapan, dapandung, giaithich, mucdichsudung, fileaudiodinhkem)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    # Check current DB state
    cur.execute("SELECT COUNT(*) FROM nganhangcauhoi WHERE kynang='LISTENING' AND mucdichsudung='DAU_VAO'")
    existing_count = cur.fetchone()[0]
    if existing_count > 0:
        print(f"Found {existing_count} existing LISTENING questions. Proceeding to append new ones...")

    inserted = 0
    errors = 0
    
    for idx, row in df.iterrows():
        try:
            audio_file = str(row.get('AudioFile', '')).strip()
            # Clean up potential invisible characters
            audio_file = audio_file.replace('\n', '').replace('\r', '')
            
            if pd.isna(row.get('AudioFile')) or not audio_file or audio_file.lower() == 'nan':
                continue
                
            transcript = str(row.get('Transcript', '')).strip()
            if transcript.lower() == 'nan': transcript = ''
                
            opt_A = str(row.get('Option_A', '')).strip()
            opt_B = str(row.get('Option_B', '')).strip()
            opt_C = str(row.get('Option_C', '')).strip()
            correct = str(row.get('CorrectAnswer', '')).strip().upper()
            
            level = row.get('Level', 1)
            if pd.isna(level):
                level = 1
            else:
                level = int(level)
                
            ds_dapan = json.dumps({
                "A": opt_A,
                "B": opt_B,
                "C": opt_C
            }, ensure_ascii=False)
            
            noidung = "Listen to the audio and choose the correct answer."
            
            # Put Transcript in the Explanation (giaithich) column to fulfill
            # "hiện đáp án kèm theo Transcipts thay vì giải thích"
            giaithich_text = transcript if transcript else "Trânscript file content is empty."
            
            cur.execute(insert_sql, (
                "LISTENING",
                level,
                noidung,
                ds_dapan,
                correct,
                giaithich_text,
                "DAU_VAO",
                audio_file
            ))
            inserted += 1
            
        except Exception as e:
            errors += 1
            print(f"Error inserting row {idx}: {e}")
            conn.rollback()
            cur = conn.cursor()
            
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"Successfully inserted: {inserted} listening questions")
    print(f"Errors: {errors}")

if __name__ == '__main__':
    main()
