"""Service center inventory CRUD and low-stock queries."""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..service_centers.model import ServiceCenter
from ..spare_parts.model import SparePart
from .model import ServiceCenterInventory
from .schema import InventoryCreate, InventoryRowResponse, InventoryUpdate


def _ensure_center(db: Session, center_id: int) -> None:
    if db.get(ServiceCenter, center_id) is None:
        raise LookupError("service_center")


def _ensure_part(db: Session, part_id: int) -> None:
    if db.get(SparePart, part_id) is None:
        raise LookupError("part")


def _row_to_response(
    sci: ServiceCenterInventory,
    *,
    center_name: str,
    part_name: str,
    brand: str | None,
) -> InventoryRowResponse:
    low = sci.quantity_on_hand <= sci.reorder_level
    return InventoryRowResponse(
        center_id=sci.center_id,
        center_name=center_name,
        part_id=sci.part_id,
        part_name=part_name,
        brand=brand,
        quantity_on_hand=sci.quantity_on_hand,
        reorder_level=sci.reorder_level,
        shelf_location=sci.shelf_location,
        is_low_stock=low,
    )


def list_inventory(
    db: Session,
    *,
    center_id: int | None = None,
    low_stock_only: bool = False,
    skip: int = 0,
    limit: int = 500,
) -> list[InventoryRowResponse]:
    stmt = (
        select(ServiceCenterInventory, ServiceCenter.center_name, SparePart.part_name, SparePart.brand)
        .join(SparePart, SparePart.part_id == ServiceCenterInventory.part_id)
        .join(ServiceCenter, ServiceCenter.center_id == ServiceCenterInventory.center_id)
        .order_by(ServiceCenterInventory.center_id, ServiceCenterInventory.part_id)
    )
    if center_id is not None:
        stmt = stmt.where(ServiceCenterInventory.center_id == center_id)
    if low_stock_only:
        stmt = stmt.where(
            ServiceCenterInventory.quantity_on_hand <= ServiceCenterInventory.reorder_level,
        )
    stmt = stmt.offset(skip).limit(limit)
    out: list[InventoryRowResponse] = []
    for sci, center_name, part_name, brand in db.execute(stmt).all():
        out.append(_row_to_response(sci, center_name=center_name, part_name=part_name, brand=brand))
    return out


def list_low_stock(db: Session, *, skip: int = 0, limit: int = 500) -> list[InventoryRowResponse]:
    return list_inventory(db, center_id=None, low_stock_only=True, skip=skip, limit=limit)


def get_inventory_row(
    db: Session,
    center_id: int,
    part_id: int,
) -> InventoryRowResponse | None:
    stmt = (
        select(ServiceCenterInventory, ServiceCenter.center_name, SparePart.part_name, SparePart.brand)
        .join(SparePart, SparePart.part_id == ServiceCenterInventory.part_id)
        .join(ServiceCenter, ServiceCenter.center_id == ServiceCenterInventory.center_id)
        .where(
            ServiceCenterInventory.center_id == center_id,
            ServiceCenterInventory.part_id == part_id,
        )
    )
    row = db.execute(stmt).first()
    if row is None:
        return None
    sci, center_name, part_name, brand = row
    return _row_to_response(sci, center_name=center_name, part_name=part_name, brand=brand)


def create_inventory_row(db: Session, data: InventoryCreate) -> ServiceCenterInventory:
    _ensure_center(db, data.center_id)
    _ensure_part(db, data.part_id)
    sci = ServiceCenterInventory(
        center_id=data.center_id,
        part_id=data.part_id,
        quantity_on_hand=data.quantity_on_hand,
        reorder_level=data.reorder_level,
        shelf_location=data.shelf_location,
    )
    db.add(sci)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(sci)
    return sci


def update_inventory_row(
    db: Session,
    center_id: int,
    part_id: int,
    data: InventoryUpdate,
) -> ServiceCenterInventory | None:
    row = db.get(ServiceCenterInventory, (center_id, part_id))
    if row is None:
        return None
    payload = data.model_dump(exclude_unset=True)
    for key, value in payload.items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def delete_inventory_row(db: Session, center_id: int, part_id: int) -> bool:
    row = db.get(ServiceCenterInventory, (center_id, part_id))
    if row is None:
        return False
    db.delete(row)
    db.commit()
    return True
