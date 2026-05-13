"""HTTP routes for customers."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...db.session import get_db
from .schema import CustomerCreate, CustomerResponse, CustomerUpdate
from . import service

router = APIRouter()


@router.get("", response_model=list[CustomerResponse])
def list_customers(
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """List customers with optional pagination."""
    return service.list_customers(db, skip=skip, limit=limit)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    """Get a single customer by id."""
    row = service.get_customer(db, customer_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return row


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new customer."""
    return service.create_customer(db, payload)


@router.patch("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    """Update an existing customer (partial update)."""
    row = service.update_customer(db, customer_id, payload)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return row


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    """Delete a customer."""
    try:
        deleted = service.delete_customer(db, customer_id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Cannot delete this customer while vehicles or other records still "
                "reference them. Remove or reassign those vehicles first."
            ),
        )
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
