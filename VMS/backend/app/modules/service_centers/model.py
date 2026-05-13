"""SQLAlchemy model for service_centers.

Matches database/schema/002_create_master_tables.sql.
Used for foreign-key validation from service_requests and other modules.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from ...db.base import Base


class ServiceCenter(Base):
    """Repair location."""

    __tablename__ = "service_centers"

    center_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    center_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
    )
