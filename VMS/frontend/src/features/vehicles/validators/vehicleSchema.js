/** Client-side checks aligned with backend VehicleCreate / VehicleUpdate + subtypes. */

const MAX_REG = 64
const MAX_VIN = 64
const MAX_MAKE = 128
const MAX_MODEL = 128
const MIN_YEAR = 1900
const MAX_YEAR = 65535
const MAX_BODY = 64
const MAX_BIKE_TYPE = 64

export function validateVehicleForm(values) {
  const errors = {}

  const cid = values.customer_id
  if (cid === '' || cid === undefined || cid === null || Number(cid) < 1) {
    errors.customer_id = 'Select a customer who owns this vehicle.'
  }

  const reg = values.registration_no?.trim() ?? ''
  if (!reg) {
    errors.registration_no = 'Registration number is required.'
  } else if (reg.length > MAX_REG) {
    errors.registration_no = `At most ${MAX_REG} characters.`
  }

  const vin = values.vin?.trim() ?? ''
  if (!vin) {
    errors.vin = 'VIN is required.'
  } else if (vin.length > MAX_VIN) {
    errors.vin = `At most ${MAX_VIN} characters.`
  }

  const make = values.make?.trim() ?? ''
  if (make.length > MAX_MAKE) errors.make = `At most ${MAX_MAKE} characters.`

  const model = values.model?.trim() ?? ''
  if (model.length > MAX_MODEL) errors.model = `At most ${MAX_MODEL} characters.`

  const yearRaw = values.model_year
  if (yearRaw !== '' && yearRaw !== undefined && yearRaw !== null) {
    const y = Number(yearRaw)
    if (!Number.isInteger(y) || y < MIN_YEAR || y > MAX_YEAR) {
      errors.model_year = `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.`
    }
  }

  const sub = values.vehicle_subtype?.trim() ?? ''
  if (sub === 'car') {
    const doors = values.car_doors
    if (doors !== '' && doors !== undefined && doors !== null) {
      const d = Number(doors)
      if (!Number.isInteger(d) || d < 1 || d > 255) errors.car_doors = 'Doors must be 1–255.'
    }
    const bt = values.car_body_type?.trim() ?? ''
    if (bt.length > MAX_BODY) errors.car_body_type = `At most ${MAX_BODY} characters.`
  }
  if (sub === 'motorcycle') {
    const cc = values.moto_cc
    if (cc !== '' && cc !== undefined && cc !== null) {
      const n = Number(cc)
      if (!Number.isInteger(n) || n < 0) errors.moto_cc = 'Engine CC must be a non-negative integer.'
    }
    const bt = values.moto_bike_type?.trim() ?? ''
    if (bt.length > MAX_BIKE_TYPE) errors.moto_bike_type = `At most ${MAX_BIKE_TYPE} characters.`
  }
  if (sub === 'truck') {
    const cap = values.truck_capacity
    if (cap !== '' && cap !== undefined && cap !== null) {
      const n = Number(cap)
      if (Number.isNaN(n) || n < 0) errors.truck_capacity = 'Load capacity must be >= 0.'
    }
    const ax = values.truck_axles
    if (ax !== '' && ax !== undefined && ax !== null) {
      const n = Number(ax)
      if (!Number.isInteger(n) || n < 1 || n > 255) errors.truck_axles = 'Axle count must be 1–255.'
    }
  }

  return errors
}

function normalizeYear(raw) {
  if (raw === '' || raw === undefined || raw === null) return null
  const y = Number(raw)
  return Number.isInteger(y) ? y : null
}

function optionalInt(raw) {
  if (raw === '' || raw === undefined || raw === null) return null
  const n = Number(raw)
  return Number.isInteger(n) ? n : null
}

function optionalDecimal(raw) {
  if (raw === '' || raw === undefined || raw === null) return null
  const n = Number(raw)
  return Number.isNaN(n) ? null : n
}

function optionalTrimmed(raw, maxLen) {
  const s = raw?.trim() ?? ''
  if (!s) return null
  return maxLen ? s.slice(0, maxLen) : s
}

function subtypePayload(values) {
  const st = values.vehicle_subtype?.trim() ?? ''
  if (!st) return {}
  if (st === 'car') {
    return {
      subtype: 'car',
      car: {
        number_of_doors: optionalInt(values.car_doors),
        body_type: optionalTrimmed(values.car_body_type, MAX_BODY),
      },
    }
  }
  if (st === 'motorcycle') {
    return {
      subtype: 'motorcycle',
      motorcycle: {
        engine_cc: optionalInt(values.moto_cc),
        bike_type: optionalTrimmed(values.moto_bike_type, MAX_BIKE_TYPE),
      },
    }
  }
  if (st === 'truck') {
    return {
      subtype: 'truck',
      truck: {
        load_capacity: optionalDecimal(values.truck_capacity),
        axle_count: optionalInt(values.truck_axles),
      },
    }
  }
  return {}
}

export function toCreatePayload(values) {
  const base = {
    customer_id: Number(values.customer_id),
    registration_no: values.registration_no.trim(),
    vin: values.vin.trim(),
    make: values.make?.trim() ? values.make.trim() : null,
    model: values.model?.trim() ? values.model.trim() : null,
    model_year: normalizeYear(values.model_year),
  }
  return { ...base, ...subtypePayload(values) }
}

/** PATCH body: core fields only when provided; subtype always reflects form (including clear). */
export function toUpdatePayload(values) {
  const payload = {}
  if (values.customer_id !== undefined && values.customer_id !== '') {
    payload.customer_id = Number(values.customer_id)
  }
  if (values.registration_no !== undefined) {
    payload.registration_no = values.registration_no.trim()
  }
  if (values.vin !== undefined) {
    payload.vin = values.vin.trim()
  }
  if (values.make !== undefined) {
    payload.make = values.make?.trim() ? values.make.trim() : null
  }
  if (values.model !== undefined) {
    payload.model = values.model?.trim() ? values.model.trim() : null
  }
  if (values.model_year !== undefined) {
    payload.model_year = normalizeYear(values.model_year)
  }

  const st = values.vehicle_subtype?.trim() ?? ''
  if (!st) {
    payload.subtype = null
  } else {
    Object.assign(payload, subtypePayload(values))
  }

  return payload
}

export default { validateVehicleForm, toCreatePayload, toUpdatePayload }
