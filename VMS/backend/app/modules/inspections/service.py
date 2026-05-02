"""CRUD for inspections."""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..mechanics.model import Mechanic
from ..service_requests.model import ServiceRequest
from .model import Inspection
from .schema import InspectionCreate, InspectionUpdate


def _ensure_request(db: Session, request_id: int) -> None:
    if db.get(ServiceRequest, request_id) is None:
        raise LookupError("service_request")


def _ensure_mechanic(db: Session, mechanic_id: int | None) -> None:
    if mechanic_id is None:
        return
    if db.get(Mechanic, mechanic_id) is None:
        raise LookupError("mechanic")


def list_inspections(
    db: Session,
    *,
    request_id: int | None = None,
    mechanic_id: int | None = None,
    skip: int = 0,
    limit: int = 500,
) -> list[Inspection]:
    stmt = select(Inspection).order_by(Inspection.inspection_id)
    if request_id is not None:
        stmt = stmt.where(Inspection.request_id == request_id)
    if mechanic_id is not None:
        stmt = stmt.where(Inspection.mechanic_id == mechanic_id)
    stmt = stmt.offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def get_inspection(db: Session, inspection_id: int) -> Inspection | None:
    return db.get(Inspection, inspection_id)


def create_inspection(db: Session, data: InspectionCreate) -> Inspection:
    _ensure_request(db, data.request_id)
    _ensure_mechanic(db, data.mechanic_id)

    row = Inspection(
        request_id=data.request_id,
        mechanic_id=data.mechanic_id,
        inspection_date=data.inspection_date,
        findings=data.findings,
        result=data.result,
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return row


def update_inspection(
    db: Session,
    inspection_id: int,
    data: InspectionUpdate,
) -> Inspection | None:
    row = db.get(Inspection, inspection_id)
    if row is None:
        return None

    payload = data.model_dump(exclude_unset=True)
    if "request_id" in payload:
        _ensure_request(db, payload["request_id"])
    if "mechanic_id" in payload:
        _ensure_mechanic(db, payload["mechanic_id"])

    for key, value in payload.items():
        setattr(row, key, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return row


def delete_inspection(db: Session, inspection_id: int) -> bool:
    row = db.get(Inspection, inspection_id)
    if row is None:
        return False
    db.delete(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    return True
