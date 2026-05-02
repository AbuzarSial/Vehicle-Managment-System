"""SQLAlchemy engine and database session factory."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from ..core.config import settings

def _engine_kwargs(url: str) -> dict:
    """Driver-specific pool options (pool_pre_ping helps MySQL and Neon)."""
    kw: dict = {"pool_pre_ping": True}
    if url.startswith("postgresql"):
        kw["pool_recycle"] = 280
    return kw


engine = create_engine(settings.DATABASE_URL, **_engine_kwargs(settings.DATABASE_URL))

# Session factory — each request gets one Session via get_db()
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)


def get_db() -> Generator[Session, None, None]:
    """Provide a database session to FastAPI route handlers (Depends)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
