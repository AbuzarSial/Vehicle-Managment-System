"""Version 1 API router aggregation."""

from fastapi import APIRouter

# Import module routers (they are simple placeholders)
from ...modules.customers import router as customers_router
from ...modules.vehicles import router as vehicles_router
from ...modules.service_requests import router as service_requests_router

router = APIRouter()

# include module routers with prefixes and tags
router.include_router(customers_router, prefix="/customers", tags=["customers"])
router.include_router(vehicles_router, prefix="/vehicles", tags=["vehicles"])
router.include_router(service_requests_router, prefix="/service-requests", tags=["service_requests"])
