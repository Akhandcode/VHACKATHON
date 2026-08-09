from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from api.core.database import get_supabase_client, local_db
from api.routers.worker import execute_autonomous_worker_tick
import uuid
import logging

logger = logging.getLogger("api.init")
router = APIRouter()

class PersonaPayload(BaseModel):
    name: str
    domain: str

class AgentInitRequest(BaseModel):
    persona: PersonaPayload

class AgentInitResponse(BaseModel):
    agentId: str

@router.post("/agent/init", response_model=AgentInitResponse, status_code=status.HTTP_200_OK)
async def initialize_agent(payload: AgentInitRequest, background_tasks: BackgroundTasks):
    """
    POST /api/agent/init
    Saves persona metadata to database and asynchronously triggers the first background generation cycle.
    Fast execution (<100ms SLA). Does NOT block waiting for LLM generation.
    """
    agent_id = f"agent_{uuid.uuid4().hex[:8]}"
    
    # 1. Save persona metadata to database (Supabase with local fallback)
    supabase = get_supabase_client()
    if supabase:
        try:
            supabase.table("agent_state").insert({
                "agent_id": agent_id,
                "name": payload.persona.name,
                "domain": payload.persona.domain,
                "status": "ACTIVE"
            }).execute()
        except Exception as e:
            logger.error(f"Error persisting persona to Supabase: {str(e)}")
            local_db.insert_agent(agent_id=agent_id, name=payload.persona.name, domain=payload.persona.domain)
    else:
        local_db.insert_agent(agent_id=agent_id, name=payload.persona.name, domain=payload.persona.domain)

    # 2. Trigger first background generation cycle asynchronously without blocking HTTP response
    background_tasks.add_task(execute_autonomous_worker_tick, agentId=agent_id)

    logger.info(f"Agent state initialized with agentId: {agent_id}, background generation scheduled.")
    return AgentInitResponse(agentId=agent_id)

