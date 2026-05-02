"""Business logic for customer CRUD operations."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from .model import Customer
from .schema import CustomerCreate, CustomerUpdate


def list_customers(db: Session, *, skip: int = 0, limit: int = 100) -> list[Customer]:
    """Return customers ordered by id with simple offset/limit pagination."""
    stmt = select(Customer).order_by(Customer.customer_id).offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def get_customer(db: Session, customer_id: int) -> Customer | None:
    """Fetch one customer by primary key."""
    return db.get(Customer, customer_id)


def create_customer(db: Session, data: CustomerCreate) -> Customer:
    """Insert a new customer and return the persisted row."""
    row = Customer(
        customer_name=data.customer_name,
        phone=data.phone,
        email=data.email,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_customer(db: Session, customer_id: int, data: CustomerUpdate) -> Customer | None:
    """Apply partial updates; returns None if the customer does not exist."""
    row = db.get(Customer, customer_id)
    if row is None:
        return None

    payload = data.model_dump(exclude_unset=True)
    for key, value in payload.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return row


def delete_customer(db: Session, customer_id: int) -> bool:
    """Delete by id. Returns True if a row was removed."""
    row = db.get(Customer, customer_id)
    if row is None:
        return False
    db.delete(row)
    db.commit()
    return True
