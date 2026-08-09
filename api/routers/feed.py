from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from api.core.database import get_supabase_client, local_db
import logging

logger = logging.getLogger("api.feed")
router = APIRouter()

class PostSchema(BaseModel):
    id: str
    createdAt: str
    text: str
    rationale: str
    sources: List[str]

class FeedResponseSchema(BaseModel):
    posts: List[PostSchema]

@router.get("/agent/feed", response_model=FeedResponseSchema)
async def get_agent_feed(agentId: str = Query(..., description="The unique agent identifier")):
    """
    GET /api/agent/feed?agentId=<id>
    Queries database and returns posts for specified agentId in reverse-chronological order.
    NEVER triggers an LLM generation call.
    """
    posts_data: List[PostSchema] = []
    
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("posts") \
                .select("post_id, text, rationale, sources, created_at") \
                .eq("agent_id", agentId) \
                .order("created_at", desc=True) \
                .execute()
            
            if res and res.data:
                for row in res.data:
                    posts_data.append(PostSchema(
                        id=row["post_id"],
                        createdAt=row["created_at"],
                        text=row["text"],
                        rationale=row["rationale"],
                        sources=row.get("sources") if isinstance(row.get("sources"), list) else []
                    ))
        except Exception as e:
            logger.error(f"Error querying Supabase posts table: {str(e)}")

    # Fallback to local_db if Supabase returned no data or was unavailable
    if not posts_data:
        local_posts = local_db.get_posts_by_agent(agentId)
        for row in local_posts:
            posts_data.append(PostSchema(
                id=row["post_id"],
                createdAt=row.get("created_at", ""),
                text=row["text"],
                rationale=row["rationale"],
                sources=row.get("sources") if isinstance(row.get("sources"), list) else []
            ))

    return FeedResponseSchema(posts=posts_data)

