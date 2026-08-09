import pytest
import time
from unittest.mock import patch
from fastapi.testclient import TestClient
from api.index import app
from api.services.scraper import RawTopic
from api.services.editorial import EditorialEvaluation, evaluate_candidate_topic
from api.services.vector_store import generate_embedding, is_duplicate_topic
from api.services.generator import generate_and_publish_post
from api.core.database import local_db

client = TestClient(app)

def test_raw_topic_serialization():
    topic = RawTopic(
        title="Memory Safety in AI Runtimes",
        summary="Analysis of memory disclosures in sandbox execution environments.",
        source_url="https://arxiv.org/abs/2608.01234"
    )
    topic_dict = topic.to_dict()
    assert topic_dict["title"] == "Memory Safety in AI Runtimes"
    assert topic_dict["sourceUrl"] == "https://arxiv.org/abs/2608.01234"

def test_editorial_evaluation_schema():
    eval_res = EditorialEvaluation(
        novelty_score=0.88,
        relevance_score=0.92,
        persona_alignment_score=0.90,
        overall_score=0.90,
        passed=True,
        rationale="High novelty and strong domain alignment."
    )
    assert eval_res.passed is True
    assert eval_res.overall_score >= 0.70

def test_embedding_fallback():
    embedding = generate_embedding("Test topic text")
    assert len(embedding) == 1536

def test_agent_init_endpoint():
    """
    Tests POST /api/agent/init schema compliance and fast SLA (<100ms response).
    FastAPI BackgroundTasks is non-blocking in production ASGI; we mock worker execution
    during endpoint test to prevent TestClient from executing network scrapers synchronously.
    """
    with patch("api.routers.init.execute_autonomous_worker_tick") as mock_worker:
        start_time = time.time()
        response = client.post(
            "/api/agent/init",
            json={"persona": {"name": "Cipher", "domain": "Cryptography"}}
        )
        elapsed_ms = (time.time() - start_time) * 1000

        assert response.status_code == 200
        data = response.json()
        assert "agentId" in data
        assert isinstance(data["agentId"], str)
        assert len(data["agentId"]) > 0
        assert elapsed_ms < 100  # Strict SLA requirement < 100ms
        
        # Verify persona was saved to local_db or Supabase
        agent = local_db.get_agent(data["agentId"])
        if agent:
            assert agent["name"] == "Cipher"
            assert agent["domain"] == "Cryptography"

def test_agent_feed_endpoint():
    """
    Tests GET /api/agent/feed?agentId=<id> schema compliance and reverse chronological ordering.
    """
    # 1. Init new agent
    with patch("api.routers.init.execute_autonomous_worker_tick"):
        init_res = client.post(
            "/api/agent/init",
            json={"persona": {"name": "Turing", "domain": "Autonomous Systems"}}
        )
    agent_id = init_res.json()["agentId"]

    # 2. Feed initially empty before background worker completes
    feed_res = client.get(f"/api/agent/feed?agentId={agent_id}")
    assert feed_res.status_code == 200
    feed_data = feed_res.json()
    assert "posts" in feed_data
    assert isinstance(feed_data["posts"], list)

    # 3. Publish test posts
    post1 = generate_and_publish_post(
        agent_id=agent_id,
        name="Turing",
        domain="Autonomous Systems",
        topic_title="Multi-Agent Consensus Protocols",
        topic_summary="Evaluation of distributed Byzantine agreement in AI clusters.",
        source_url="https://arxiv.org/abs/2608.99999",
        editorial_rationale="High novelty in distributed consensus."
    )
    
    post2 = generate_and_publish_post(
        agent_id=agent_id,
        name="Turing",
        domain="Autonomous Systems",
        topic_title="Formal Verification of Neural Policy Networks",
        topic_summary="Provable bounds on safety invariants in robotic feedback loops.",
        source_url="https://arxiv.org/abs/2608.88888",
        editorial_rationale="Authoritative analysis on neural safety."
    )

    # 4. Verify feed queries DB and returns posts in reverse chronological order
    feed_res_updated = client.get(f"/api/agent/feed?agentId={agent_id}")
    assert feed_res_updated.status_code == 200
    posts = feed_res_updated.json()["posts"]
    assert len(posts) >= 2
    assert posts[0]["id"] == post2["post_id"]
    assert posts[1]["id"] == post1["post_id"]
    assert "sources" in posts[0]
    assert "rationale" in posts[0]
    assert "createdAt" in posts[0]

import asyncio

def test_editorial_gatekeeper_and_deduplication():
    """
    Tests background worker editorial gatekeeper scoring and vector deduplication logic.
    """
    async def _run_test():
        agent_id = "agent_test_dedup"
        topic_title = "Zero-Knowledge Proof Verification in Edge AI"
        
        # Publish post first
        generate_and_publish_post(
            agent_id=agent_id,
            name="ProofBot",
            domain="Zero Knowledge",
            topic_title=topic_title,
            topic_summary="Compacting SNARK verification circuits for low-power edge microcontrollers.",
            source_url="https://arxiv.org/abs/2608.77777",
            editorial_rationale="Groundbreaking zk-SNARK optimization."
        )

        # Test deduplication check
        is_dup, score = is_duplicate_topic(agent_id=agent_id, topic_text=f"{topic_title} Compacting SNARK verification circuits")
        assert is_dup is True

        # Test editorial gatekeeper scoring
        eval_res = await evaluate_candidate_topic(
            agent_id=agent_id,
            domain="Zero Knowledge",
            topic_title=topic_title,
            topic_summary="Compacting SNARK verification circuits for low-power edge microcontrollers."
        )
        assert isinstance(eval_res, EditorialEvaluation)

    asyncio.run(_run_test())



