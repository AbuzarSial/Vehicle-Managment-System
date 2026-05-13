"""HTTP routes for spare parts catalog."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...db.session import get_db
from .schema import SparePartCreate, SparePartResponse, SparePartUpdate
from . import service

router = APIRouter()


@router.get("", response_model=list[SparePartResponse])
def list_spare_parts(
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return service.list_spare_parts(db, skip=skip, limit=limit)


@router.get("/{part_id}", response_model=SparePartResponse)
def get_spare_part(
    part_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    row = service.get_spare_part(db, part_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Part not found")
    return row


@router.post("", response_model=SparePartResponse, status_code=status.HTTP_201_CREATED)
def create_spare_part(
    payload: SparePartCreate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        return service.create_spare_part(db, payload)
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create spare part.",
        ) from e


@router.patch("/{part_id}", response_model=SparePartResponse)
def update_spare_part(
    part_id: int,
    payload: SparePartUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        row = service.update_spare_part(db, part_id, payload)
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not update spare part.",
        ) from e
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Part not found")
    return row


@router.delete("/{part_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_spare_part(
    part_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        deleted = service.delete_spare_part(db, part_id)
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete part while referenced by inventory or work orders.",
        ) from e
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Part not found")
