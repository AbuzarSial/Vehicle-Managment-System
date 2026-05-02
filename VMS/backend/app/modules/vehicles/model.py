"""SQLAlchemy model for the vehicles table.

Matches database/schema/003_create_vehicle_tables.sql (vehicles section).
Subtype tables (cars, motorcycles, trucks) are modeled in subtypes/models.py (joined specialization).
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.mysql import BIGINT, SMALLINT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ...db.base import Base
from ..customers.model import Customer


class Vehicle(Base):
    """Registered vehicle owned by a customer (supertype row)."""

    __tablename__ = "vehicles"
    __table_args__ = (
        UniqueConstraint("registration_no", name="uq_vehicles_registration_no"),
        UniqueConstraint("vin", name="uq_vehicles_vin"),
    )

    vehicle_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        primary_key=True,
        autoincrement=True,
    )
    customer_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("customers.customer_id", ondelete="RESTRICT"),
        nullable=False,
    )
    registration_no: Mapped[str] = mapped_column(String(64), nullable=False)
    vin: Mapped[str] = mapped_column(String(64), nullable=False)
    make: Mapped[str | None] = mapped_column(String(128), nullable=True)
    model: Mapped[str | None] = mapped_column(String(128), nullable=True)
    model_year: Mapped[int | None] = mapped_column(SMALLINT(unsigned=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
    )

    customer: Mapped[Customer] = relationship("Customer", back_populates="vehicles")
