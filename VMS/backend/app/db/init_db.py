"""Database initialization helpers (e.g., create tables)."""

from .base import Base
from .session import engine


def init_db():
    """Create database tables based on SQLAlchemy models. For production
    use Alembic migrations instead of this helper.
    """
    Base.metadata.create_all(bind=engine)
