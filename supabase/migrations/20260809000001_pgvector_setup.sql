-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Vector Similarity Stored Procedure for Cosine Distance Checks
CREATE OR REPLACE FUNCTION match_posts(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    p_agent_id varchar
)
RETURNS TABLE (
    id UUID,
    post_id VARCHAR,
    text TEXT,
    similarity float
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        posts.id,
        posts.post_id,
        posts.text,
        1 - (posts.embedding <=> query_embedding) AS similarity
    FROM posts
    WHERE posts.agent_id = p_agent_id
      AND 1 - (posts.embedding <=> query_embedding) > match_threshold
    ORDER BY posts.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
