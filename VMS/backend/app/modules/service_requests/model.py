"""SQLAlchemy model for service_requests.

Matches database/schema/004_create_service_workflow_tables.sql (service_requests section).
Links a vehicle to the service center handling the visit.
"""

from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, text, func
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ...db.base import Base
from ..service_centers.model import ServiceCenter
from ..vehicles.model import Vehicle


class ServiceRequest(Base):
    """A vehicle booked or dropped off at a service center for work."""

    __tablename__ = "service_requests"

    request_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        primary_key=True,
        autoincrement=True,
    )
    vehicle_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("vehicles.vehicle_id", ondelete="RESTRICT"),
        nullable=False,
    )
    center_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey("service_centers.center_id", ondelete="RESTRICT"),
        nullable=False,
    )
    request_date: Mapped[date] = mapped_column(Date, nullable=False)
    request_type: Mapped[str | None] = mapped_column(String(128), nullable=True)
    problem_description: Mapped[str | None] = mapped_column(Text, nullable=True)
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

    vehicle: Mapped[Vehicle] = relationship("Vehicle")
    service_center: Mapped[ServiceCenter] = relationship("ServiceCenter")
