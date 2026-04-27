from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Feature flags
    USE_MOCK_DATA: bool = True

    # DeepSeek LLM
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_MODEL: str = "deepseek-chat"
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"

    # Database
    DATABASE_URL: str = "sqlite:///./tripManner.db"

    # Security
    SECRET_KEY: str = "tripManner-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    SESSION_EXPIRE_HOURS: int = 24


settings = Settings()
