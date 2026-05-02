"""Pydantic schemas for bills."""

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class BillCreate(BaseModel):
    work_order_id: int = Field(..., ge=1)
    bill_date: date
    total_amount: Decimal = Field(default=Decimal("0"), ge=0)
    payment_status: str = Field(default="unpaid", max_length=64)

    @field_validator("payment_status")
    @classmethod
    def normalize_payment_status(cls, v: str) -> str:
        s = (v or "").strip().lower()
        if not s:
            return "unpaid"
        if len(s) > 64:
            raise ValueError("payment_status too long")
        return s


class BillUpdate(BaseModel):
    work_order_id: int | None = Field(None, ge=1)
    bill_date: date | None = None
    total_amount: Decimal | None = Field(None, ge=0)
    payment_status: str | None = Field(None, max_length=64)

    @field_validator("payment_status")
    @classmethod
    def normalize_payment_status(cls, v: str | None) -> str | None:
        if v is None:
            return None
        s = v.strip().lower()
        if len(s) > 64:
            raise ValueError("payment_status too long")
        return s


class BillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    bill_id: int
    work_order_id: int
    bill_date: date
    total_amount: Decimal
    payment_status: str
    created_at: datetime
