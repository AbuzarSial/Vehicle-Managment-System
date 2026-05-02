"""Dashboard aggregates and read-only report queries."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..bills.model import Bill
from ..customers.model import Customer
from ..inspections.model import Inspection
from ..inventory.model import ServiceCenterInventory
from ..service_centers.model import ServiceCenter
from ..service_requests.model import ServiceRequest
from ..vehicles.model import Vehicle
from ..work_orders.model import WorkOrder
from .schema import (
    DashboardSummaryResponse,
    PendingBillReportRow,
    ServiceRequestPipelineRow,
)


def dashboard_summary(db: Session) -> DashboardSummaryResponse:
    total_customers = int(db.scalar(select(func.count()).select_from(Customer)) or 0)
    total_vehicles = int(db.scalar(select(func.count()).select_from(Vehicle)) or 0)
    open_sr = int(
        db.scalar(
            select(func.count()).select_from(ServiceRequest).where(ServiceRequest.status == "open"),
        )
        or 0,
    )
    ongoing_wo = int(
        db.scalar(
            select(func.count()).select_from(WorkOrder).where(
                WorkOrder.status.in_(["open", "in_progress"]),
            ),
        )
        or 0,
    )
    pending_bills = int(
        db.scalar(
            select(func.count()).select_from(Bill).where(
                Bill.payment_status.in_(["unpaid", "pending"]),
            ),
        )
        or 0,
    )
    low_stock = int(
        db.scalar(
            select(func.count()).select_from(ServiceCenterInventory).where(
                ServiceCenterInventory.quantity_on_hand
                <= ServiceCenterInventory.reorder_level,
            ),
        )
        or 0,
    )
    return DashboardSummaryResponse(
        total_customers=total_customers,
        total_vehicles=total_vehicles,
        open_service_requests=open_sr,
        ongoing_work_orders=ongoing_wo,
        pending_bills=pending_bills,
        low_stock_skus=low_stock,
    )


def list_pending_bills(db: Session, *, limit: int = 50) -> list[PendingBillReportRow]:
    stmt = (
        select(
            Bill.bill_id,
            Bill.work_order_id,
            Bill.bill_date,
            Bill.total_amount,
            Bill.payment_status,
            WorkOrder.status.label("work_order_status"),
            WorkOrder.open_date.label("work_order_open_date"),
            WorkOrder.close_date.label("work_order_close_date"),
        )
        .join(WorkOrder, Bill.work_order_id == WorkOrder.work_order_id)
        .where(Bill.payment_status.in_(["unpaid", "pending"]))
        .order_by(Bill.bill_id.desc())
        .limit(limit)
    )
    rows = db.execute(stmt).mappings().all()
    return [PendingBillReportRow.model_validate(dict(r)) for r in rows]


def list_service_request_pipeline(
    db: Session,
    *,
    limit: int = 50,
    status: str | None = None,
    center_id: int | None = None,
) -> list[ServiceRequestPipelineRow]:
    stmt = (
        select(
            ServiceRequest.request_id,
            ServiceRequest.request_date,
            ServiceRequest.request_type,
            ServiceRequest.status.label("request_status"),
            ServiceRequest.problem_description,
            ServiceRequest.vehicle_id,
            Vehicle.registration_no,
            Vehicle.make,
            Vehicle.model,
            Customer.customer_id,
            Customer.customer_name,
            ServiceRequest.center_id,
            ServiceCenter.center_name,
            Inspection.inspection_id,
            WorkOrder.work_order_id,
            WorkOrder.status.label("work_order_status"),
        )
        .join(Vehicle, ServiceRequest.vehicle_id == Vehicle.vehicle_id)
        .join(Customer, Vehicle.customer_id == Customer.customer_id)
        .join(ServiceCenter, ServiceRequest.center_id == ServiceCenter.center_id)
        .outerjoin(Inspection, Inspection.request_id == ServiceRequest.request_id)
        .outerjoin(WorkOrder, WorkOrder.inspection_id == Inspection.inspection_id)
    )
    if status:
        stmt = stmt.where(ServiceRequest.status == status)
    if center_id is not None:
        stmt = stmt.where(ServiceRequest.center_id == center_id)
    stmt = stmt.order_by(ServiceRequest.request_id.desc()).limit(limit)
    rows = db.execute(stmt).mappings().all()
    return [ServiceRequestPipelineRow.model_validate(dict(r)) for r in rows]
