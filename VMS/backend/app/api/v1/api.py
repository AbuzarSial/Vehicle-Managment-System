"""API version 1 — aggregates routers from feature modules."""

from fastapi import APIRouter

from ...modules.bills import router as bills_router
from ...modules.customers import router as customers_router
from ...modules.inspections import router as inspections_router
from ...modules.inventory import router as inventory_router
from ...modules.mechanics import router as mechanics_router
from ...modules.reports import router as reports_router
from ...modules.spare_parts import router as spare_parts_router
from ...modules.service_centers import router as service_centers_router
from ...modules.service_requests import router as service_requests_router
from ...modules.vehicles import router as vehicles_router
from ...modules.work_orders import router as work_orders_router

router = APIRouter()

router.include_router(customers_router, prefix="/customers", tags=["customers"])
router.include_router(vehicles_router, prefix="/vehicles", tags=["vehicles"])
router.include_router(
    service_centers_router,
    prefix="/service-centers",
    tags=["service_centers"],
)
router.include_router(mechanics_router, prefix="/mechanics", tags=["mechanics"])
router.include_router(
    service_requests_router,
    prefix="/service-requests",
    tags=["service_requests"],
)
router.include_router(inspections_router, prefix="/inspections", tags=["inspections"])
router.include_router(work_orders_router, prefix="/work-orders", tags=["work_orders"])
router.include_router(spare_parts_router, prefix="/spare-parts", tags=["spare_parts"])
router.include_router(inventory_router, prefix="/inventory", tags=["inventory"])
router.include_router(bills_router, prefix="/bills", tags=["bills"])
router.include_router(reports_router, prefix="/reports", tags=["reports"])


@router.get("/ping")
def ping():
    """Lightweight check that the v1 router is mounted (no database required)."""
    return {"message": "ok", "api": "v1"}
