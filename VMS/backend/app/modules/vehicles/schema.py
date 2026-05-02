"""Pydantic schemas for vehicle API — supertype + optional subtype payloads."""

from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

VehicleSubtypeName = Literal["car", "motorcycle", "truck"]


class CarSubtype(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    number_of_doors: int | None = Field(None, ge=1, le=255)
    body_type: str | None = Field(None, max_length=64)


class MotorcycleSubtype(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    engine_cc: int | None = Field(None, ge=0, le=2_147_483_647)
    bike_type: str | None = Field(None, max_length=64)


class TruckSubtype(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    load_capacity: Decimal | None = Field(None, ge=0)
    axle_count: int | None = Field(None, ge=1, le=255)


class VehicleCreate(BaseModel):
    customer_id: int = Field(..., ge=1)
    registration_no: str = Field(..., min_length=1, max_length=64)
    vin: str = Field(..., min_length=1, max_length=64)
    make: str | None = Field(None, max_length=128)
    model: str | None = Field(None, max_length=128)
    model_year: int | None = Field(None, ge=1900, le=65535)

    subtype: VehicleSubtypeName | None = None
    car: CarSubtype | None = None
    motorcycle: MotorcycleSubtype | None = None
    truck: TruckSubtype | None = None

    @model_validator(mode="after")
    def subtype_payloads_match_discriminator(self):
        if self.subtype is None:
            if self.car or self.motorcycle or self.truck:
                raise ValueError("subtype must be set when sending car, motorcycle, or truck details")
            return self
        if self.subtype == "car":
            if self.motorcycle or self.truck:
                raise ValueError("Only car details allowed when subtype is car")
        elif self.subtype == "motorcycle":
            if self.car or self.truck:
                raise ValueError("Only motorcycle details allowed when subtype is motorcycle")
        elif self.subtype == "truck":
            if self.car or self.motorcycle:
                raise ValueError("Only truck details allowed when subtype is truck")
        return self


class VehicleUpdate(BaseModel):
    customer_id: int | None = Field(None, ge=1)
    registration_no: str | None = Field(None, min_length=1, max_length=64)
    vin: str | None = Field(None, min_length=1, max_length=64)
    make: str | None = Field(None, max_length=128)
    model: str | None = Field(None, max_length=128)
    model_year: int | None = Field(None, ge=1900, le=65535)

    subtype: VehicleSubtypeName | None = None
    car: CarSubtype | None = None
    motorcycle: MotorcycleSubtype | None = None
    truck: TruckSubtype | None = None

    @model_validator(mode="after")
    def subtype_payloads_match_discriminator(self):
        if self.subtype is None:
            if any(k in self.model_fields_set for k in ("car", "motorcycle", "truck")):
                raise ValueError(
                    "Do not send car, motorcycle, or truck payloads when clearing subtype (subtype: null)",
                )
            return self
        if self.subtype == "car":
            if self.motorcycle or self.truck:
                raise ValueError("Only car details allowed when subtype is car")
        elif self.subtype == "motorcycle":
            if self.car or self.truck:
                raise ValueError("Only motorcycle details allowed when subtype is motorcycle")
        elif self.subtype == "truck":
            if self.car or self.motorcycle:
                raise ValueError("Only truck details allowed when subtype is truck")
        return self


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vehicle_id: int
    customer_id: int
    registration_no: str
    vin: str
    make: str | None
    model: str | None
    model_year: int | None
    created_at: datetime

    vehicle_type: VehicleSubtypeName | None = None
    car: CarSubtype | None = None
    motorcycle: MotorcycleSubtype | None = None
    truck: TruckSubtype | None = None
