"""Schemas for dashboard aggregates and report rows."""

from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    """Aggregates computed with SQL COUNT (full tables — not paginated list caps)."""

    total_customers: int
    total_vehicles: int
    open_service_requests: int
    ongoing_work_orders: int
    pending_bills: int
    low_stock_skus: int


class PendingBillReportRow(BaseModel):
    """Aligned with vw_pending_bills (ORM-built, same columns)."""

    bill_id: int
    work_order_id: int
    bill_date: date
    total_amount: Decimal
    payment_status: str
    work_order_status: str
    work_order_open_date: date | None
    work_order_close_date: date | None


class ServiceRequestPipelineRow(BaseModel):
    """Aligned with vw_service_request_summary."""

    request_id: int
    request_date: date
    request_type: str | None
    request_status: str
    problem_description: str | None = None
    vehicle_id: int
    registration_no: str | None
    make: str | None
    model: str | None
    customer_id: int
    customer_name: str
    center_id: int
    center_name: str
    inspection_id: int | None = None
    work_order_id: int | None = None
    work_order_status: str | None = None
