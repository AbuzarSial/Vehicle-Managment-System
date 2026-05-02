"""SQLAlchemy model for service_center_inventory."""

from sqlalchemy import BigInteger, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ...db.base import Base


class ServiceCenterInventory(Base):
    """Stock of a catalog part at a specific service center (composite PK)."""

    __tablename__ = "service_center_inventory"

    center_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("service_centers.center_id", ondelete="CASCADE"),
        primary_key=True,
    )
    part_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("spare_parts.part_id", ondelete="RESTRICT"),
        primary_key=True,
    )
    quantity_on_hand: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    reorder_level: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    shelf_location: Mapped[str | None] = mapped_column(String(128), nullable=True)
