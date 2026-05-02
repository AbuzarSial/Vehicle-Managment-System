"""Application settings loaded from environment variables or a .env file."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the API and database connection."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Shown in FastAPI docs title
    APP_NAME: str = "Vehicle Service Management API"

    # Must match the MySQL database created by database/schema/001_create_database.sql (vms_db)
    DATABASE_URL: str = "mysql+pymysql://user:password@localhost:3306/vms_db"


settings = Settings()
