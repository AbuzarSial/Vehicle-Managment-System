import React, { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

const empty = {
  center_name: '',
  phone: '',
  city: '',
  address: '',
}

function validate(values) {
  const errors = {}
  const name = values.center_name?.trim() ?? ''
  if (!name) errors.center_name = 'Center name is required.'
  else if (name.length > 255) errors.center_name = 'Max 255 characters.'
  if ((values.phone?.trim() ?? '').length > 32) errors.phone = 'Max 32 characters.'
  if ((values.city?.trim() ?? '').length > 100) errors.city = 'Max 100 characters.'
  if ((values.address?.trim() ?? '').length > 512) errors.address = 'Max 512 characters.'
  return errors
}

export default function ServiceCenterForm({
  mode = 'create',
  initialCenter = null,
  submitting = false,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(empty)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (mode === 'edit' && initialCenter) {
      setValues({
        center_name: initialCenter.center_name ?? '',
        phone: initialCenter.phone ?? '',
        city: initialCenter.city ?? '',
        address: initialCenter.address ?? '',
      })
    } else {
      setValues(empty)
    }
    setFieldErrors({})
  }, [mode, initialCenter])

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
      center_name: values.center_name.trim(),
      phone: values.phone?.trim() ? values.phone.trim() : null,
      city: values.city?.trim() ? values.city.trim() : null,
      address: values.address?.trim() ? values.address.trim() : null,
    }
    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="sc_name">
          Center name <span className="text-red-500">*</span>
        </label>
        <Input
          id="sc_name"
          value={values.center_name}
          onChange={handleChange('center_name')}
          disabled={submitting}
          placeholder="e.g. Lahore Motor Clinic"
        />
        {fieldErrors.center_name ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.center_name}</p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="sc_phone">
            Phone
          </label>
          <Input
          id="sc_phone"
          type="tel"
          value={values.phone}
          onChange={handleChange('phone')}
          disabled={submitting}
          placeholder="+92 321 7654321"
        />
          {fieldErrors.phone ? <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="sc_city">
            City
          </label>
          <Input
          id="sc_city"
          value={values.city}
          onChange={handleChange('city')}
          disabled={submitting}
          placeholder="e.g. Lahore"
        />
          {fieldErrors.city ? <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p> : null}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="sc_addr">
          Address
        </label>
        <Input
          id="sc_addr"
          value={values.address}
          onChange={handleChange('address')}
          disabled={submitting}
          placeholder="e.g. Johar Town, Lahore"
        />
        {fieldErrors.address ? <p className="mt-1 text-xs text-red-600">{fieldErrors.address}</p> : null}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel ?? (mode === 'create' ? 'Add center' : 'Save')}
        </Button>
      </div>
    </form>
  )
}
