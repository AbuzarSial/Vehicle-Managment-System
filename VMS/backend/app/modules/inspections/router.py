"""HTTP routes for inspections."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...db.session import get_db
from .schema import InspectionCreate, InspectionResponse, InspectionUpdate
from . import service

router = APIRouter()

_LOOKUP_MESSAGES = {
    "service_request": "Service request not found.",
    "mechanic": "Mechanic not found.",
}


def _lookup_error(key: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=_LOOKUP_MESSAGES.get(key, "Related record was not found."),
    )


@router.get("", response_model=list[InspectionResponse])
def list_inspections(
    db: Annotated[Session, Depends(get_db)],
    request_id: int | None = Query(None, description="Only the inspection for this request (0 or 1 row)"),
    mechanic_id: int | None = Query(None, description="Inspections performed by this mechanic"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return service.list_inspections(
        db,
        request_id=request_id,
        mechanic_id=mechanic_id,
        skip=skip,
        limit=limit,
    )


@router.get("/{inspection_id}", response_model=InspectionResponse)
def get_inspection(
    inspection_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    row = service.get_inspection(db, inspection_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")
    return row


@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
def create_inspection(
    payload: InspectionCreate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        return service.create_inspection(db, payload)
    except LookupError as e:
        key = e.args[0] if e.args else ""
        raise _lookup_error(key) from e
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Cannot create inspection: this service request already has one "
                "(one inspection per request), or a related constraint failed."
            ),
        ) from e


@router.patch("/{inspection_id}", response_model=InspectionResponse)
def update_inspection(
    inspection_id: int,
    payload: InspectionUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        row = service.update_inspection(db, inspection_id, payload)
    except LookupError as e:
        key = e.args[0] if e.args else ""
        raise _lookup_error(key) from e
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Cannot update inspection: duplicate request_id or related constraint violation."
            ),
        ) from e
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")
    return row


@router.delete("/{inspection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inspection(
    inspection_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        deleted = service.delete_inspection(db, inspection_id)
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete inspection while a work order references it.",
        ) from e
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")
