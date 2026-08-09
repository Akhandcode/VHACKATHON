from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "IMAGINATION — Autonomous AI Creator Engine"
    API_V1_STR: str = "/api"
    
    # OpenAI Settings
    OPENAI_API_KEY: str = ""
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    OPENAI_LLM_MODEL: str = "gpt-4o"
    
    # Supabase Settings
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""
    
    # Upstash QStash Settings
    QSTASH_CURRENT_SIGNING_KEY: Optional[str] = None
    QSTASH_NEXT_SIGNING_KEY: Optional[str] = None
    QSTASH_TOKEN: Optional[str] = None
    
    # Vector Deduplication Threshold
    SIMILARITY_THRESHOLD: float = 0.82
    EDITORIAL_MIN_SCORE: float = 0.70
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
