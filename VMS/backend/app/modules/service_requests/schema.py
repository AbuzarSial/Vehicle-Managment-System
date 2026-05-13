"""Pydantic schemas for service request API."""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ServiceRequestCreate(BaseModel):
    """Payload to open a new service request."""

    vehicle_id: int = Field(..., ge=1, description="Vehicle being serviced")
    center_id: int = Field(..., ge=1, description="Service center handling the request")
    request_date: date = Field(..., description="Date the customer requested or arrived")
    request_type: str | None = Field(
        None,
        max_length=128,
        description="e.g. maintenance, repair, diagnostic, inspection",
    )
    problem_description: str | None = Field(
        None,
        description="Customer-reported symptoms or notes",
    )
    status: str = Field(
        default="open",
        max_length=64,
        description="Workflow state (must match values your UI and DB seeds use)",
    )


class ServiceRequestUpdate(BaseModel):
    """Partial update for rescheduling, reassigning center, or status changes."""

    vehicle_id: int | None = Field(None, ge=1)
    center_id: int | None = Field(None, ge=1)
    request_date: date | None = None
    request_type: str | None = Field(None, max_length=128)
    problem_description: str | None = None
    status: str | None = Field(None, max_length=64)


class ServiceRequestResponse(BaseModel):
    """Stored service request row."""

    model_config = ConfigDict(from_attributes=True)

    request_id: int
    vehicle_id: int
    center_id: int
    request_date: date
    request_type: str | None
    problem_description: str | None
    status: str
    created_at: datetime
