"""SQLAlchemy models for work_orders and junction tables.

Matches database/schema/004 (work_orders) and 005 (work_order_mechanics, work_order_parts).
"""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Integer, Numeric, String, func, text
from sqlalchemy.orm import Mapped, mapped_column

from ...db.base import Base


class WorkOrder(Base):
    """Job opened from exactly one inspection (1:1 via unique inspection_id)."""

    __tablename__ = "work_orders"

    work_order_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    inspection_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("inspections.inspection_id", ondelete="RESTRICT"),
        nullable=False,
        unique=True,
    )
    open_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    close_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        server_default=text("'open'"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
    )


class WorkOrderMechanic(Base):
    """Labor line: mechanic hours and rate on a work order."""

    __tablename__ = "work_order_mechanics"

    work_order_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("work_orders.work_order_id", ondelete="CASCADE"),
        primary_key=True,
    )
    mechanic_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("mechanics.mechanic_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    hours_worked: Mapped[Decimal] = mapped_column(
        Numeric(6, 2),
        nullable=False,
        server_default="0",
    )
    labor_rate: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        server_default="0",
    )


class WorkOrderPart(Base):
    """Parts usage line on a work order."""

    __tablename__ = "work_order_parts"

    work_order_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("work_orders.work_order_id", ondelete="CASCADE"),
        primary_key=True,
    )
    part_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("spare_parts.part_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    quantity_used: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    sale_price_at_use: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        server_default="0",
    )
