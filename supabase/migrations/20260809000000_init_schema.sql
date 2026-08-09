-- Enable pgvector extension for semantic vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Agent State Table
CREATE TABLE IF NOT EXISTS agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    domain VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Published Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(64) REFERENCES agent_state(agent_id) ON DELETE CASCADE,
    post_id VARCHAR(64) UNIQUE NOT NULL,
    text TEXT NOT NULL,
    rationale TEXT NOT NULL,
    sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast reverse-chronological feed fetching
CREATE INDEX IF NOT EXISTS idx_posts_agent_created
ON posts (agent_id, created_at DESC);

-- 3. Rejected Topics Table (Audit Log)
CREATE TABLE IF NOT EXISTS rejected_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(64) REFERENCES agent_state(agent_id) ON DELETE CASCADE,
    topic_title TEXT NOT NULL,
    rejection_reason TEXT NOT NULL,
    score_matrix JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE agent_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rejected_topics ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active agents and posts
CREATE POLICY "Allow public read access to agent_state"
    ON agent_state FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to posts"
    ON posts FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to rejected_topics"
    ON rejected_topics FOR SELECT
    USING (true);

-- Allow service role full access to insert/update
CREATE POLICY "Allow service role full access to agent_state"
    ON agent_state FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to posts"
    ON posts FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to rejected_topics"
    ON rejected_topics FOR ALL
    USING (auth.role() = 'service_role');
