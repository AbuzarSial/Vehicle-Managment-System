"""CRUD and validation for service requests."""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..service_centers.model import ServiceCenter
from ..vehicles.model import Vehicle
from .model import ServiceRequest
from .schema import ServiceRequestCreate, ServiceRequestUpdate


def _ensure_vehicle(db: Session, vehicle_id: int) -> None:
    if db.get(Vehicle, vehicle_id) is None:
        raise LookupError("vehicle")


def _ensure_center(db: Session, center_id: int) -> None:
    if db.get(ServiceCenter, center_id) is None:
        raise LookupError("service_center")


def list_service_requests(
    db: Session,
    *,
    vehicle_id: int | None = None,
    center_id: int | None = None,
    status: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[ServiceRequest]:
    stmt = select(ServiceRequest).order_by(ServiceRequest.request_id)
    if vehicle_id is not None:
        stmt = stmt.where(ServiceRequest.vehicle_id == vehicle_id)
    if center_id is not None:
        stmt = stmt.where(ServiceRequest.center_id == center_id)
    if status is not None:
        stmt = stmt.where(ServiceRequest.status == status)
    stmt = stmt.offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def get_service_request(db: Session, request_id: int) -> ServiceRequest | None:
    return db.get(ServiceRequest, request_id)


def create_service_request(db: Session, data: ServiceRequestCreate) -> ServiceRequest:
    _ensure_vehicle(db, data.vehicle_id)
    _ensure_center(db, data.center_id)

    row = ServiceRequest(
        vehicle_id=data.vehicle_id,
        center_id=data.center_id,
        request_date=data.request_date,
        request_type=data.request_type,
        problem_description=data.problem_description,
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


def update_service_request(
    db: Session,
    request_id: int,
    data: ServiceRequestUpdate,
) -> ServiceRequest | None:
    row = db.get(ServiceRequest, request_id)
    if row is None:
        return None

    payload = data.model_dump(exclude_unset=True)
    if "vehicle_id" in payload:
        _ensure_vehicle(db, payload["vehicle_id"])
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


def delete_service_request(db: Session, request_id: int) -> bool:
    row = db.get(ServiceRequest, request_id)
    if row is None:
        return False
    db.delete(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    return True
