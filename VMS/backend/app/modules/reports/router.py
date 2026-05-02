"""Read-only dashboard and report endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ...db.session import get_db
from .schema import DashboardSummaryResponse, PendingBillReportRow, ServiceRequestPipelineRow
from . import service

router = APIRouter()


@router.get("/dashboard-summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Annotated[Session, Depends(get_db)]):
    """Counts across core tables (not limited to list pagination caps)."""
    return service.dashboard_summary(db)


@router.get("/pending-bills", response_model=list[PendingBillReportRow])
def get_pending_bills_report(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(50, ge=1, le=200),
):
    """Bills with payment_status unpaid or pending (same filter as vw_pending_bills)."""
    return service.list_pending_bills(db, limit=limit)


@router.get("/service-request-pipeline", response_model=list[ServiceRequestPipelineRow])
def get_service_request_pipeline(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(50, ge=1, le=500),
    status: str | None = Query(None, max_length=64, description="Exact service_requests.status"),
    center_id: int | None = Query(None, ge=1, description="Filter by service_requests.center_id"),
):
    """Request-centric pipeline with customer, vehicle, center, optional inspection/WO."""
    return service.list_service_request_pipeline(
        db,
        limit=limit,
        status=status,
        center_id=center_id,
    )
