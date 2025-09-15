from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # API Configuration
    api_title: str = Field(default="PeppeGPT Backend", env="API_TITLE")
    api_version: str = Field(default="1.0.0", env="API_VERSION")
    api_description: str = Field(default="AI-powered chat backend for personal portfolio", env="API_DESCRIPTION")
    
    # Server Configuration
    port: int = Field(default=7860, env="PORT")
    host: str = Field(default="0.0.0.0", env="HOST")
    
    # CORS Configuration
    allowed_origins: str = Field(
        default="https://pepperumo.github.io,http://localhost:3000,http://127.0.0.1:3000",
        env="ALLOWED_ORIGINS"
    )
    allow_credentials: bool = Field(default=True, env="ALLOW_CREDENTIALS")
    
    # Rate Limiting
    rate_limit_requests: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=3600, env="RATE_LIMIT_WINDOW")  # 1 hour
    
    # Hugging Face Configuration (Embedding Model Only)
    hf_model_name: str = Field(default="intfloat/e5-large-v2", env="HF_MODEL_NAME")
    hf_cache_dir: str = Field(default="/tmp/hf_cache", env="HF_CACHE_DIR")
    
    # OpenAI API Configuration (Primary Text Generation)
    openai_api_key: str = Field(default="", env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-5-nano", env="OPENAI_MODEL")  # OpenAI GPT-5 Nano (verified Sept 2025)
    use_openai: bool = Field(default=True, env="USE_OPENAI")  # Primary text generation model
    openai_max_tokens: int = Field(default=150, env="OPENAI_MAX_TOKENS")
    
    # Feature Flags
    enable_fallback_responder: bool = Field(default=True, env="ENABLE_FALLBACK_RESPONDER")
    debug_mode: bool = Field(default=False, env="DEBUG_MODE")
    
    # Environment Type
    environment: str = Field(default="production", env="ENVIRONMENT")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        
    def get_allowed_origins_list(self) -> List[str]:
        """Parse allowed origins from string or return list"""
        if isinstance(self.allowed_origins, str):
            return [origin.strip() for origin in self.allowed_origins.split(",")]
        return self.allowed_origins
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.environment.lower() in ["development", "dev", "local"]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.environment.lower() in ["production", "prod"]

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()