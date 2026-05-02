"""Configuration using pydantic-settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings.

    The values are loaded from environment variables or a .env file.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "Vehicle Service Management API"
    DATABASE_URL: str = "mysql+pymysql://user:pass@localhost:3306/vms"
    API_V1_STR: str = "/api/v1"


settings = Settings()
