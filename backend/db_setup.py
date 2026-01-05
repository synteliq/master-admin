import os
from dotenv import load_dotenv

load_dotenv()
import json
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

DB_NAME = os.getenv("DB_NAME", "master_admin_db")
DB_USER = os.getenv("DB_USER", "mobiledevarkatiss")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PASSWORD = os.getenv("DB_PASSWORD", None)
DB_PORT = os.getenv("DB_PORT", "5432")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'storage.json')

def get_db_connection(db_name=None):
    try:
        conn = psycopg2.connect(
            database=db_name if db_name else "postgres",
            user=DB_USER,
            host=DB_HOST,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def create_database():
    conn = get_db_connection()
    if not conn:
        return
    
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    
    # Check if db exists
    cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
    exists = cur.fetchone()
    
    if not exists:
        try:
            print(f"Creating database {DB_NAME}...")
            cur.execute(f"CREATE DATABASE {DB_NAME}")
        except Exception as e:
            print(f"Error creating database: {e}")
    else:
        print(f"Database {DB_NAME} already exists.")
        
    cur.close()
    conn.close()

def create_tables():
    conn = get_db_connection(DB_NAME)
    if not conn:
        return

    cur = conn.cursor()
    
    # Tenants table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tenants (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP,
            api_key VARCHAR(100),
            settings JSONB
        );
    """)
    
    # Teams table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS teams (
            id VARCHAR(50) PRIMARY KEY,
            tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            provider VARCHAR(100),
            api_key VARCHAR(255),
            team_key VARCHAR(100),
            model VARCHAR(100),
            created_at TIMESTAMP,
            styles JSONB
        );
    """)
    
    # Files table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS files (
            id VARCHAR(50) PRIMARY KEY,
            tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            size INTEGER,
            content TEXT,
            uploaded_at TIMESTAMP,
            url TEXT
        );
    """)
    
    conn.commit()
    cur.close()
    conn.close()
    print("Tables created successfully.")

def migrate_data():
    if not os.path.exists(DATA_FILE):
        print("No storage.json found. Skipping migration.")
        return

    with open(DATA_FILE, 'r') as f:
        data = json.load(f)

    conn = get_db_connection(DB_NAME)
    if not conn:
        return
    cur = conn.cursor()

    # Migrate Tenants
    tenants = data.get('tenants', [])
    print(f"Migrating {len(tenants)} tenants...")
    for t in tenants:
        # Check if exists to avoid dupes if re-running
        cur.execute("SELECT 1 FROM tenants WHERE id = %s", (t['id'],))
        if cur.fetchone():
            continue
            
        cur.execute("""
            INSERT INTO tenants (id, name, status, created_at, api_key, settings)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            t['id'], 
            t['name'], 
            t['status'], 
            t['createdAt'], 
            t.get('apiKey'), 
            json.dumps(t.get('settings', {}))
        ))

    # Migrate Files
    files_map = data.get('files', {})
    total_files = 0
    for tenant_id, file_list in files_map.items():
        # Ensure tenant exists (integrity)
        cur.execute("SELECT 1 FROM tenants WHERE id = %s", (tenant_id,))
        if not cur.fetchone():
            print(f"Skipping files for unknown tenant {tenant_id}")
            continue
            
        for f in file_list:
            cur.execute("SELECT 1 FROM files WHERE id = %s", (f['id'],))
            if cur.fetchone():
                continue

            cur.execute("""
                INSERT INTO files (id, tenant_id, name, size, content, uploaded_at, url)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                f['id'],
                tenant_id,
                f['name'],
                f['size'],
                f.get('content'),
                f['uploadedAt'],
                f.get('url')
            ))
            total_files += 1
    print(f"Migrated {total_files} files.")

    # Migrate Teams
    teams_map = data.get('teams', {})
    total_teams = 0
    for tenant_id, team_list in teams_map.items():
        # Ensure tenant exists
        cur.execute("SELECT 1 FROM tenants WHERE id = %s", (tenant_id,))
        if not cur.fetchone():
            print(f"Skipping teams for unknown tenant {tenant_id}")
            continue

        for team in team_list:
            cur.execute("SELECT 1 FROM teams WHERE id = %s", (team['id'],))
            if cur.fetchone():
                continue
                
            cur.execute("""
                INSERT INTO teams (id, tenant_id, name, provider, api_key, team_key, model, created_at, styles)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                team['id'],
                tenant_id,
                team['name'],
                team.get('provider'),
                team.get('apiKey'),
                team.get('teamKey'),
                team.get('model'),
                team.get('createdAt'),
                json.dumps(team.get('styles', {}))
            ))
            total_teams += 1
    print(f"Migrated {total_teams} teams.")

    conn.commit()
    cur.close()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    create_database()
    create_tables()
    migrate_data()
