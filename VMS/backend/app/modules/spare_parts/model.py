"""SQLAlchemy model for spare_parts catalog."""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, DateTime, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from ...db.base import Base


class SparePart(Base):
    """Catalog row for parts consumed on work orders and stocked at centers."""

    __tablename__ = "spare_parts"

    part_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    part_name: Mapped[str] = mapped_column(String(255), nullable=False)
    brand: Mapped[str | None] = mapped_column(String(128), nullable=True)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
    )
