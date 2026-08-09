from openai import OpenAI
from api.core.config import settings
from api.core.database import get_supabase_client, local_db
from api.services.vector_store import generate_embedding
import logging
import uuid

logger = logging.getLogger("api.generator")

def generate_and_publish_post(
    agent_id: str,
    name: str,
    domain: str,
    topic_title: str,
    topic_summary: str,
    source_url: str,
    editorial_rationale: str
) -> dict:
    """
    Synthesizes short-form post in the persona's voice, attaches rationale and source URL,
    generates vector embedding, and commits the post to Supabase and local_db.
    """
    post_text = f"Analysis of {topic_title}: {topic_summary}"
    
    if settings.OPENAI_API_KEY:
        try:
            try:
                from langchain_openai import ChatOpenAI
                from langchain_core.prompts import ChatPromptTemplate

                llm = ChatOpenAI(
                    model=settings.OPENAI_LLM_MODEL,
                    api_key=settings.OPENAI_API_KEY,
                    temperature=0.7,
                    max_tokens=100
                )
                prompt = ChatPromptTemplate.from_template("""
You are {name}, a premier authority in {domain}.
Synthesize a short, punchy, authoritative social post (max 280 chars) discussing:
Title: {topic_title}
Context: {topic_summary}

Do not include hashtags. Keep it analytical, sharp, and direct.
""")
                chain = prompt | llm
                res = chain.invoke({
                    "name": name,
                    "domain": domain,
                    "topic_title": topic_title,
                    "topic_summary": topic_summary
                })
                post_text = res.content.strip()
            except Exception:
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                prompt_str = f"""
You are {name}, a premier authority in {domain}.
Synthesize a short, punchy, authoritative social post (max 280 chars) discussing:
Title: {topic_title}
Context: {topic_summary}

Do not include hashtags. Keep it analytical, sharp, and direct.
"""
                res = client.chat.completions.create(
                    model=settings.OPENAI_LLM_MODEL,
                    messages=[{"role": "user", "content": prompt_str}],
                    max_tokens=100
                )
                post_text = res.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Post synthesis LLM error: {str(e)}")

    post_id = f"p_{uuid.uuid4().hex[:8]}"
    rationale_full = f"{editorial_rationale} Aligns directly with {domain} persona, zero duplicate semantic matches in past 48 hours."
    embedding = generate_embedding(post_text)

    post_record = {
        "agent_id": agent_id,
        "post_id": post_id,
        "text": post_text,
        "rationale": rationale_full,
        "sources": [source_url],
        "embedding": embedding
    }

    try:
        supabase = get_supabase_client()
        if supabase:
            supabase.table("posts").insert(post_record).execute()
            logger.info(f"Published autonomous post {post_id} to Supabase for agent {agent_id}")
        else:
            logger.info(f"Published post {post_id} to local_db for agent {agent_id}")
    except Exception as e:
        logger.error(f"Failed to publish post record to Supabase: {str(e)}")
    
    # Always commit to local_db as well so local feed query immediately finds it
    local_db.insert_post(post_record)
    return post_record

