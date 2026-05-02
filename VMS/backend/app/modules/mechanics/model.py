"""SQLAlchemy model for mechanics table.

Matches database/schema/004_create_service_workflow_tables.sql.
"""

from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from ...db.base import Base


class Mechanic(Base):
    """Mechanic employed at one service center."""

    __tablename__ = "mechanics"

    mechanic_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    center_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("service_centers.center_id", ondelete="RESTRICT"),
        nullable=False,
    )
    mechanic_name: Mapped[str] = mapped_column(String(255), nullable=False)
    specialization: Mapped[str | None] = mapped_column(String(255), nullable=True)
    certification_level: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
    )
