"""Declarative base class for all SQLAlchemy models."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Subclass this for each table model once business modules are added."""

    pass
