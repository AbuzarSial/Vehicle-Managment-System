"""SQLAlchemy model for the customers table.

Matches database/schema/002_create_master_tables.sql exactly.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ...db.base import Base

if TYPE_CHECKING:
    from ..vehicles.model import Vehicle


class Customer(Base):
    """Customer who owns one or more vehicles."""

    __tablename__ = "customers"

    customer_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        primary_key=True,
        autoincrement=True,
    )
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
    )

    # One customer owns many vehicles (see vehicles.model.Vehicle)
    vehicles: Mapped[list[Vehicle]] = relationship("Vehicle", back_populates="customer")
