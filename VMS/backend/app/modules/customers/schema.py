"""Pydantic schemas for customer API input and output."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CustomerCreate(BaseModel):
    """Fields accepted when creating a customer."""

    customer_name: str = Field(..., min_length=1, max_length=255)
    phone: str | None = Field(None, max_length=32)
    email: str | None = Field(None, max_length=255)


class CustomerUpdate(BaseModel):
    """Partial update — only sent fields are applied."""

    customer_name: str | None = Field(None, min_length=1, max_length=255)
    phone: str | None = Field(None, max_length=32)
    email: str | None = Field(None, max_length=255)


class CustomerResponse(BaseModel):
    """Customer row returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    customer_id: int
    customer_name: str
    phone: str | None
    email: str | None
    created_at: datetime
