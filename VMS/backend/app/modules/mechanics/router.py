"""HTTP routes for mechanics."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...db.session import get_db
from .schema import MechanicCreate, MechanicResponse, MechanicUpdate
from . import service

router = APIRouter()


@router.get("", response_model=list[MechanicResponse])
def list_mechanics(
    db: Annotated[Session, Depends(get_db)],
    center_id: int | None = Query(None, description="Filter by service center"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return service.list_mechanics(db, center_id=center_id, skip=skip, limit=limit)


@router.get("/{mechanic_id}", response_model=MechanicResponse)
def get_mechanic(
    mechanic_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    row = service.get_mechanic(db, mechanic_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mechanic not found")
    return row


@router.post("", response_model=MechanicResponse, status_code=status.HTTP_201_CREATED)
def create_mechanic(
    payload: MechanicCreate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        return service.create_mechanic(db, payload)
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service center not found",
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create mechanic.",
        )


@router.patch("/{mechanic_id}", response_model=MechanicResponse)
def update_mechanic(
    mechanic_id: int,
    payload: MechanicUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        row = service.update_mechanic(db, mechanic_id, payload)
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service center not found",
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not update mechanic.",
        )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mechanic not found")
    return row


@router.delete("/{mechanic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mechanic(
    mechanic_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        deleted = service.delete_mechanic(db, mechanic_id)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete mechanic while referenced by inspections or work orders.",
        )
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mechanic not found")
