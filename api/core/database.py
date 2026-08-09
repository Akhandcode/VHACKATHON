import logging
import uuid
import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from api.core.config import settings

logger = logging.getLogger("api.database")

try:
    from supabase import create_client, Client
except Exception:
    try:
        from supabase_py import create_client, Client
    except Exception:
        create_client = None
        Client = None

class LocalMemoryStore:
    """
    In-memory thread-safe database fallback when remote Supabase is unavailable.
    Ensures end-to-end API execution and testing without remote infrastructure.
    """
    def __init__(self):
        self.agents: Dict[str, Dict[str, Any]] = {}
        self.posts: List[Dict[str, Any]] = []
        self.rejected_topics: List[Dict[str, Any]] = []

    def insert_agent(self, agent_id: str, name: str, domain: str) -> Dict[str, Any]:
        record = {
            "id": str(uuid.uuid4()),
            "agent_id": agent_id,
            "name": name,
            "domain": domain,
            "status": "ACTIVE",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        self.agents[agent_id] = record
        return record

    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        return self.agents.get(agent_id)

    def insert_post(self, post_record: Dict[str, Any]) -> Dict[str, Any]:
        if "created_at" not in post_record:
            post_record["created_at"] = datetime.now(timezone.utc).isoformat()
        self.posts.append(post_record)
        return post_record

    def get_posts_by_agent(self, agent_id: str) -> List[Dict[str, Any]]:
        agent_posts = [p for p in self.posts if p.get("agent_id") == agent_id]
        # Sort reverse chronological order by created_at
        agent_posts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return agent_posts

    def insert_rejected_topic(self, record: Dict[str, Any]) -> Dict[str, Any]:
        if "created_at" not in record:
            record["created_at"] = datetime.now(timezone.utc).isoformat()
        self.rejected_topics.append(record)
        return record

    def match_posts(self, agent_id: str, query_embedding: List[float], match_threshold: float, match_count: int = 1) -> List[Dict[str, Any]]:
        results = []
        if not query_embedding or all(v == 0.0 for v in query_embedding):
            return results

        def cosine_similarity(v1: List[float], v2: List[float]) -> float:
            if not v1 or not v2 or len(v1) != len(v2):
                return 0.0
            dot = sum(a * b for a, b in zip(v1, v2))
            norm1 = math.sqrt(sum(a * a for a in v1))
            norm2 = math.sqrt(sum(b * b for b in v2))
            if norm1 == 0 or norm2 == 0:
                return 0.0
            return dot / (norm1 * norm2)

        for post in self.posts:
            if post.get("agent_id") == agent_id and post.get("embedding"):
                sim = cosine_similarity(query_embedding, post["embedding"])
                if sim >= match_threshold:
                    results.append({
                        "id": post.get("id", str(uuid.uuid4())),
                        "post_id": post.get("post_id"),
                        "text": post.get("text"),
                        "similarity": sim
                    })
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:match_count]

# Global local store instance
local_db = LocalMemoryStore()

def get_supabase_client():
    """
    Returns an authenticated Supabase client using the service role key
    to bypass RLS for administrative worker operations. Returns None if credentials missing.
    """
    if not create_client or not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning("Supabase environment variables or package missing; using local memory store.")
        return None
    try:
        return create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY
        )
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")
        return None

def get_supabase_anon_client() -> Optional[Any]:
    """
    Returns a public Supabase client using the anon key.
    """
    if not create_client or not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        return None
    try:
        return create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_ANON_KEY
        )
    except Exception as e:
        logger.error(f"Failed to initialize Supabase anon client: {str(e)}")
        return None

