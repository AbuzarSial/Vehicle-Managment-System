"""HTTP routes for service centers."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...db.session import get_db
from .schema import ServiceCenterCreate, ServiceCenterResponse, ServiceCenterUpdate
from . import service

router = APIRouter()


@router.get("", response_model=list[ServiceCenterResponse])
def list_service_centers(
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """List service centers."""
    return service.list_service_centers(db, skip=skip, limit=limit)


@router.get("/{center_id}", response_model=ServiceCenterResponse)
def get_service_center(
    center_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    row = service.get_service_center(db, center_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service center not found")
    return row


@router.post("", response_model=ServiceCenterResponse, status_code=status.HTTP_201_CREATED)
def create_service_center(
    payload: ServiceCenterCreate,
    db: Annotated[Session, Depends(get_db)],
):
    return service.create_service_center(db, payload)


@router.patch("/{center_id}", response_model=ServiceCenterResponse)
def update_service_center(
    center_id: int,
    payload: ServiceCenterUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    row = service.update_service_center(db, center_id, payload)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service center not found")
    return row


@router.delete("/{center_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_center(
    center_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        deleted = service.delete_service_center(db, center_id)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete service center while mechanics, requests, or other rows reference it.",
        )
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service center not found")
