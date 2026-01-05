
-- Migration: Add LLM fields to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS provider VARCHAR(50);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS model VARCHAR(100);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS llm_api_key VARCHAR(255);
