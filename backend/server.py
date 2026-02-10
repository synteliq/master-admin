import os
from dotenv import load_dotenv

load_dotenv()
import json
import time
import random
import string
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_NAME = os.getenv("DB_NAME", "master_admin_db")
DB_USER = os.getenv("DB_USER", "mobiledevarkatiss")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PASSWORD = os.getenv("DB_PASSWORD", None)
DB_PORT = os.getenv("DB_PORT", "5432")

# --- Helpers ---
def get_db_connection():
    try:
        conn = psycopg2.connect(
            database=DB_NAME,
            user=DB_USER,
            host=DB_HOST,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def generate_id(prefix):
    return f"{prefix}_" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))

# --- Routes ---

@app.route('/', methods=['GET'])
def health_check_root():
    return jsonify({'status': 'ok', 'service': 'tenant-portal-backend'})

@app.route('/health', methods=['GET'])
def health_check():
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({'status': 'ok', 'db': 'connected'})
    return jsonify({'status': 'error', 'db': 'disconnected'}), 500

@app.route('/login/admin', methods=['POST'])
def login_admin():
    body = request.json
    if body.get('username') == 'admin' and body.get('password') == 'admin123':
        return jsonify({'success': True, 'token': 'mock_admin_token', 'user': {'id': 'admin', 'name': 'Master Admin'}})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/login/tenant', methods=['POST'])
def login_tenant():
    body = request.json
    tenant_id = body.get('tenantId')
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
        
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM tenants WHERE id = %s", (tenant_id,))
    tenant = cur.fetchone()
    cur.close()
    conn.close()
    
    if not tenant:
        return jsonify({'error': 'Invalid tenant ID'}), 401
    
    if tenant['status'] == 'disabled':
        return jsonify({'error': 'Account is disabled'}), 403
        
    return jsonify({'success': True, 'token': f"mock_tenant_{tenant['id']}", 'user': {'id': tenant['id'], 'name': tenant['name']}})

@app.route('/login/sso', methods=['POST'])
@app.route('/auth/login', methods=['POST'])
def login_sso():
    body = request.json
    entity_id = body.get('tenantId') # Reuse tenantId field for both
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database error'}), 500
        
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Check if it is a Tenant
    cur.execute("SELECT * FROM tenants WHERE id = %s", (entity_id,))
    tenant = cur.fetchone()
    
    if tenant:
        cur.close()
        conn.close()
        if tenant['status'] == 'disabled':
            return jsonify({'error': 'Account is disabled'}), 403
        return jsonify({
            'success': True, 
            'type': 'tenant',
            'token': f"mock_tenant_{tenant['id']}", 
            'user': {'id': tenant['id'], 'name': tenant['name']},
            'config': {
                'apiProvider': tenant.get('provider', 'gemini'),
                'apiKey': tenant.get('llm_api_key'), 
                'apiModelId': tenant.get('model', 'gemini-2.0-flash-001')
            },
            'styles': tenant.get('settings', {})
        })

    # Check if it is a Team
    cur.execute("SELECT * FROM teams WHERE id = %s", (entity_id,))
    found_team = cur.fetchone()
    cur.close()
    conn.close()
            
    if found_team:
        # Validate Team Key
        if found_team.get('team_key') != body.get('apiKey'):
             return jsonify({'error': 'Invalid Team Key'}), 401
             
        # Return team info AND LLM Config
        return jsonify({
            'success': True,
            'type': 'team',
            'token': f"mock_team_{found_team['id']}",
            'user': {'id': found_team['id'], 'name': found_team['name']},
            'config': {
                'apiProvider': found_team['provider'],
                'apiKey': found_team.get('api_key'), # This is the LLM Provider API Key
                'apiModelId': found_team.get('model')
            },
            'styles': found_team.get('styles', {})
        })

    return jsonify({'error': 'Invalid ID'}), 401

@app.route('/tenants', methods=['GET'])
def get_tenants():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM tenants")
    tenants = cur.fetchall()
    cur.close()
    conn.close()
    
    # Fix datetime serialization for JSON
    for t in tenants:
        if t['created_at']:
            t['createdAt'] = t.pop('created_at').isoformat()
        if t['api_key']:
            t['apiKey'] = t.pop('api_key')
            
    return jsonify(tenants)

@app.route('/tenants', methods=['POST'])
def create_tenant():
    name = request.json.get('name')
    if not name:
        return jsonify({'error': 'Name required'}), 400
        
    new_id = generate_id('tnt')
    new_api_key = generate_id('ak')
    created_at = datetime.now()
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        INSERT INTO tenants (id, name, status, created_at, api_key, provider, model, llm_api_key, settings)
        VALUES (%s, %s, 'active', %s, %s, %s, %s, %s, '{}')
        RETURNING *
    """, (new_id, name, created_at, new_api_key, 
          request.json.get('provider', 'gemini'),
          request.json.get('model', 'gemini-2.0-flash-001'),
          request.json.get('apiKey')
    ))
    new_tenant = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    # Format for response
    new_tenant['createdAt'] = new_tenant.pop('created_at').isoformat()
    new_tenant['apiKey'] = new_tenant.pop('api_key')
    
    return jsonify(new_tenant)

@app.route('/tenants/<id>', methods=['PATCH'])
def update_tenant(id):
    body = request.json
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    fields = []
    values = []
    
    if 'name' in body:
        fields.append("name = %s")
        values.append(body['name'])
    if 'status' in body:
        fields.append("status = %s")
        values.append(body['status'])
    if 'provider' in body:
        fields.append("provider = %s")
        values.append(body['provider'])
    if 'model' in body:
        fields.append("model = %s")
        values.append(body['model'])
    if 'apiKey' in body:
        fields.append("llm_api_key = %s")
        values.append(body['apiKey'])
    if 'settings' in body:
        fields.append("settings = %s")
        values.append(json.dumps(body['settings']))
        
    if not fields:
        cur.close()
        conn.close()
        return jsonify({'error': 'No fields to update'}), 400
        
    values.append(id)
    cur.execute(f"UPDATE tenants SET {', '.join(fields)} WHERE id = %s RETURNING *", tuple(values))
    tenant = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    if not tenant:
        return jsonify({'error': 'Not found'}), 404
    
    tenant['createdAt'] = tenant.pop('created_at').isoformat()
    tenant['apiKey'] = tenant.pop('api_key')
    return jsonify(tenant)

@app.route('/tenants/<id>/status', methods=['PATCH'])
def update_tenant_status(id):
    status = request.json.get('status')
    if status not in ['active', 'disabled']:
        return jsonify({'error': 'Invalid status'}), 400
        
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("UPDATE tenants SET status = %s WHERE id = %s RETURNING *", (status, id))
    tenant = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    if not tenant:
        return jsonify({'error': 'Not found'}), 404
    
    tenant['createdAt'] = tenant.pop('created_at').isoformat()
    tenant['apiKey'] = tenant.pop('api_key')
    return jsonify(tenant)

@app.route('/tenants/<id>', methods=['GET'])
def get_tenant(id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM tenants WHERE id = %s", (id,))
    tenant = cur.fetchone()
    cur.close()
    conn.close()
    
    if not tenant:
        return jsonify({'error': 'Not found'}), 404
        
    tenant['createdAt'] = tenant.pop('created_at').isoformat()
    tenant['apiKey'] = tenant.pop('api_key')
    return jsonify(tenant)

@app.route('/tenants/<id>/files', methods=['GET'])
def get_files(id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM files WHERE tenant_id = %s ORDER BY uploaded_at DESC", (id,))
    files = cur.fetchall()
    cur.close()
    conn.close()
    
    for f in files:
        if f['uploaded_at']:
            f['uploadedAt'] = f.pop('uploaded_at').isoformat()
        if 'tenant_id' in f:
            del f['tenant_id'] # Don't need to return this redundancy
            
    return jsonify(files)

@app.route('/tenants/<id>/branding', methods=['PATCH'])
def update_tenant_branding(id):
    body = request.json
    color = body.get('brandColor')
    font = body.get('font')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # First get current settings
    cur.execute("SELECT settings FROM tenants WHERE id = %s", (id,))
    result = cur.fetchone()
    if not result:
        cur.close()
        conn.close()
        return jsonify({'error': 'Not found'}), 404
        
    settings = result['settings'] or {}
    
    if color:
        settings['brandColor'] = color
    if font:
        settings['font'] = font
        
    cur.execute("UPDATE tenants SET settings = %s WHERE id = %s RETURNING *", (json.dumps(settings), id))
    tenant = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    tenant['createdAt'] = tenant.pop('created_at').isoformat()
    tenant['apiKey'] = tenant.pop('api_key')
    return jsonify(tenant)

@app.route('/tenants/<id>/teams', methods=['GET'])
def get_teams(id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM teams WHERE tenant_id = %s", (id,))
    teams = cur.fetchall()
    cur.close()
    conn.close()
    
    for t in teams:
        if t['created_at']:
            t['createdAt'] = t.pop('created_at').isoformat()
        t['apiKey'] = t.pop('api_key')
        t['teamKey'] = t.pop('team_key')
        del t['tenant_id']
        
    return jsonify(teams)

@app.route('/tenants/<id>/teams', methods=['POST'])
def create_team(id):
    body = request.json
    if not body.get('name') or not body.get('provider'):
        return jsonify({'error': 'Name and Provider required'}), 400

    new_id = generate_id('team')
    team_key = generate_id('tkey')
    created_at = datetime.now()
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database error'}), 500
        
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Ensure tenant exists
    cur.execute("SELECT 1 FROM tenants WHERE id = %s", (id,))
    if not cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({'error': 'Tenant Not Found'}), 404
    
    cur.execute("""
        INSERT INTO teams (id, tenant_id, name, provider, api_key, team_key, model, created_at, styles)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, '{}')
        RETURNING *
    """, (
        new_id, 
        id, 
        body['name'], 
        body['provider'], 
        body.get('apiKey'), 
        team_key, 
        body.get('model', 'default'), 
        created_at
    ))
    new_team = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    new_team['createdAt'] = new_team.pop('created_at').isoformat()
    new_team['apiKey'] = new_team.pop('api_key')
    new_team['teamKey'] = new_team.pop('team_key')
    del new_team['tenant_id']
    
    return jsonify(new_team)

@app.route('/tenants/<id>/teams/<team_id>', methods=['PATCH'])
def update_team(id, team_id):
    body = request.json
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Check if team exists and belongs to tenant
    cur.execute("SELECT * FROM teams WHERE id = %s AND tenant_id = %s", (team_id, id))
    team = cur.fetchone()
    
    if not team:
        cur.close()
        conn.close()
        return jsonify({'error': 'Team not found'}), 404
        
    # Build Update Query dynamically
    fields = []
    values = []
    
    if 'name' in body:
        fields.append("name = %s")
        values.append(body['name'])
    if 'provider' in body:
        fields.append("provider = %s")
        values.append(body['provider'])
    if 'apiKey' in body:
        fields.append("api_key = %s")
        values.append(body['apiKey'])
    if 'model' in body:
        fields.append("model = %s")
        values.append(body['model'])
    if 'styles' in body:
        fields.append("styles = %s")
        values.append(json.dumps(body['styles']))
        
    if not fields:
        cur.close()
        conn.close()
        team['createdAt'] = team.pop('created_at').isoformat()
        team['apiKey'] = team.pop('api_key')
        team['teamKey'] = team.pop('team_key')
        del team['tenant_id']
        return jsonify(team)
        
    values.append(team_id)
    query = f"UPDATE teams SET {', '.join(fields)} WHERE id = %s RETURNING *"
    
    cur.execute(query, tuple(values))
    updated_team = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    updated_team['createdAt'] = updated_team.pop('created_at').isoformat()
    updated_team['apiKey'] = updated_team.pop('api_key')
    updated_team['teamKey'] = updated_team.pop('team_key')
    del updated_team['tenant_id']
    
    updated_team['teamKey'] = updated_team.pop('team_key')
    del updated_team['tenant_id']
    
    return jsonify(updated_team)

# --- Team Members ---

@app.route('/tenants/<id>/teams/<team_id>/members', methods=['POST'])
def add_team_member(id, team_id):
    email = request.json.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400

    new_id = generate_id('mem')
    created_at = datetime.now()
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database error'}), 500
        
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Check if member already exists
    cur.execute("SELECT 1 FROM team_members WHERE team_id = %s AND email = %s", (team_id, email))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({'error': 'Member already exists'}), 409
        
    cur.execute("""
        INSERT INTO team_members (id, team_id, email, created_at)
        VALUES (%s, %s, %s, %s)
        RETURNING *
    """, (new_id, team_id, email, created_at))
    
    new_member = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    new_member['createdAt'] = new_member.pop('created_at').isoformat()
    return jsonify(new_member)

@app.route('/tenants/<id>/teams/<team_id>/members', methods=['GET'])
def get_team_members(id, team_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM team_members WHERE team_id = %s ORDER BY created_at DESC", (team_id,))
    members = cur.fetchall()
    cur.close()
    conn.close()
    
    for m in members:
        if m['created_at']:
            m['createdAt'] = m.pop('created_at').isoformat()
            
    return jsonify(members)

# --- Token Usage ---

@app.route('/api/usage', methods=['POST'])
def record_usage():
    body = request.json
    team_id = body.get('teamId')
    email = body.get('email')
    tokens_in = body.get('tokensIn', 0)
    tokens_out = body.get('tokensOut', 0)
    cost = body.get('cost', 0.0)
    model = body.get('model')
    
    if not team_id:
        return jsonify({'error': 'Team ID required'}), 400
        
    new_id = generate_id('usage')
    timestamp = datetime.now()
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database error'}), 500
        
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO token_usage (id, team_id, email, tokens_in, tokens_out, cost, model, timestamp)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (new_id, team_id, email, tokens_in, tokens_out, cost, model, timestamp))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/tenants/<id>/usage', methods=['GET'])
def get_tenant_usage(id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Get usage aggregated by team
    cur.execute("""
        SELECT 
            t.name as team_name,
            t.id as team_id,
            COALESCE(SUM(u.tokens_in), 0) as total_tokens_in,
            COALESCE(SUM(u.tokens_out), 0) as total_tokens_out,
            COALESCE(SUM(u.cost), 0) as total_cost
        FROM teams t
        LEFT JOIN token_usage u ON t.id = u.team_id
        WHERE t.tenant_id = %s
        GROUP BY t.id, t.name
    """, (id,))
    team_usage = cur.fetchall()
    
    # Get top users by cost
    cur.execute("""
        SELECT 
            u.email,
            t.name as team_name,
            SUM(u.cost) as total_cost,
            SUM(u.tokens_in + u.tokens_out) as total_tokens
        FROM token_usage u
        JOIN teams t ON u.team_id = t.id
        WHERE t.tenant_id = %s AND u.email IS NOT NULL
        GROUP BY u.email, t.name
        ORDER BY total_cost DESC
        LIMIT 10
    """, (id,))
    user_usage = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({
        'teamUsage': team_usage,
        'userUsage': user_usage
    })
def upload_file(id):
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_content = file.read()
    try:
        content_str = file_content.decode('utf-8')
    except UnicodeDecodeError:
        content_str = "Binary Content (Not Displayed)"

    new_id = generate_id('file')
    upload_time = datetime.now()
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database error'}), 500
        
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Check tenant
    cur.execute("SELECT 1 FROM tenants WHERE id = %s", (id,))
    if not cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({'error': 'Tenant not found'}), 404
        
    cur.execute("""
        INSERT INTO files (id, tenant_id, name, size, content, uploaded_at, url)
        VALUES (%s, %s, %s, %s, %s, %s, '#')
        RETURNING *
    """, (new_id, id, file.filename, len(file_content), content_str, upload_time))
    
    new_file = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    new_file['uploadedAt'] = new_file.pop('uploaded_at').isoformat()
    del new_file['tenant_id']
    
    return jsonify(new_file)

@app.route('/tenants/<id>/files/<file_id>', methods=['DELETE'])
def delete_file(id, file_id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("DELETE FROM files WHERE id = %s AND tenant_id = %s RETURNING id", (file_id, id))
    deleted = cur.fetchone()
    
    conn.commit()
    cur.close()
    conn.close()
    
    if not deleted:
        return jsonify({'error': 'File not found'}), 404
        
    return jsonify({'success': True})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
