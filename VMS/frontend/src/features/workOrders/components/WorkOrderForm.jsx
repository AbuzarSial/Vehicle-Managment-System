import React, { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

const empty = {
  inspection_id: '',
  open_date: '',
  close_date: '',
  status: 'open',
}

function validate(values) {
  const errors = {}
  const iid = values.inspection_id
  if (iid === '' || iid == null) errors.inspection_id = 'Inspection is required.'
  else if (Number.isNaN(Number(iid)) || Number(iid) < 1) errors.inspection_id = 'Invalid inspection.'
  if ((values.status?.trim() ?? '').length > 64) errors.status = 'Max 64 characters.'
  return errors
}

export const WORK_ORDER_STATUS_OPTIONS = ['open', 'in_progress', 'completed', 'cancelled']

export default function WorkOrderForm({
  mode = 'create',
  inspectionOptions = [],
  initialWorkOrder = null,
  submitting = false,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(empty)
  const [fieldErrors, setFieldErrors] = useState({})

  const selectClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60'

  useEffect(() => {
    if (mode === 'edit' && initialWorkOrder) {
      setValues({
        inspection_id: String(initialWorkOrder.inspection_id ?? ''),
        open_date: initialWorkOrder.open_date ?? '',
        close_date: initialWorkOrder.close_date ?? '',
        status: initialWorkOrder.status ?? 'open',
      })
    } else {
      setValues(empty)
    }
    setFieldErrors({})
  }, [mode, initialWorkOrder])

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

  const options = useMemo(() => inspectionOptions ?? [], [inspectionOptions])

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(values)
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    const payload = {
      inspection_id: Number(values.inspection_id),
      open_date: values.open_date?.trim() ? values.open_date.trim() : null,
      close_date: values.close_date?.trim() ? values.close_date.trim() : null,
      status: values.status?.trim() || 'open',
    }
    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="wo_insp">
          Inspection <span className="text-red-500">*</span>
        </label>
        <select
          id="wo_insp"
          className={selectClass}
          value={values.inspection_id}
          onChange={handleChange('inspection_id')}
          disabled={submitting || options.length === 0}
        >
          <option value="">Select inspection…</option>
          {options.map((opt) => (
            <option key={opt.inspection_id} value={String(opt.inspection_id)}>
              {opt._label ?? `Inspection #${opt.inspection_id}`}
            </option>
          ))}
        </select>
        {fieldErrors.inspection_id ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.inspection_id}</p>
        ) : null}
        {options.length === 0 ? (
          <p className="mt-1 text-xs text-amber-700">
            No eligible inspections (each inspection allows at most one work order).
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="wo_open">
            Open date
          </label>
          <Input id="wo_open" type="date" value={values.open_date} onChange={handleChange('open_date')} disabled={submitting} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="wo_close">
            Close date
          </label>
          <Input id="wo_close" type="date" value={values.close_date} onChange={handleChange('close_date')} disabled={submitting} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="wo_status">
          Status
        </label>
        <select
          id="wo_status"
          className={selectClass}
          value={values.status}
          onChange={handleChange('status')}
          disabled={submitting}
        >
          {WORK_ORDER_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {fieldErrors.status ? <p className="mt-1 text-xs text-red-600">{fieldErrors.status}</p> : null}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || options.length === 0}>
          {submitting ? 'Saving…' : submitLabel ?? (mode === 'create' ? 'Create work order' : 'Save header')}
        </Button>
      </div>
    </form>
  )
}
