import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os

DB_HOST = "localhost"
DB_PORT = 8386
DB_USER = "postgres"
DB_PASSWORD = "postgres"
DB_NAME = "kltn_edtech_ai"

try:
    # 1. Connect to default 'postgres' database to create the new database
    print(f"Connecting to default database to create {DB_NAME}...")
    conn = psycopg2.connect(dbname="postgres", user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Check if exist and handle reset
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
    exists = cursor.fetchone()
    if exists:
        print(f"Database {DB_NAME} already exists. Resetting database...")
        cursor.execute(f"DROP DATABASE {DB_NAME} WITH (FORCE);")
        print(f"Existing database {DB_NAME} dropped.")
    
    print(f"Creating database {DB_NAME}...")
    cursor.execute(f"CREATE DATABASE {DB_NAME};")
    
    cursor.close()
    conn.close()

    # 2. Connect to the new database and execute the SQL script
    print(f"Applying SQL schema from db_kltn_final.sql...")
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT)
    cursor = conn.cursor()
    
    sql_path = "C:\\Users\\admin\\Desktop\\letnow\\KLTN_final\\KLTN\\Database\\db_kltn_final.sql"
    with open(sql_path, "r", encoding="utf-8") as file:
        sql_script = file.read()
    
    cursor.execute(sql_script)
    conn.commit()
    print("Database configured and schema applied successfully!")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error during database initialization: {e}")
