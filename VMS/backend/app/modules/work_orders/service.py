"""CRUD for work orders; mechanics and parts junction rows."""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..inspections.model import Inspection
from ..mechanics.model import Mechanic
from ..spare_parts.model import SparePart
from .model import WorkOrder, WorkOrderMechanic, WorkOrderPart
from .schema import (
    WorkOrderCreate,
    WorkOrderDetailResponse,
    WorkOrderMechanicAssign,
    WorkOrderMechanicLine,
    WorkOrderMechanicUpdate,
    WorkOrderPartAdd,
    WorkOrderPartLine,
    WorkOrderPartUpdate,
    WorkOrderUpdate,
)


def _ensure_inspection(db: Session, inspection_id: int) -> None:
    if db.get(Inspection, inspection_id) is None:
        raise LookupError("inspection")


def _ensure_mechanic(db: Session, mechanic_id: int) -> None:
    if db.get(Mechanic, mechanic_id) is None:
        raise LookupError("mechanic")


def _ensure_part(db: Session, part_id: int) -> None:
    if db.get(SparePart, part_id) is None:
        raise LookupError("part")


def _mechanic_lines(db: Session, work_order_id: int) -> list[WorkOrderMechanic]:
    stmt = select(WorkOrderMechanic).where(WorkOrderMechanic.work_order_id == work_order_id)
    return list(db.scalars(stmt).all())


def _part_lines(db: Session, work_order_id: int) -> list[WorkOrderPart]:
    stmt = select(WorkOrderPart).where(WorkOrderPart.work_order_id == work_order_id)
    return list(db.scalars(stmt).all())


def to_detail_response(db: Session, wo: WorkOrder) -> WorkOrderDetailResponse:
    mechs = _mechanic_lines(db, wo.work_order_id)
    parts = _part_lines(db, wo.work_order_id)
    return WorkOrderDetailResponse(
        work_order_id=wo.work_order_id,
        inspection_id=wo.inspection_id,
        open_date=wo.open_date,
        close_date=wo.close_date,
        status=wo.status,
        created_at=wo.created_at,
        mechanics=[WorkOrderMechanicLine.model_validate(m) for m in mechs],
        parts=[WorkOrderPartLine.model_validate(p) for p in parts],
    )


def list_work_orders(
    db: Session,
    *,
    inspection_id: int | None = None,
    status: str | None = None,
    skip: int = 0,
    limit: int = 500,
) -> list[WorkOrder]:
    stmt = select(WorkOrder).order_by(WorkOrder.work_order_id)
    if inspection_id is not None:
        stmt = stmt.where(WorkOrder.inspection_id == inspection_id)
    if status is not None:
        stmt = stmt.where(WorkOrder.status == status)
    stmt = stmt.offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def get_work_order(db: Session, work_order_id: int) -> WorkOrder | None:
    return db.get(WorkOrder, work_order_id)


def get_work_order_detail(db: Session, work_order_id: int) -> WorkOrderDetailResponse | None:
    wo = db.get(WorkOrder, work_order_id)
    if wo is None:
        return None
    return to_detail_response(db, wo)


def create_work_order(db: Session, data: WorkOrderCreate) -> WorkOrder:
    _ensure_inspection(db, data.inspection_id)
    row = WorkOrder(
        inspection_id=data.inspection_id,
        open_date=data.open_date,
        close_date=data.close_date,
        status=data.status,
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return row


def update_work_order(db: Session, work_order_id: int, data: WorkOrderUpdate) -> WorkOrder | None:
    row = db.get(WorkOrder, work_order_id)
    if row is None:
        return None
    payload = data.model_dump(exclude_unset=True)
    if "inspection_id" in payload:
        _ensure_inspection(db, payload["inspection_id"])
    for key, value in payload.items():
        setattr(row, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return row


def delete_work_order(db: Session, work_order_id: int) -> bool:
    row = db.get(WorkOrder, work_order_id)
    if row is None:
        return False
    db.delete(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    return True


def assign_mechanic(db: Session, work_order_id: int, data: WorkOrderMechanicAssign) -> WorkOrderMechanic:
    if db.get(WorkOrder, work_order_id) is None:
        raise LookupError("work_order")
    _ensure_mechanic(db, data.mechanic_id)
    row = WorkOrderMechanic(
        work_order_id=work_order_id,
        mechanic_id=data.mechanic_id,
        hours_worked=data.hours_worked,
        labor_rate=data.labor_rate,
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return row


def update_mechanic_line(
    db: Session,
    work_order_id: int,
    mechanic_id: int,
    data: WorkOrderMechanicUpdate,
) -> WorkOrderMechanic | None:
    row = db.get(WorkOrderMechanic, (work_order_id, mechanic_id))
    if row is None:
        return None
    payload = data.model_dump(exclude_unset=True)
    for key, value in payload.items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def remove_mechanic(db: Session, work_order_id: int, mechanic_id: int) -> bool:
    row = db.get(WorkOrderMechanic, (work_order_id, mechanic_id))
    if row is None:
        return False
    db.delete(row)
    db.commit()
    return True


def add_part(db: Session, work_order_id: int, data: WorkOrderPartAdd) -> WorkOrderPart:
    if db.get(WorkOrder, work_order_id) is None:
        raise LookupError("work_order")
    _ensure_part(db, data.part_id)
    row = WorkOrderPart(
        work_order_id=work_order_id,
        part_id=data.part_id,
        quantity_used=data.quantity_used,
        sale_price_at_use=data.sale_price_at_use,
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return row


def update_part_line(
    db: Session,
    work_order_id: int,
    part_id: int,
    data: WorkOrderPartUpdate,
) -> WorkOrderPart | None:
    row = db.get(WorkOrderPart, (work_order_id, part_id))
    if row is None:
        return None
    payload = data.model_dump(exclude_unset=True)
    for key, value in payload.items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def remove_part(db: Session, work_order_id: int, part_id: int) -> bool:
    row = db.get(WorkOrderPart, (work_order_id, part_id))
    if row is None:
        return False
    db.delete(row)
    db.commit()
    return True
