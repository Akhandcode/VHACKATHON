import pytest
from api.services.scraper import RawTopic
from api.services.editorial import EditorialEvaluation
from api.services.vector_store import generate_embedding

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
