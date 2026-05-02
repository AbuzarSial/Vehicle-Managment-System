import React, { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { toCreatePayload, toUpdatePayload, validateVehicleForm } from '../validators/vehicleSchema'

const empty = {
  customer_id: '',
  registration_no: '',
  vin: '',
  make: '',
  model: '',
  model_year: '',
  vehicle_subtype: '',
  car_doors: '',
  car_body_type: '',
  moto_cc: '',
  moto_bike_type: '',
  truck_capacity: '',
  truck_axles: '',
}

function populateFromVehicle(v) {
  const st = v.vehicle_type ?? ''
  return {
    customer_id: String(v.customer_id ?? ''),
    registration_no: v.registration_no ?? '',
    vin: v.vin ?? '',
    make: v.make ?? '',
    model: v.model ?? '',
    model_year: v.model_year !== null && v.model_year !== undefined ? String(v.model_year) : '',
    vehicle_subtype: st,
    car_doors:
      v.car?.number_of_doors !== null && v.car?.number_of_doors !== undefined
        ? String(v.car.number_of_doors)
        : '',
    car_body_type: v.car?.body_type ?? '',
    moto_cc: v.motorcycle?.engine_cc != null ? String(v.motorcycle.engine_cc) : '',
    moto_bike_type: v.motorcycle?.bike_type ?? '',
    truck_capacity: v.truck?.load_capacity != null ? String(v.truck.load_capacity) : '',
    truck_axles:
      v.truck?.axle_count !== null && v.truck?.axle_count !== undefined
        ? String(v.truck.axle_count)
        : '',
  }
}

export default function VehicleForm({
  mode = 'create',
  initialVehicle = null,
  customerOptions = [],
  customersLoading = false,
  submitLabel,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [values, setValues] = useState(empty)
  const [fieldErrors, setFieldErrors] = useState({})

  const sortedCustomers = useMemo(
    () =>
      [...customerOptions].sort((a, b) =>
        (a.customer_name ?? '').localeCompare(b.customer_name ?? ''),
      ),
    [customerOptions],
  )

  useEffect(() => {
    if (mode === 'edit' && initialVehicle) {
      setValues(populateFromVehicle(initialVehicle))
    } else {
      setValues(empty)
    }
    setFieldErrors({})
  }, [mode, initialVehicle])

  function handleChange(field) {
    return (e) => {
      const v = e.target.value
      setValues((prev) => ({ ...prev, [field]: v }))
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validateVehicleForm(values)
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    const payload = mode === 'create' ? toCreatePayload(values) : toUpdatePayload(values)
    await onSubmit(payload)
  }

  const sub = values.vehicle_subtype
  const selectClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="vehicle_customer_id" className="mb-1 block text-xs font-medium text-slate-600">
          Owner (customer) <span className="text-red-500">*</span>
        </label>
        <select
          id="vehicle_customer_id"
          className={selectClass}
          value={values.customer_id}
          onChange={handleChange('customer_id')}
          disabled={submitting || customersLoading}
          required
        >
          <option value="">{customersLoading ? 'Loading customers…' : 'Select customer…'}</option>
          {sortedCustomers.map((c) => (
            <option key={c.customer_id} value={c.customer_id}>
              {c.customer_name}
              {c.email ? ` (${c.email})` : ''}
            </option>
          ))}
        </select>
        {fieldErrors.customer_id ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.customer_id}</p>
        ) : (
          <p className="mt-1 text-xs text-slate-500">Links this row to customers.customer_id in the API.</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="registration_no" className="mb-1 block text-xs font-medium text-slate-600">
            Registration <span className="text-red-500">*</span>
          </label>
          <Input
            id="registration_no"
            value={values.registration_no}
            onChange={handleChange('registration_no')}
            disabled={submitting}
            autoComplete="off"
            placeholder="e.g. LEA-23-1456"
          />
          {fieldErrors.registration_no ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.registration_no}</p>
          ) : null}
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="vin" className="mb-1 block text-xs font-medium text-slate-600">
            VIN <span className="text-red-500">*</span>
          </label>
          <Input id="vin" value={values.vin} onChange={handleChange('vin')} disabled={submitting} autoComplete="off" />
          {fieldErrors.vin ? <p className="mt-1 text-xs text-red-600">{fieldErrors.vin}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="make" className="mb-1 block text-xs font-medium text-slate-600">
            Make
          </label>
          <Input
            id="make"
            value={values.make}
            onChange={handleChange('make')}
            disabled={submitting}
            placeholder="e.g. Toyota"
          />
          {fieldErrors.make ? <p className="mt-1 text-xs text-red-600">{fieldErrors.make}</p> : null}
        </div>
        <div>
          <label htmlFor="model" className="mb-1 block text-xs font-medium text-slate-600">
            Model
          </label>
          <Input
            id="model"
            value={values.model}
            onChange={handleChange('model')}
            disabled={submitting}
            placeholder="e.g. Corolla"
          />
          {fieldErrors.model ? <p className="mt-1 text-xs text-red-600">{fieldErrors.model}</p> : null}
        </div>
        <div>
          <label htmlFor="model_year" className="mb-1 block text-xs font-medium text-slate-600">
            Year
          </label>
          <Input
            id="model_year"
            type="number"
            min={1900}
            max={65535}
            placeholder="Optional"
            value={values.model_year}
            onChange={handleChange('model_year')}
            disabled={submitting}
          />
          {fieldErrors.model_year ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.model_year}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Vehicle subtype</h3>
        <p className="mb-3 text-xs text-slate-500">
          Optional specialization stored in <code className="rounded bg-slate-100 px-1">cars</code>,{' '}
          <code className="rounded bg-slate-100 px-1">motorcycles</code>, or{' '}
          <code className="rounded bg-slate-100 px-1">trucks</code> (1:1 with{' '}
          <code className="rounded bg-slate-100 px-1">vehicles</code>).
        </p>

        <div className="mb-4">
          <label htmlFor="vehicle_subtype" className="mb-1 block text-xs font-medium text-slate-600">
            Type
          </label>
          <select
            id="vehicle_subtype"
            className={selectClass}
            value={values.vehicle_subtype}
            onChange={handleChange('vehicle_subtype')}
            disabled={submitting}
          >
            <option value="">General (no subtype row)</option>
            <option value="car">Car</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="truck">Truck</option>
          </select>
        </div>

        {sub === 'car' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="car_doors">
                Number of doors
              </label>
              <Input
                id="car_doors"
                type="number"
                min={1}
                max={255}
                placeholder="Optional"
                value={values.car_doors}
                onChange={handleChange('car_doors')}
                disabled={submitting}
              />
              {fieldErrors.car_doors ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.car_doors}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="car_body_type">
                Body type
              </label>
              <Input
                id="car_body_type"
                placeholder="e.g. sedan, SUV"
                value={values.car_body_type}
                onChange={handleChange('car_body_type')}
                disabled={submitting}
              />
              {fieldErrors.car_body_type ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.car_body_type}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {sub === 'motorcycle' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="moto_cc">
                Engine (cc)
              </label>
              <Input
                id="moto_cc"
                type="number"
                min={0}
                placeholder="Optional"
                value={values.moto_cc}
                onChange={handleChange('moto_cc')}
                disabled={submitting}
              />
              {fieldErrors.moto_cc ? <p className="mt-1 text-xs text-red-600">{fieldErrors.moto_cc}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="moto_bike_type">
                Bike type
              </label>
              <Input
                id="moto_bike_type"
                placeholder="e.g. sport, cruiser"
                value={values.moto_bike_type}
                onChange={handleChange('moto_bike_type')}
                disabled={submitting}
              />
              {fieldErrors.moto_bike_type ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.moto_bike_type}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {sub === 'truck' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="truck_capacity">
                Load capacity
              </label>
              <Input
                id="truck_capacity"
                type="number"
                step="0.01"
                min={0}
                placeholder="Optional"
                value={values.truck_capacity}
                onChange={handleChange('truck_capacity')}
                disabled={submitting}
              />
              {fieldErrors.truck_capacity ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.truck_capacity}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="truck_axles">
                Axle count
              </label>
              <Input
                id="truck_axles"
                type="number"
                min={1}
                max={255}
                placeholder="Optional"
                value={values.truck_axles}
                onChange={handleChange('truck_axles')}
                disabled={submitting}
              />
              {fieldErrors.truck_axles ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.truck_axles}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || customersLoading}>
          {submitting ? 'Saving…' : submitLabel ?? (mode === 'create' ? 'Add vehicle' : 'Save changes')}
        </Button>
      </div>
    </form>
  )
}
