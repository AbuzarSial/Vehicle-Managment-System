import React, { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

const empty = {
  part_name: '',
  brand: '',
  unit_price: '0',
}

function validate(values) {
  const errors = {}
  const name = values.part_name?.trim() ?? ''
  if (!name) errors.part_name = 'Part name is required.'
  else if (name.length > 255) errors.part_name = 'Max 255 characters.'
  if ((values.brand?.trim() ?? '').length > 128) errors.brand = 'Max 128 characters.'
  const p = Number(values.unit_price)
  if (Number.isNaN(p) || p < 0) errors.unit_price = 'Unit price must be >= 0.'
  return errors
}

export default function SparePartForm({
  mode = 'create',
  initialPart = null,
  submitting = false,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(empty)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (mode === 'edit' && initialPart) {
      setValues({
        part_name: initialPart.part_name ?? '',
        brand: initialPart.brand ?? '',
        unit_price: String(initialPart.unit_price ?? '0'),
      })
    } else {
      setValues(empty)
    }
    setFieldErrors({})
  }, [mode, initialPart])

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
    await onSubmit({
      part_name: values.part_name.trim(),
      brand: values.brand?.trim() ? values.brand.trim() : null,
      unit_price: Number(values.unit_price),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="pt_name">
          Part name <span className="text-red-500">*</span>
        </label>
        <Input id="pt_name" value={values.part_name} onChange={handleChange('part_name')} disabled={submitting} />
        {fieldErrors.part_name ? <p className="mt-1 text-xs text-red-600">{fieldErrors.part_name}</p> : null}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="pt_brand">
          Brand
        </label>
        <Input id="pt_brand" value={values.brand} onChange={handleChange('brand')} disabled={submitting} />
        {fieldErrors.brand ? <p className="mt-1 text-xs text-red-600">{fieldErrors.brand}</p> : null}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="pt_price">
          Unit price (PKR)
        </label>
        <Input id="pt_price" type="number" step="0.01" min="0" value={values.unit_price} onChange={handleChange('unit_price')} disabled={submitting} />
        {fieldErrors.unit_price ? <p className="mt-1 text-xs text-red-600">{fieldErrors.unit_price}</p> : null}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : mode === 'create' ? 'Add part' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
