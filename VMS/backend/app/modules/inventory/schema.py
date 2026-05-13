"""Schemas for service center inventory and low-stock reporting."""

from pydantic import BaseModel, Field


class InventoryCreate(BaseModel):
    center_id: int = Field(..., ge=1)
    part_id: int = Field(..., ge=1)
    quantity_on_hand: int = Field(default=0, ge=0)
    reorder_level: int = Field(default=0, ge=0)
    shelf_location: str | None = Field(None, max_length=128)


class InventoryUpdate(BaseModel):
    quantity_on_hand: int | None = Field(None, ge=0)
    reorder_level: int | None = Field(None, ge=0)
    shelf_location: str | None = Field(None, max_length=128)


class InventoryRowResponse(BaseModel):
    """One stocked SKU at a center with resolved labels."""

    center_id: int
    center_name: str
    part_id: int
    part_name: str
    brand: str | None
    quantity_on_hand: int
    reorder_level: int
    shelf_location: str | None
    is_low_stock: bool
