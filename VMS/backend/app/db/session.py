"""SQLAlchemy engine and database session factory."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from ..core.config import settings

# pool_pre_ping: checks connections before use (helps if MySQL drops idle connections)
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# Session factory — each request gets one Session via get_db()
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)


def get_db() -> Generator[Session, None, None]:
    """Provide a database session to FastAPI route handlers (Depends)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
