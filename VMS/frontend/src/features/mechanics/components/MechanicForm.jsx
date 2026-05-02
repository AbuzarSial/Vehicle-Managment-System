import React, { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

const empty = {
  center_id: '',
  mechanic_name: '',
  specialization: '',
  certification_level: '',
}

function validate(values) {
  const errors = {}
  const cid = values.center_id
  if (cid === '' || cid == null) errors.center_id = 'Service center is required.'
  else if (Number.isNaN(Number(cid)) || Number(cid) < 1) errors.center_id = 'Invalid center.'
  const name = values.mechanic_name?.trim() ?? ''
  if (!name) errors.mechanic_name = 'Mechanic name is required.'
  else if (name.length > 255) errors.mechanic_name = 'Max 255 characters.'
  if ((values.specialization?.trim() ?? '').length > 255) errors.specialization = 'Max 255 characters.'
  if ((values.certification_level?.trim() ?? '').length > 64) errors.certification_level = 'Max 64 characters.'
  return errors
}

export default function MechanicForm({
  mode = 'create',
  centers = [],
  initialMechanic = null,
  submitting = false,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(empty)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (mode === 'edit' && initialMechanic) {
      setValues({
        center_id: String(initialMechanic.center_id ?? ''),
        mechanic_name: initialMechanic.mechanic_name ?? '',
        specialization: initialMechanic.specialization ?? '',
        certification_level: initialMechanic.certification_level ?? '',
      })
    } else {
      setValues(empty)
    }
    setFieldErrors({})
  }, [mode, initialMechanic])

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
      center_id: Number(values.center_id),
      mechanic_name: values.mechanic_name.trim(),
      specialization: values.specialization?.trim() ? values.specialization.trim() : null,
      certification_level: values.certification_level?.trim() ? values.certification_level.trim() : null,
    }
    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="mech_center">
          Service center <span className="text-red-500">*</span>
        </label>
        <select
          id="mech_center"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60"
          value={values.center_id}
          onChange={handleChange('center_id')}
          disabled={submitting || centers.length === 0}
        >
          <option value="">Select a center…</option>
          {centers.map((c) => (
            <option key={c.center_id} value={String(c.center_id)}>
              {c.center_name}
            </option>
          ))}
        </select>
        {fieldErrors.center_id ? <p className="mt-1 text-xs text-red-600">{fieldErrors.center_id}</p> : null}
        {centers.length === 0 ? (
          <p className="mt-1 text-xs text-amber-700">Create a service center first.</p>
        ) : null}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="mech_name">
          Mechanic name <span className="text-red-500">*</span>
        </label>
        <Input id="mech_name" value={values.mechanic_name} onChange={handleChange('mechanic_name')} disabled={submitting} />
        {fieldErrors.mechanic_name ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.mechanic_name}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="mech_spec">
          Specialization
        </label>
        <Input id="mech_spec" value={values.specialization} onChange={handleChange('specialization')} disabled={submitting} />
        {fieldErrors.specialization ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.specialization}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="mech_cert">
          Certification level
        </label>
        <Input id="mech_cert" value={values.certification_level} onChange={handleChange('certification_level')} disabled={submitting} />
        {fieldErrors.certification_level ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.certification_level}</p>
        ) : null}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || centers.length === 0}>
          {submitting ? 'Saving…' : submitLabel ?? (mode === 'create' ? 'Add mechanic' : 'Save')}
        </Button>
      </div>
    </form>
  )
}
