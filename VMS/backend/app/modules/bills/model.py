"""SQLAlchemy model for bills.

Matches database/schema/005_create_inventory_billing_tables.sql (bills section).
At most one bill per work_order (unique work_order_id).
"""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, func, text
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column

from ...db.base import Base


class Bill(Base):
    """Invoice for exactly one work order (1:1)."""

    __tablename__ = "bills"

    bill_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        primary_key=True,
        autoincrement=True,
    )
    work_order_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("work_orders.work_order_id", ondelete="RESTRICT"),
        nullable=False,
        unique=True,
    )
    bill_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default="0")
    payment_status: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        server_default=text("'unpaid'"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
    )
