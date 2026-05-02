import React, { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import {
  STATUS_OPTIONS,
  toCreatePayload,
  toUpdatePayload,
  validateServiceRequestForm,
} from '../validators/serviceRequestSchema'

function toDateInputValue(isoOrDate) {
  if (!isoOrDate) return ''
  const s = String(isoOrDate)
  return s.length >= 10 ? s.slice(0, 10) : s
}

const empty = {
  vehicle_id: '',
  center_id: '',
  request_date: '',
  request_type: '',
  problem_description: '',
  status: 'open',
}

export default function ServiceRequestForm({
  mode = 'create',
  initialRequest = null,
  vehicleOptions = [],
  centerOptions = [],
  lookupsLoading = false,
  submitLabel,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [values, setValues] = useState(empty)
  const [fieldErrors, setFieldErrors] = useState({})

  const sortedVehicles = useMemo(
    () =>
      [...vehicleOptions].sort((a, b) =>
        String(a.registration_no ?? '').localeCompare(String(b.registration_no ?? '')),
      ),
    [vehicleOptions],
  )

  const sortedCenters = useMemo(
    () =>
      [...centerOptions].sort((a, b) =>
        String(a.center_name ?? '').localeCompare(String(b.center_name ?? '')),
      ),
    [centerOptions],
  )

  useEffect(() => {
    if (mode === 'edit' && initialRequest) {
      setValues({
        vehicle_id: String(initialRequest.vehicle_id ?? ''),
        center_id: String(initialRequest.center_id ?? ''),
        request_date: toDateInputValue(initialRequest.request_date),
        request_type: initialRequest.request_type ?? '',
        problem_description: initialRequest.problem_description ?? '',
        status: initialRequest.status ?? 'open',
      })
    } else {
      setValues({
        ...empty,
        request_date: toDateInputValue(new Date().toISOString()),
      })
    }
    setFieldErrors({})
  }, [mode, initialRequest])

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
    const errs = validateServiceRequestForm(values)
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    const payload = mode === 'create' ? toCreatePayload(values) : toUpdatePayload(values)
    await onSubmit(payload)
  }

  const selectCls =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50'

  const taCls =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sr_vehicle_id" className="mb-1 block text-xs font-medium text-slate-600">
            Vehicle <span className="text-red-500">*</span>
          </label>
          <select
            id="sr_vehicle_id"
            className={selectCls}
            value={values.vehicle_id}
            onChange={handleChange('vehicle_id')}
            disabled={submitting || lookupsLoading}
            required
          >
            <option value="">{lookupsLoading ? 'Loading vehicles…' : 'Select vehicle…'}</option>
            {sortedVehicles.map((v) => (
              <option key={v.vehicle_id} value={v.vehicle_id}>
                {v.registration_no}
                {v.make || v.model ? ` — ${[v.make, v.model].filter(Boolean).join(' ')}` : ''}
              </option>
            ))}
          </select>
          {fieldErrors.vehicle_id ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.vehicle_id}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="sr_center_id" className="mb-1 block text-xs font-medium text-slate-600">
            Service center <span className="text-red-500">*</span>
          </label>
          <select
            id="sr_center_id"
            className={selectCls}
            value={values.center_id}
            onChange={handleChange('center_id')}
            disabled={submitting || lookupsLoading}
            required
          >
            <option value="">{lookupsLoading ? 'Loading centers…' : 'Select center…'}</option>
            {sortedCenters.map((c) => (
              <option key={c.center_id} value={c.center_id}>
                {c.center_name}
                {c.city ? ` (${c.city})` : ''}
              </option>
            ))}
          </select>
          {fieldErrors.center_id ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.center_id}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sr_request_date" className="mb-1 block text-xs font-medium text-slate-600">
            Request date <span className="text-red-500">*</span>
          </label>
          <Input
            id="sr_request_date"
            type="date"
            value={values.request_date}
            onChange={handleChange('request_date')}
            disabled={submitting}
          />
          {fieldErrors.request_date ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.request_date}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="sr_status" className="mb-1 block text-xs font-medium text-slate-600">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="sr_status"
            className={selectCls}
            value={values.status}
            onChange={handleChange('status')}
            disabled={submitting}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          {fieldErrors.status ? <p className="mt-1 text-xs text-red-600">{fieldErrors.status}</p> : null}
        </div>
      </div>

      <div>
        <label htmlFor="sr_request_type" className="mb-1 block text-xs font-medium text-slate-600">
          Request type
        </label>
        <Input
          id="sr_request_type"
          placeholder="e.g. maintenance, repair, diagnostic"
          value={values.request_type}
          onChange={handleChange('request_type')}
          disabled={submitting}
        />
        {fieldErrors.request_type ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.request_type}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="sr_problem" className="mb-1 block text-xs font-medium text-slate-600">
          Problem description
        </label>
        <textarea
          id="sr_problem"
          rows={4}
          className={taCls}
          placeholder="Symptoms, notes, or reason for visit"
          value={values.problem_description}
          onChange={handleChange('problem_description')}
          disabled={submitting}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || lookupsLoading}>
          {submitting ? 'Saving…' : submitLabel ?? (mode === 'create' ? 'Create request' : 'Save changes')}
        </Button>
      </div>
    </form>
  )
}
