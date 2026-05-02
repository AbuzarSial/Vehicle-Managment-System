"""CRUD for service centers."""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .model import ServiceCenter
from .schema import ServiceCenterCreate, ServiceCenterUpdate


def list_service_centers(db: Session, *, skip: int = 0, limit: int = 500) -> list[ServiceCenter]:
    stmt = select(ServiceCenter).order_by(ServiceCenter.center_id).offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def get_service_center(db: Session, center_id: int) -> ServiceCenter | None:
    return db.get(ServiceCenter, center_id)


def create_service_center(db: Session, data: ServiceCenterCreate) -> ServiceCenter:
    row = ServiceCenter(
        center_name=data.center_name,
        phone=data.phone,
        city=data.city,
        address=data.address,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_service_center(
    db: Session,
    center_id: int,
    data: ServiceCenterUpdate,
) -> ServiceCenter | None:
    row = db.get(ServiceCenter, center_id)
    if row is None:
        return None

    payload = data.model_dump(exclude_unset=True)
    for key, value in payload.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return row


def delete_service_center(db: Session, center_id: int) -> bool:
    row = db.get(ServiceCenter, center_id)
    if row is None:
        return False
    db.delete(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    return True
