"""
Agri-Nexus Configuration Module
================================
Centralized configuration management using Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Settings
    API_TITLE: str = "Agri-Nexus API"
    API_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    
    # Weather API Configuration
    WEATHER_API_KEY: str = ""
    WEATHER_API_URL: str = "https://api.openweathermap.org/data/2.5"
    
    # Twilio (SMS Alerts)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    
    # Simulation Settings
    SIMULATION_TICK_INTERVAL: float = 2.0  # seconds
    SIMULATION_PERSIST_INTERVAL: int = 60  # ticks (virtual hours)
    
    # Alert Thresholds
    CRITICAL_DRY_THRESHOLD: float = 30.0  # % soil moisture
    STORM_WARNING_THRESHOLD: float = 990.0  # hPa pressure
    HEAT_WARNING_THRESHOLD: float = 38.0  # °C
    FROST_WARNING_THRESHOLD: float = 2.0  # °C
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses LRU cache to avoid re-reading .env on every call.
    """
    return Settings()


# Export settings instance
settings = get_settings()
