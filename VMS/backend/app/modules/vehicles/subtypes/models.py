"""SQLAlchemy models for vehicle subtypes (joined specialization).

Matches database/schema/003_create_vehicle_tables.sql — PK/FK vehicle_id → vehicles ON DELETE CASCADE.
"""

from __future__ import annotations

from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.mysql import BIGINT, SMALLINT
from sqlalchemy.orm import Mapped, mapped_column

from ....db.base import Base


class Car(Base):
    __tablename__ = "cars"

    vehicle_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"),
        primary_key=True,
    )
    number_of_doors: Mapped[int | None] = mapped_column(SMALLINT(unsigned=True), nullable=True)
    body_type: Mapped[str | None] = mapped_column(String(64), nullable=True)


class Motorcycle(Base):
    __tablename__ = "motorcycles"

    vehicle_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"),
        primary_key=True,
    )
    engine_cc: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bike_type: Mapped[str | None] = mapped_column(String(64), nullable=True)


class Truck(Base):
    __tablename__ = "trucks"

    vehicle_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"),
        primary_key=True,
    )
    load_capacity: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    axle_count: Mapped[int | None] = mapped_column(SMALLINT(unsigned=True), nullable=True)
