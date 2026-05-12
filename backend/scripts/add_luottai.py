from database import engine
from sqlalchemy import text

def add_luottai_column():
    with engine.begin() as conn:
        try:
            conn.execute(text('ALTER TABLE bo_the_flashcard ADD COLUMN "LuotTai" INTEGER DEFAULT 0;'))
            print("Successfully added 'LuotTai' column.")
        except Exception as e:
            print(f"Error (maybe it already exists?): {e}")

if __name__ == "__main__":
    add_luottai_column()
