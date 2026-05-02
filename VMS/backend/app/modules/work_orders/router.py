"""HTTP routes for work orders, mechanic assignments, and parts usage."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...db.session import get_db
from .schema import (
    WorkOrderCreate,
    WorkOrderDetailResponse,
    WorkOrderMechanicAssign,
    WorkOrderMechanicLine,
    WorkOrderMechanicUpdate,
    WorkOrderPartAdd,
    WorkOrderPartLine,
    WorkOrderPartUpdate,
    WorkOrderResponse,
    WorkOrderUpdate,
)
from . import service

router = APIRouter()

_LOOKUP = {
    "inspection": "Inspection not found.",
    "mechanic": "Mechanic not found.",
    "part": "Spare part not found.",
    "work_order": "Work order not found.",
}


def _not_found(key: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=_LOOKUP.get(key, "Related record was not found."),
    )


@router.get("", response_model=list[WorkOrderResponse])
def list_work_orders(
    db: Annotated[Session, Depends(get_db)],
    inspection_id: int | None = Query(None),
    status: str | None = Query(None, max_length=64),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return service.list_work_orders(
        db,
        inspection_id=inspection_id,
        status=status,
        skip=skip,
        limit=limit,
    )


@router.post("", response_model=WorkOrderResponse, status_code=status.HTTP_201_CREATED)
def create_work_order(
    payload: WorkOrderCreate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        return service.create_work_order(db, payload)
    except LookupError as e:
        raise _not_found(e.args[0]) from e
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot create work order: inspection already has one, or constraint failed.",
        ) from e


@router.get("/{work_order_id}", response_model=WorkOrderDetailResponse)
def get_work_order(
    work_order_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    row = service.get_work_order_detail(db, work_order_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found")
    return row


@router.patch("/{work_order_id}", response_model=WorkOrderResponse)
def update_work_order(
    work_order_id: int,
    payload: WorkOrderUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        row = service.update_work_order(db, work_order_id, payload)
    except LookupError as e:
        raise _not_found(e.args[0]) from e
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot update work order: duplicate inspection_id or constraint violation.",
        ) from e
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found")
    return row


@router.delete("/{work_order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_work_order(
    work_order_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        deleted = service.delete_work_order(db, work_order_id)
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete work order while a bill references it.",
        ) from e
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found")


# --- Mechanics on work order ---


@router.post(
    "/{work_order_id}/mechanics",
    response_model=WorkOrderMechanicLine,
    status_code=status.HTTP_201_CREATED,
)
def assign_mechanic(
    work_order_id: int,
    payload: WorkOrderMechanicAssign,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        row = service.assign_mechanic(db, work_order_id, payload)
    except LookupError as e:
        raise _not_found(e.args[0]) from e
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Mechanic already assigned to this work order; use PATCH to update hours/rate.",
        ) from e
    return WorkOrderMechanicLine.model_validate(row)


@router.patch(
    "/{work_order_id}/mechanics/{mechanic_id}",
    response_model=WorkOrderMechanicLine,
)
def update_mechanic_assignment(
    work_order_id: int,
    mechanic_id: int,
    payload: WorkOrderMechanicUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    row = service.update_mechanic_line(db, work_order_id, mechanic_id, payload)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mechanic assignment not found for this work order.",
        )
    return WorkOrderMechanicLine.model_validate(row)


@router.delete(
    "/{work_order_id}/mechanics/{mechanic_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_mechanic_assignment(
    work_order_id: int,
    mechanic_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    removed = service.remove_mechanic(db, work_order_id, mechanic_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mechanic assignment not found for this work order.",
        )


# --- Parts on work order ---


@router.post(
    "/{work_order_id}/parts",
    response_model=WorkOrderPartLine,
    status_code=status.HTTP_201_CREATED,
)
def add_work_order_part(
    work_order_id: int,
    payload: WorkOrderPartAdd,
    db: Annotated[Session, Depends(get_db)],
):
    try:
        row = service.add_part(db, work_order_id, payload)
    except LookupError as e:
        raise _not_found(e.args[0]) from e
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Part already added to this work order; use PATCH to update quantity or price.",
        ) from e
    return WorkOrderPartLine.model_validate(row)


@router.patch(
    "/{work_order_id}/parts/{part_id}",
    response_model=WorkOrderPartLine,
)
def update_work_order_part(
    work_order_id: int,
    part_id: int,
    payload: WorkOrderPartUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    row = service.update_part_line(db, work_order_id, part_id, payload)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part line not found on this work order.",
        )
    return WorkOrderPartLine.model_validate(row)


@router.delete(
    "/{work_order_id}/parts/{part_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_work_order_part(
    work_order_id: int,
    part_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    removed = service.remove_part(db, work_order_id, part_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part line not found on this work order.",
        )
