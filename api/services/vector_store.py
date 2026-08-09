from openai import OpenAI
from api.core.config import settings
from api.core.database import get_supabase_client, local_db
import logging
from typing import List, Tuple

logger = logging.getLogger("api.vector_store")

def generate_embedding(text: str) -> List[float]:
    """
    Generates a 1536-dimensional vector embedding using OpenAI text-embedding-3-small.
    Returns a dummy zero-vector if OpenAI API key is missing.
    """
    if not settings.OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY missing; returning zero vector fallback.")
        return [0.0] * 1536
    
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.embeddings.create(
            input=text,
            model=settings.OPENAI_EMBEDDING_MODEL
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Embedding generation error: {str(e)}")
        return [0.0] * 1536

def is_duplicate_topic(agent_id: str, topic_text: str, threshold: float = None) -> Tuple[bool, float]:
    """
    Computes vector embedding for topic_text and queries pgvector (or local_db fallback)
    to verify semantic uniqueness against posts published in the past 48 hours.
    """
    if threshold is None:
        threshold = settings.SIMILARITY_THRESHOLD
        
    embedding = generate_embedding(topic_text)
    
    # If using zero fallback vector, check word overlap matching in local_db / database
    if all(v == 0.0 for v in embedding):
        local_posts = local_db.get_posts_by_agent(agent_id)
        topic_words = set(topic_text.lower().split())
        for post in local_posts:
            post_words = set(post.get("text", "").lower().split())
            if not topic_words or not post_words:
                continue
            common = topic_words.intersection(post_words)
            overlap = len(common) / min(len(topic_words), len(post_words))
            if overlap >= 0.5:
                logger.info(f"Duplicate detected via word overlap fallback! Overlap: {overlap:.4f}")
                return True, float(overlap)
        return False, 0.0


    # 1. Try Supabase pgvector match_posts RPC
    supabase = get_supabase_client()
    if supabase:
        try:
            rpc_res = supabase.rpc(
                "match_posts",
                {
                    "query_embedding": embedding,
                    "match_threshold": threshold,
                    "match_count": 1,
                    "p_agent_id": agent_id
                }
            ).execute()

            matches = rpc_res.data if rpc_res else []
            if matches and len(matches) > 0:
                max_sim = matches[0].get("similarity", 0.0)
                logger.info(f"Duplicate detected via pgvector! Max similarity: {max_sim:.4f} (Threshold: {threshold})")
                return True, float(max_sim)
        except Exception as e:
            logger.error(f"Supabase RPC match_posts error: {str(e)}")

    # 2. Fallback to local_db match_posts calculation
    local_matches = local_db.match_posts(agent_id=agent_id, query_embedding=embedding, match_threshold=threshold)
    if local_matches:
        max_sim = local_matches[0]["similarity"]
        logger.info(f"Duplicate detected via local_db! Max similarity: {max_sim:.4f}")
        return True, float(max_sim)

    return False, 0.0

