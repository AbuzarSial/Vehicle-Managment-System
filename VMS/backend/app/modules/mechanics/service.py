"""CRUD for mechanics."""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..service_centers.model import ServiceCenter
from .model import Mechanic
from .schema import MechanicCreate, MechanicUpdate


def _ensure_center(db: Session, center_id: int) -> None:
    if db.get(ServiceCenter, center_id) is None:
        raise LookupError("service_center")


def list_mechanics(
    db: Session,
    *,
    center_id: int | None = None,
    skip: int = 0,
    limit: int = 500,
) -> list[Mechanic]:
    stmt = select(Mechanic).order_by(Mechanic.mechanic_id)
    if center_id is not None:
        stmt = stmt.where(Mechanic.center_id == center_id)
    stmt = stmt.offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def get_mechanic(db: Session, mechanic_id: int) -> Mechanic | None:
    return db.get(Mechanic, mechanic_id)


def create_mechanic(db: Session, data: MechanicCreate) -> Mechanic:
    _ensure_center(db, data.center_id)
    row = Mechanic(
        center_id=data.center_id,
        mechanic_name=data.mechanic_name,
        specialization=data.specialization,
        certification_level=data.certification_level,
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return row


def update_mechanic(db: Session, mechanic_id: int, data: MechanicUpdate) -> Mechanic | None:
    row = db.get(Mechanic, mechanic_id)
    if row is None:
        return None

    payload = data.model_dump(exclude_unset=True)
    if "center_id" in payload:
        _ensure_center(db, payload["center_id"])

    for key, value in payload.items():
        setattr(row, key, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return row


def delete_mechanic(db: Session, mechanic_id: int) -> bool:
    row = db.get(Mechanic, mechanic_id)
    if row is None:
        return False
    db.delete(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    return True
