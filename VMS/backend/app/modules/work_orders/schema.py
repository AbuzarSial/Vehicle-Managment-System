"""Pydantic schemas for work orders, mechanics lines, and parts lines."""

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class WorkOrderCreate(BaseModel):
    inspection_id: int = Field(..., ge=1)
    open_date: date | None = None
    close_date: date | None = None
    status: str = Field(default="open", max_length=64)


class WorkOrderUpdate(BaseModel):
    inspection_id: int | None = Field(None, ge=1)
    open_date: date | None = None
    close_date: date | None = None
    status: str | None = Field(None, max_length=64)


class WorkOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    work_order_id: int
    inspection_id: int
    open_date: date | None
    close_date: date | None
    status: str
    created_at: datetime


class WorkOrderMechanicLine(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    mechanic_id: int
    hours_worked: Decimal
    labor_rate: Decimal


class WorkOrderPartLine(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    part_id: int
    quantity_used: int
    sale_price_at_use: Decimal


class WorkOrderDetailResponse(WorkOrderResponse):
    mechanics: list[WorkOrderMechanicLine]
    parts: list[WorkOrderPartLine]


class WorkOrderMechanicAssign(BaseModel):
    mechanic_id: int = Field(..., ge=1)
    hours_worked: Decimal = Field(default=Decimal("0"), ge=0)
    labor_rate: Decimal = Field(default=Decimal("0"), ge=0)


class WorkOrderMechanicUpdate(BaseModel):
    hours_worked: Decimal | None = Field(None, ge=0)
    labor_rate: Decimal | None = Field(None, ge=0)


class WorkOrderPartAdd(BaseModel):
    part_id: int = Field(..., ge=1)
    quantity_used: int = Field(..., ge=1)
    sale_price_at_use: Decimal = Field(..., ge=0)


class WorkOrderPartUpdate(BaseModel):
    quantity_used: int | None = Field(None, ge=0)
    sale_price_at_use: Decimal | None = Field(None, ge=0)
