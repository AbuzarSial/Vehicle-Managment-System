"""Pydantic schemas for spare parts catalog."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class SparePartCreate(BaseModel):
    part_name: str = Field(..., min_length=1, max_length=255)
    brand: str | None = Field(None, max_length=128)
    unit_price: Decimal = Field(default=Decimal("0"), ge=0)


class SparePartUpdate(BaseModel):
    part_name: str | None = Field(None, min_length=1, max_length=255)
    brand: str | None = Field(None, max_length=128)
    unit_price: Decimal | None = Field(None, ge=0)


class SparePartResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    part_id: int
    part_name: str
    brand: str | None
    unit_price: Decimal
    created_at: datetime
