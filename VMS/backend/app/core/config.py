"""Application settings loaded from environment variables or a .env file."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve `.env` next to the backend package so startup works even if cwd is not `backend/`.
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
_ENV_FILE = _BACKEND_ROOT / ".env"


class Settings(BaseSettings):
    """Central configuration for the API and database connection."""

    model_config = SettingsConfigDict(env_file=_ENV_FILE, env_file_encoding="utf-8")

    # Shown in FastAPI docs title
    APP_NAME: str = "Vehicle Service Management API"

    # MySQL: mysql+pymysql://…/vms_db — set in Render/planetscale/etc. via DATABASE_URL (no .env required).
    DATABASE_URL: str = "mysql+pymysql://user:password@localhost:3306/vms_db"

    # Comma-separated extra browser origins for CORS (e.g. https://your-app.vercel.app)
    CORS_ALLOW_ORIGINS: str = ""

    # Optional regex so every Vercel preview URL can call the API without listing each branch URL.
    # Example: https://.*\.vercel\.app
    CORS_ALLOW_ORIGIN_REGEX: str = ""


settings = Settings()
