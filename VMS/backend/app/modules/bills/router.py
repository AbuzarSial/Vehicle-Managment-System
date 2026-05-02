"""HTTP routes for bills."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...db.session import get_db
from .schema import BillCreate, BillResponse, BillUpdate
from . import service

router = APIRouter()


@router.get("", response_model=list[BillResponse])
def list_bills(
    db: Annotated[Session, Depends(get_db)],
    work_order_id: int | None = Query(None),
    payment_status: str | None = Query(None, max_length=64),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return service.list_bills(
        db,
        work_order_id=work_order_id,
        payment_status=payment_status,
        skip=skip,
        limit=limit,
    )


@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(
    bill_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    row = service.get_bill(db, bill_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return row


@router.post("", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
def create_bill(
    payload: BillCreate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        return service.create_bill(db, payload)
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found",
        )
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This work order already has a bill (one bill per work order).",
        ) from e


@router.patch("/{bill_id}", response_model=BillResponse)
def update_bill(
    bill_id: int,
    payload: BillUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        row = service.update_bill(db, bill_id, payload)
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found",
        )
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot update bill: duplicate work_order_id or constraint violation.",
        ) from e
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
    return row


@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bill(
    bill_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    deleted = service.delete_bill(db, bill_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")
