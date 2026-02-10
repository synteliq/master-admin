
-- Migration: Add LLM fields to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS provider VARCHAR(50);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS model VARCHAR(100);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS llm_api_key VARCHAR(255);

-- Migration: Add team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(50) PRIMARY KEY,
    team_id VARCHAR(50), 
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    UNIQUE(team_id, email)
);

-- Migration: Add token_usage table
CREATE TABLE IF NOT EXISTS token_usage (
    id VARCHAR(50) PRIMARY KEY,
    team_id VARCHAR(50), 
    email VARCHAR(255),
    tokens_in INTEGER DEFAULT 0,
    tokens_out INTEGER DEFAULT 0,
    cost FLOAT DEFAULT 0.0,
    model VARCHAR(100),
    timestamp TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'team_members_team_id_fkey') THEN
        ALTER TABLE team_members ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'token_usage_team_id_fkey') THEN
        ALTER TABLE token_usage ADD CONSTRAINT token_usage_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
    END IF;
END $$;
