"""Spare parts catalog CRUD."""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .model import SparePart
from .schema import SparePartCreate, SparePartUpdate


def list_spare_parts(db: Session, *, skip: int = 0, limit: int = 500) -> list[SparePart]:
    stmt = select(SparePart).order_by(SparePart.part_id).offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def get_spare_part(db: Session, part_id: int) -> SparePart | None:
    return db.get(SparePart, part_id)


def create_spare_part(db: Session, data: SparePartCreate) -> SparePart:
    row = SparePart(
        part_name=data.part_name,
        brand=data.brand,
        unit_price=data.unit_price,
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return row


def update_spare_part(db: Session, part_id: int, data: SparePartUpdate) -> SparePart | None:
    row = db.get(SparePart, part_id)
    if row is None:
        return None
    payload = data.model_dump(exclude_unset=True)
    for key, value in payload.items():
        setattr(row, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return row


def delete_spare_part(db: Session, part_id: int) -> bool:
    row = db.get(SparePart, part_id)
    if row is None:
        return False
    db.delete(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    return True
