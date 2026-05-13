import React, { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

const empty = {
  request_id: '',
  mechanic_id: '',
  inspection_date: '',
  findings: '',
  result: '',
}

function validate(values) {
  const errors = {}
  const rid = values.request_id
  if (rid === '' || rid == null) errors.request_id = 'Service request is required.'
  else if (Number.isNaN(Number(rid)) || Number(rid) < 1) errors.request_id = 'Invalid request.'

  const mid = values.mechanic_id
  if (mid !== '' && mid != null) {
    if (Number.isNaN(Number(mid)) || Number(mid) < 1) errors.mechanic_id = 'Invalid mechanic.'
  }

  const res = values.result?.trim() ?? ''
  if (res.length > 128) errors.result = 'Max 128 characters.'
  return errors
}

export default function InspectionForm({
  mode = 'create',
  serviceRequests = [],
  mechanics = [],
  initialInspection = null,
  submitting = false,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(empty)
  const [fieldErrors, setFieldErrors] = useState({})

  const selectClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60'

  const requestOptions = useMemo(() => serviceRequests ?? [], [serviceRequests])

  useEffect(() => {
    if (mode === 'edit' && initialInspection) {
      setValues({
        request_id: String(initialInspection.request_id ?? ''),
        mechanic_id:
          initialInspection.mechanic_id != null ? String(initialInspection.mechanic_id) : '',
        inspection_date: initialInspection.inspection_date ?? '',
        findings: initialInspection.findings ?? '',
        result: initialInspection.result ?? '',
      })
    } else {
      setValues(empty)
    }
    setFieldErrors({})
  }, [mode, initialInspection])

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
    const errs = validate(values)
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    const payload = {
      request_id: Number(values.request_id),
      inspection_date: values.inspection_date?.trim() ? values.inspection_date.trim() : null,
      findings: values.findings?.trim() ? values.findings.trim() : null,
      result: values.result?.trim() ? values.result.trim() : null,
    }
    if (values.mechanic_id !== '' && values.mechanic_id != null) {
      payload.mechanic_id = Number(values.mechanic_id)
    } else {
      payload.mechanic_id = null
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="insp_req">
          Service request <span className="text-red-500">*</span>
        </label>
        <select
          id="insp_req"
          className={selectClass}
          value={values.request_id}
          onChange={handleChange('request_id')}
          disabled={submitting || requestOptions.length === 0}
        >
          <option value="">Select a request…</option>
          {requestOptions.map((r) => (
            <option key={r.request_id} value={String(r.request_id)}>
              #{r.request_id}
              {r._label ? ` — ${r._label}` : ''}
            </option>
          ))}
        </select>
        {fieldErrors.request_id ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.request_id}</p>
        ) : null}
        {requestOptions.length === 0 ? (
          <p className="mt-1 text-xs text-amber-700">No eligible requests (each request allows at most one inspection).</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="insp_mech">
          Mechanic
        </label>
        <select
          id="insp_mech"
          className={selectClass}
          value={values.mechanic_id}
          onChange={handleChange('mechanic_id')}
          disabled={submitting}
        >
          <option value="">Unassigned</option>
          {mechanics.map((m) => (
            <option key={m.mechanic_id} value={String(m.mechanic_id)}>
              {m.mechanic_name}
            </option>
          ))}
        </select>
        {fieldErrors.mechanic_id ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.mechanic_id}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="insp_date">
          Inspection date
        </label>
        <Input
          id="insp_date"
          type="date"
          value={values.inspection_date}
          onChange={handleChange('inspection_date')}
          disabled={submitting}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="insp_result">
          Result
        </label>
        <Input
          id="insp_result"
          placeholder="e.g. passed, repair_needed"
          maxLength={128}
          value={values.result}
          onChange={handleChange('result')}
          disabled={submitting}
        />
        {fieldErrors.result ? <p className="mt-1 text-xs text-red-600">{fieldErrors.result}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="insp_findings">
          Findings
        </label>
        <textarea
          id="insp_findings"
          rows={4}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
          value={values.findings}
          onChange={handleChange('findings')}
          disabled={submitting}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || requestOptions.length === 0}>
          {submitting ? 'Saving…' : submitLabel ?? (mode === 'create' ? 'Create inspection' : 'Save')}
        </Button>
      </div>
    </form>
  )
}
