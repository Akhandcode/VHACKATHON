from openai import OpenAI
from api.core.config import settings
from api.core.database import get_supabase_client
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
    Computes vector embedding for topic_text and executes `match_posts` RPC procedure
    in Supabase to verify semantic uniqueness against posts published in past 48 hours.
    """
    if threshold is None:
        threshold = settings.SIMILARITY_THRESHOLD
        
    embedding = generate_embedding(topic_text)
    
    # If using zero fallback vector, bypass strict RPC vector lookup
    if all(v == 0.0 for v in embedding):
        return False, 0.0

    try:
        supabase = get_supabase_client()
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
            logger.info(f"Duplicate detected! Max similarity: {max_sim:.4f} (Threshold: {threshold})")
            return True, float(max_sim)
        return False, 0.0
    except Exception as e:
        logger.error(f"Supabase RPC match_posts error: {str(e)}")
        return False, 0.0
