"""HTTP routes for vehicles."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...db.session import get_db
from .schema import VehicleCreate, VehicleResponse, VehicleUpdate
from . import service

router = APIRouter()


@router.get("", response_model=list[VehicleResponse])
def list_vehicles(
    db: Annotated[Session, Depends(get_db)],
    customer_id: int | None = Query(None, description="Filter by owning customer_id"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return service.list_vehicles(db, customer_id=customer_id, skip=skip, limit=limit)


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    row = service.get_vehicle(db, vehicle_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return row


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    payload: VehicleCreate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        return service.create_vehicle(db, payload)
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not save vehicle (duplicate registration_no/vin or restricted delete elsewhere)",
        )


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        row = service.update_vehicle(db, vehicle_id, payload)
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not update vehicle (duplicate registration_no/vin or FK restriction)",
        )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return row


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        deleted = service.delete_vehicle(db, vehicle_id)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete vehicle while referenced by service requests or other records",
        )
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
