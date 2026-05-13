"""HTTP routes for service_center_inventory."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...db.session import get_db
from .schema import InventoryCreate, InventoryRowResponse, InventoryUpdate
from . import service

router = APIRouter()

_LOOKUP = {
    "service_center": "Service center not found.",
    "part": "Spare part not found.",
}


def _lookup_exc(key: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=_LOOKUP.get(key, "Related record was not found."),
    )


@router.get("/low-stock", response_model=list[InventoryRowResponse])
def list_low_stock_inventory(
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Parts where quantity_on_hand <= reorder_level (same rule as vw_low_stock_parts)."""
    return service.list_low_stock(db, skip=skip, limit=limit)


@router.get("", response_model=list[InventoryRowResponse])
def list_inventory(
    db: Annotated[Session, Depends(get_db)],
    center_id: int | None = Query(None, description="Filter to one service center"),
    low_stock_only: bool = Query(False, description="Only rows at or below reorder level"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return service.list_inventory(
        db,
        center_id=center_id,
        low_stock_only=low_stock_only,
        skip=skip,
        limit=limit,
    )


@router.post("", response_model=InventoryRowResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_row(
    payload: InventoryCreate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        sci = service.create_inventory_row(db, payload)
    except LookupError as e:
        raise _lookup_exc(e.args[0]) from e
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This part is already stocked at this center; use PATCH to update.",
        ) from e
    enriched = service.get_inventory_row(db, sci.center_id, sci.part_id)
    assert enriched is not None
    return enriched


@router.patch("/{center_id}/{part_id}", response_model=InventoryRowResponse)
def update_inventory_row(
    center_id: int,
    part_id: int,
    payload: InventoryUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    row = service.update_inventory_row(db, center_id, part_id, payload)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory row not found")
    enriched = service.get_inventory_row(db, center_id, part_id)
    assert enriched is not None
    return enriched


@router.delete("/{center_id}/{part_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory_row(
    center_id: int,
    part_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    deleted = service.delete_inventory_row(db, center_id, part_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory row not found")
