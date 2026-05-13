"""Pydantic schemas for mechanics."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MechanicCreate(BaseModel):
    center_id: int = Field(..., ge=1)
    mechanic_name: str = Field(..., min_length=1, max_length=255)
    specialization: str | None = Field(None, max_length=255)
    certification_level: str | None = Field(None, max_length=64)


class MechanicUpdate(BaseModel):
    center_id: int | None = Field(None, ge=1)
    mechanic_name: str | None = Field(None, min_length=1, max_length=255)
    specialization: str | None = Field(None, max_length=255)
    certification_level: str | None = Field(None, max_length=64)


class MechanicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    mechanic_id: int
    center_id: int
    mechanic_name: str
    specialization: str | None
    certification_level: str | None
    created_at: datetime
