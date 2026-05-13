"""SQLAlchemy engine and database session factory."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from ..core.config import settings

def _engine_kwargs() -> dict:
    """SQLAlchemy engine options (pool_pre_ping avoids stale MySQL connections)."""
    return {"pool_pre_ping": True}


engine = create_engine(settings.DATABASE_URL, **_engine_kwargs())

# Session factory — each request gets one Session via get_db()
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)


def get_db() -> Generator[Session, None, None]:
    """Provide a database session to FastAPI route handlers (Depends)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
