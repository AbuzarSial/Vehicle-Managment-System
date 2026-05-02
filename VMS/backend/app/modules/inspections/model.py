"""SQLAlchemy model for inspections.

Matches database/schema/004_create_service_workflow_tables.sql (inspections section).
At most one inspection row per service_request (unique request_id).
"""

from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column

from ...db.base import Base


class Inspection(Base):
    """Inspection performed for a single service request (1:1)."""

    __tablename__ = "inspections"

    inspection_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        primary_key=True,
        autoincrement=True,
    )
    request_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("service_requests.request_id", ondelete="RESTRICT"),
        nullable=False,
        unique=True,
    )
    mechanic_id: Mapped[int | None] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("mechanics.mechanic_id", ondelete="SET NULL"),
        nullable=True,
    )
    inspection_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    findings: Mapped[str | None] = mapped_column(Text, nullable=True)
    result: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
    )
