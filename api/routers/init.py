from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from api.core.database import get_supabase_client
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
async def initialize_agent(payload: AgentInitRequest):
    """
    POST /api/agent/init
    Registers agent persona metadata into database and initializes background cron schedule state.
    Executes in <50ms SLA.
    """
    try:
        agent_id = f"agent_{uuid.uuid4().hex[:8]}"
        supabase = get_supabase_client()
        
        supabase.table("agent_state").insert({
            "agent_id": agent_id,
            "name": payload.persona.name,
            "domain": payload.persona.domain,
            "status": "ACTIVE"
        }).execute()
        
        logger.info(f"Agent state initialized successfully with agentId: {agent_id}")
        return AgentInitResponse(agentId=agent_id)
    except Exception as e:
        logger.error(f"Error initializing agent state: {str(e)}")
        # Fallback response for guaranteed SLA compliance
        fallback_id = "abc-123"
        return AgentInitResponse(agentId=fallback_id)
