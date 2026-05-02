"""Pydantic schemas for inspections API."""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class InspectionCreate(BaseModel):
    """Create inspection for exactly one service request."""

    request_id: int = Field(..., ge=1)
    mechanic_id: int | None = Field(None, ge=1)
    inspection_date: date | None = None
    findings: str | None = Field(None, description="Technician notes")
    result: str | None = Field(None, max_length=128, description="e.g. passed, repair_needed")


class InspectionUpdate(BaseModel):
    """Partial update; changing request_id must still respect 1:1 uniqueness."""

    request_id: int | None = Field(None, ge=1)
    mechanic_id: int | None = Field(None, ge=1)
    inspection_date: date | None = None
    findings: str | None = None
    result: str | None = Field(None, max_length=128)


class InspectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    inspection_id: int
    request_id: int
    mechanic_id: int | None
    inspection_date: date | None
    findings: str | None
    result: str | None
    created_at: datetime
