"""Business logic for vehicle CRUD including subtype rows."""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..customers.model import Customer
from .model import Vehicle
from .schema import CarSubtype, MotorcycleSubtype, TruckSubtype, VehicleCreate, VehicleResponse, VehicleUpdate
from .subtypes.models import Car, Motorcycle, Truck


def _delete_all_subtypes(db: Session, vehicle_id: int) -> None:
    for Model in (Car, Motorcycle, Truck):
        row = db.get(Model, vehicle_id)
        if row is not None:
            db.delete(row)
    db.flush()


def _set_subtype(
    db: Session,
    vehicle_id: int,
    subtype: str,
    car: CarSubtype | None,
    motorcycle: MotorcycleSubtype | None,
    truck: TruckSubtype | None,
) -> None:
    _delete_all_subtypes(db, vehicle_id)
    if subtype == "car":
        d = car.model_dump() if car else {}
        db.add(
            Car(
                vehicle_id=vehicle_id,
                number_of_doors=d.get("number_of_doors"),
                body_type=d.get("body_type"),
            ),
        )
    elif subtype == "motorcycle":
        d = motorcycle.model_dump() if motorcycle else {}
        db.add(
            Motorcycle(
                vehicle_id=vehicle_id,
                engine_cc=d.get("engine_cc"),
                bike_type=d.get("bike_type"),
            ),
        )
    elif subtype == "truck":
        d = truck.model_dump() if truck else {}
        db.add(
            Truck(
                vehicle_id=vehicle_id,
                load_capacity=d.get("load_capacity"),
                axle_count=d.get("axle_count"),
            ),
        )


def _make_vehicle_response(
    v: Vehicle,
    car: Car | None,
    moto: Motorcycle | None,
    trk: Truck | None,
) -> VehicleResponse:
    vt = None
    cd = md = td = None
    if car is not None:
        vt = "car"
        cd = CarSubtype.model_validate(car)
    elif moto is not None:
        vt = "motorcycle"
        md = MotorcycleSubtype.model_validate(moto)
    elif trk is not None:
        vt = "truck"
        td = TruckSubtype.model_validate(trk)
    base = VehicleResponse.model_validate(v)
    return base.model_copy(update={"vehicle_type": vt, "car": cd, "motorcycle": md, "truck": td})


def vehicle_response(db: Session, v: Vehicle) -> VehicleResponse:
    car = db.get(Car, v.vehicle_id)
    moto = db.get(Motorcycle, v.vehicle_id)
    trk = db.get(Truck, v.vehicle_id)
    return _make_vehicle_response(v, car, moto, trk)


def list_vehicles(
    db: Session,
    *,
    customer_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[VehicleResponse]:
    stmt = select(Vehicle).order_by(Vehicle.vehicle_id)
    if customer_id is not None:
        stmt = stmt.where(Vehicle.customer_id == customer_id)
    stmt = stmt.offset(skip).limit(limit)
    vehicles = list(db.scalars(stmt).all())
    if not vehicles:
        return []

    ids = [x.vehicle_id for x in vehicles]
    cars_m = {r.vehicle_id: r for r in db.scalars(select(Car).where(Car.vehicle_id.in_(ids))).all()}
    motos_m = {r.vehicle_id: r for r in db.scalars(select(Motorcycle).where(Motorcycle.vehicle_id.in_(ids))).all()}
    trks_m = {r.vehicle_id: r for r in db.scalars(select(Truck).where(Truck.vehicle_id.in_(ids))).all()}

    return [
        _make_vehicle_response(v, cars_m.get(v.vehicle_id), motos_m.get(v.vehicle_id), trks_m.get(v.vehicle_id))
        for v in vehicles
    ]


def get_vehicle(db: Session, vehicle_id: int) -> VehicleResponse | None:
    row = db.get(Vehicle, vehicle_id)
    if row is None:
        return None
    return vehicle_response(db, row)


def create_vehicle(db: Session, data: VehicleCreate) -> VehicleResponse:
    if db.get(Customer, data.customer_id) is None:
        raise LookupError("customer not found")

    row = Vehicle(
        customer_id=data.customer_id,
        registration_no=data.registration_no,
        vin=data.vin,
        make=data.make,
        model=data.model,
        model_year=data.model_year,
    )
    db.add(row)
    try:
        db.flush()
        if data.subtype:
            _set_subtype(db, row.vehicle_id, data.subtype, data.car, data.motorcycle, data.truck)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return vehicle_response(db, row)


def update_vehicle(db: Session, vehicle_id: int, data: VehicleUpdate) -> VehicleResponse | None:
    row = db.get(Vehicle, vehicle_id)
    if row is None:
        return None

    payload = data.model_dump(exclude_unset=True)
    for key in ("subtype", "car", "motorcycle", "truck"):
        payload.pop(key, None)

    if "customer_id" in payload:
        cid = payload["customer_id"]
        if db.get(Customer, cid) is None:
            raise LookupError("customer not found")

    for key, value in payload.items():
        setattr(row, key, value)

    try:
        if "subtype" in data.model_fields_set:
            if data.subtype is None:
                _delete_all_subtypes(db, vehicle_id)
            else:
                _set_subtype(
                    db,
                    vehicle_id,
                    data.subtype,
                    data.car,
                    data.motorcycle,
                    data.truck,
                )
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(row)
    return vehicle_response(db, row)


def delete_vehicle(db: Session, vehicle_id: int) -> bool:
    row = db.get(Vehicle, vehicle_id)
    if row is None:
        return False
    db.delete(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    return True
