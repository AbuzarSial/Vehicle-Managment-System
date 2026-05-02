"""CRUD for bills."""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..work_orders.model import WorkOrder
from .model import Bill
from .schema import BillCreate, BillUpdate


def _ensure_work_order(db: Session, work_order_id: int) -> None:
    if db.get(WorkOrder, work_order_id) is None:
        raise LookupError("work_order")


def list_bills(
    db: Session,
    *,
    work_order_id: int | None = None,
    payment_status: str | None = None,
    skip: int = 0,
    limit: int = 500,
) -> list[Bill]:
    stmt = select(Bill).order_by(Bill.bill_id)
    if work_order_id is not None:
        stmt = stmt.where(Bill.work_order_id == work_order_id)
    if payment_status is not None:
        stmt = stmt.where(Bill.payment_status == payment_status)
    stmt = stmt.offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def get_bill(db: Session, bill_id: int) -> Bill | None:
    return db.get(Bill, bill_id)


def create_bill(db: Session, data: BillCreate) -> Bill:
    _ensure_work_order(db, data.work_order_id)
    row = Bill(
        work_order_id=data.work_order_id,
        bill_date=data.bill_date,
        total_amount=data.total_amount,
        payment_status=data.payment_status,
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return row


def update_bill(db: Session, bill_id: int, data: BillUpdate) -> Bill | None:
    row = db.get(Bill, bill_id)
    if row is None:
        return None
    payload = data.model_dump(exclude_unset=True)
    if "work_order_id" in payload:
        _ensure_work_order(db, payload["work_order_id"])
    for key, value in payload.items():
        setattr(row, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return row


def delete_bill(db: Session, bill_id: int) -> bool:
    row = db.get(Bill, bill_id)
    if row is None:
        return False
    db.delete(row)
    db.commit()
    return True
