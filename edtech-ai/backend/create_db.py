import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from database import settings

# Parse the DATABASE_URL
# postgresql://postgres:<password>@localhost:5432/edtech_ai
url = settings.DATABASE_URL
# Replace the database name with 'postgres' to connect to the default DB
default_db_url = url.rsplit("/", 1)[0] + "/postgres"

try:
    print(f"Connecting to default DB to create edtech_ai...")
    # Connect to PostgreSQL server
    connection = psycopg2.connect(default_db_url)
    connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = connection.cursor()

    # Check if DB exists
    cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'edtech_ai'")
    exists = cursor.fetchone()
    
    if not exists:
        cursor.execute("CREATE DATABASE edtech_ai")
        print("Database 'edtech_ai' created successfully!")
    else:
        print("Database 'edtech_ai' already exists.")

    cursor.close()
    connection.close()
except Exception as e:
    print("Error creating database:", e)
