try:
    from supabase import create_client, Client
except Exception:
    try:
        from supabase_py import create_client, Client
    except Exception:
        create_client = None
        Client = None
from api.core.config import settings
import logging

logger = logging.getLogger("api.database")

def get_supabase_client():
    """
    Returns an authenticated Supabase client using the service role key
    to bypass RLS for administrative worker operations.
    """
    if not create_client or not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning("Supabase environment variables or package missing; returning mock client.")
        return None
    return create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY
    )

def get_supabase_anon_client() -> Client:
    """
    Returns a public Supabase client using the anon key.
    """
    return create_client(
        supabase_url=settings.SUPABASE_URL or "https://placeholder.supabase.co",
        supabase_key=settings.SUPABASE_ANON_KEY or "placeholder-key"
    )
