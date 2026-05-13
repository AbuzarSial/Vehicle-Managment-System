import React, { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { toCreatePayload, toUpdatePayload, validateCustomerForm } from '../validators/customerSchema'

const empty = {
  customer_name: '',
  phone: '',
  email: '',
}

export default function CustomerForm({
  mode = 'create',
  initialCustomer = null,
  submitLabel,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [values, setValues] = useState(empty)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (mode === 'edit' && initialCustomer) {
      setValues({
        customer_name: initialCustomer.customer_name ?? '',
        phone: initialCustomer.phone ?? '',
        email: initialCustomer.email ?? '',
      })
    } else {
      setValues(empty)
    }
    setFieldErrors({})
  }, [mode, initialCustomer])

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
    const errs = validateCustomerForm(values)
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    const payload =
      mode === 'create' ? toCreatePayload(values) : toUpdatePayload(values)

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="customer_name" className="mb-1 block text-xs font-medium text-slate-600">
          Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="customer_name"
          value={values.customer_name}
          onChange={handleChange('customer_name')}
          disabled={submitting}
          autoComplete="name"
          placeholder="e.g. Muhammad Ali Khan"
        />
        {fieldErrors.customer_name ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.customer_name}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-xs font-medium text-slate-600">
          Phone
        </label>
        <Input
          id="phone"
          type="tel"
          value={values.phone}
          onChange={handleChange('phone')}
          disabled={submitting}
          autoComplete="tel"
          placeholder="+92 300 1234567"
        />
        {fieldErrors.phone ? <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p> : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-600">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={handleChange('email')}
          disabled={submitting}
          autoComplete="email"
          placeholder="ali.khan@example.pk"
        />
        {fieldErrors.email ? <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p> : null}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel ?? (mode === 'create' ? 'Create' : 'Save changes')}
        </Button>
      </div>
    </form>
  )
}
