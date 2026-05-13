"""HTTP routes for service_requests."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...db.session import get_db
from .schema import ServiceRequestCreate, ServiceRequestResponse, ServiceRequestUpdate
from . import service

router = APIRouter()

_FK_MESSAGES = {
    "vehicle": "No vehicle exists with that vehicle_id.",
    "service_center": "No service center exists with that center_id.",
}


def _not_found_fk(key: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=_FK_MESSAGES.get(key, "Related record was not found."),
    )


@router.get("", response_model=list[ServiceRequestResponse])
def list_service_requests(
    db: Annotated[Session, Depends(get_db)],
    vehicle_id: int | None = Query(None, description="Only requests for this vehicle"),
    center_id: int | None = Query(None, description="Only requests at this center"),
    status: str | None = Query(None, max_length=64, description="Exact status match"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """List service requests with optional filters."""
    return service.list_service_requests(
        db,
        vehicle_id=vehicle_id,
        center_id=center_id,
        status=status,
        skip=skip,
        limit=limit,
    )


@router.get("/{request_id}", response_model=ServiceRequestResponse)
def get_service_request(
    request_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    row = service.get_service_request(db, request_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No service request exists with that request_id.",
        )
    return row


@router.post("", response_model=ServiceRequestResponse, status_code=status.HTTP_201_CREATED)
def create_service_request(
    payload: ServiceRequestCreate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        return service.create_service_request(db, payload)
    except LookupError as e:
        key = e.args[0] if e.args else ""
        raise _not_found_fk(key) from e
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create service request (database constraint conflict).",
        )


@router.patch("/{request_id}", response_model=ServiceRequestResponse)
def update_service_request(
    request_id: int,
    payload: ServiceRequestUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        row = service.update_service_request(db, request_id, payload)
    except LookupError as e:
        key = e.args[0] if e.args else ""
        raise _not_found_fk(key) from e
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not update service request (database constraint conflict).",
        )
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No service request exists with that request_id.",
        )
    return row


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_request(
    request_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        deleted = service.delete_service_request(db, request_id)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Cannot delete this service request because another row still "
                "references it (for example an inspection). Remove those first."
            ),
        )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No service request exists with that request_id.",
        )
