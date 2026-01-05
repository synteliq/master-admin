
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_NAME = os.getenv("DB_NAME", "master_admin_db")
DB_USER = os.getenv("DB_USER", "mobiledevarkatiss")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PASSWORD = os.getenv("DB_PASSWORD", None)
DB_PORT = os.getenv("DB_PORT", "5432")

def apply_migration():
    try:
        conn = psycopg2.connect(
            database=DB_NAME,
            user=DB_USER,
            host=DB_HOST,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        cur = conn.cursor()
        
        with open('migration.sql', 'r') as f:
            sql = f.read()
            
        print("Executing SQL...")
        print(sql)
        
        cur.execute(sql)
        conn.commit()
        
        print("Migration successful!")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    apply_migration()
