from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from api.core.security import verify_qstash_signature
from api.core.database import get_supabase_client
from api.services.scraper import ingest_live_candidate_topics
from api.services.vector_store import is_duplicate_topic
from api.services.editorial import evaluate_candidate_topic
from api.services.generator import generate_and_publish_post
import logging

logger = logging.getLogger("api.worker")
router = APIRouter()

class WorkerTickResponse(BaseModel):
    status: str
    agentId: str
    scrapedCount: int
    rejectedCount: int
    publishedPostId: Optional[str] = None
    message: str

@router.post("/worker/tick", response_model=WorkerTickResponse, dependencies=[Depends(verify_qstash_signature)])
async def execute_autonomous_worker_tick(agentId: str = "abc-123"):
    """
    POST /api/worker/tick
    Autonomous background queue worker execution:
    1. Scrapes live tech feeds (ArXiv, HackerNews, RSS)
    2. Generates OpenAI embeddings and checks pgvector similarity
    3. Runs two-stage LLM Editorial Gatekeeper scoring
    4. Synthesizes post + rationale + sources and commits to Supabase
    """
    logger.info(f"Initiating autonomous worker tick for agent {agentId}...")
    
    # 1. Fetch Agent Persona from Supabase state
    name = "Ada"
    domain = "AI Security"
    try:
        supabase = get_supabase_client()
        agent_res = supabase.table("agent_state").select("name, domain").eq("agent_id", agentId).execute()
        if agent_res.data and len(agent_res.data) > 0:
            name = agent_res.data[0]["name"]
            domain = agent_res.data[0]["domain"]
    except Exception as e:
        logger.warning(f"Using default persona Ada/AI Security: {str(e)}")

    # 2. Ingest candidate topics
    candidates = await ingest_live_candidate_topics(domain=domain)
    scraped_count = len(candidates)
    rejected_count = 0

    for cand in candidates:
        # 3. Vector Deduplication Check against 48-hour published posts
        is_dup, max_sim = is_duplicate_topic(agent_id=agentId, topic_text=f"{cand.title} {cand.summary}")
        if is_dup:
            logger.info(f"Skipping duplicate topic '{cand.title}' (Similarity: {max_sim:.4f})")
            rejected_count += 1
            continue

        # 4. Two-Stage LLM Editorial Scoring Matrix
        eval_res = await evaluate_candidate_topic(
            agent_id=agentId,
            domain=domain,
            topic_title=cand.title,
            topic_summary=cand.summary
        )

        if not eval_res.passed:
            logger.info(f"Editorial gatekeeper rejected topic '{cand.title}': {eval_res.rationale}")
            rejected_count += 1
            continue

        # 5. Synthesize post, rationale, source attribution, and commit to database
        post_record = generate_and_publish_post(
            agent_id=agentId,
            name=name,
            domain=domain,
            topic_title=cand.title,
            topic_summary=cand.summary,
            source_url=cand.source_url,
            editorial_rationale=eval_res.rationale
        )

        return WorkerTickResponse(
            status="SUCCESS",
            agentId=agentId,
            scrapedCount=scraped_count,
            rejectedCount=rejected_count,
            publishedPostId=post_record["post_id"],
            message=f"Successfully synthesized and published post {post_record['post_id']}."
        )

    return WorkerTickResponse(
        status="NO_NEW_POSTS",
        agentId=agentId,
        scrapedCount=scraped_count,
        rejectedCount=rejected_count,
        message="All candidate topics were filtered out by vector deduplication or editorial scoring."
    )
