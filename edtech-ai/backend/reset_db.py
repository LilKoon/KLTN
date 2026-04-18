import database, models
from sqlalchemy import text

with database.engine.begin() as conn:
    print("Dropping old flashcard tables if they exist...")
    conn.execute(text('DROP TABLE IF EXISTS "TheGhiNho_NguoiDung" CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS "TheGhiNho" CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS "BoTheGhiNho" CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS "ChuDeFlashcard" CASCADE;'))
    
print("Recreating tables based on models.py schema...")
models.Base.metadata.create_all(bind=database.engine)
print("DB RESET DONE")
