"""Pydantic schemas for service centers."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ServiceCenterCreate(BaseModel):
    center_name: str = Field(..., min_length=1, max_length=255)
    phone: str | None = Field(None, max_length=32)
    city: str | None = Field(None, max_length=100)
    address: str | None = Field(None, max_length=512)


class ServiceCenterUpdate(BaseModel):
    center_name: str | None = Field(None, min_length=1, max_length=255)
    phone: str | None = Field(None, max_length=32)
    city: str | None = Field(None, max_length=100)
    address: str | None = Field(None, max_length=512)


class ServiceCenterResponse(BaseModel):
    """Row returned from service_centers table."""

    model_config = ConfigDict(from_attributes=True)

    center_id: int
    center_name: str
    phone: str | None
    city: str | None
    address: str | None
    created_at: datetime
