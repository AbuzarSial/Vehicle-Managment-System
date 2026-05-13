import React, { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { PAYMENT_STATUS_OPTIONS } from '../lib/paymentStatusDisplay'

const empty = {
  work_order_id: '',
  bill_date: '',
  total_amount: '0',
  payment_status: 'unpaid',
}

const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60'

function validate(values) {
  const errors = {}
  const wo = values.work_order_id
  if (wo === '' || wo == null) errors.work_order_id = 'Work order is required.'
  else if (Number.isNaN(Number(wo)) || Number(wo) < 1) errors.work_order_id = 'Invalid work order.'
  if (!values.bill_date?.trim()) errors.bill_date = 'Bill date is required.'
  const amt = Number(values.total_amount)
  if (Number.isNaN(amt) || amt < 0) errors.total_amount = 'Amount must be >= 0.'
  if ((values.payment_status?.trim() ?? '').length > 64) errors.payment_status = 'Max 64 characters.'
  return errors
}

export default function BillForm({
  mode = 'create',
  workOrderOptions = [],
  initialBill = null,
  submitting = false,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(empty)
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (mode === 'edit' && initialBill) {
      setValues({
        work_order_id: String(initialBill.work_order_id ?? ''),
        bill_date: initialBill.bill_date ?? '',
        total_amount: String(initialBill.total_amount ?? '0'),
        payment_status: (initialBill.payment_status ?? 'unpaid').toLowerCase(),
      })
    } else {
      setValues(empty)
    }
    setFieldErrors({})
  }, [mode, initialBill])

  const woChoices = useMemo(() => workOrderOptions ?? [], [workOrderOptions])

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

    const payment_status = (values.payment_status || 'unpaid').trim().toLowerCase()
    if (mode === 'edit') {
      await onSubmit({
        bill_date: values.bill_date.trim(),
        total_amount: Number(values.total_amount),
        payment_status,
      })
    } else {
      await onSubmit({
        work_order_id: Number(values.work_order_id),
        bill_date: values.bill_date.trim(),
        total_amount: Number(values.total_amount),
        payment_status,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="bill_wo">
          Work order <span className="text-red-500">*</span>
        </label>
        <select
          id="bill_wo"
          className={selectClass}
          value={values.work_order_id}
          onChange={handleChange('work_order_id')}
          disabled={submitting || woChoices.length === 0 || mode === 'edit'}
        >
          <option value="">Select work order…</option>
          {woChoices.map((wo) => (
            <option key={wo.work_order_id} value={String(wo.work_order_id)}>
              {wo._label ?? `WO #${wo.work_order_id}`}
            </option>
          ))}
        </select>
        {fieldErrors.work_order_id ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.work_order_id}</p>
        ) : null}
        {woChoices.length === 0 ? (
          <p className="mt-1 text-xs text-amber-700">No eligible work orders for this action.</p>
        ) : null}
        {mode === 'edit' ? (
          <p className="mt-1 text-xs text-slate-500">Work order is fixed after billing (1:1); create a new bill on another WO if needed.</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="bill_date">
          Bill date <span className="text-red-500">*</span>
        </label>
        <Input id="bill_date" type="date" value={values.bill_date} onChange={handleChange('bill_date')} disabled={submitting} />
        {fieldErrors.bill_date ? <p className="mt-1 text-xs text-red-600">{fieldErrors.bill_date}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="bill_amt">
          Total amount (PKR)
        </label>
        <Input
          id="bill_amt"
          type="number"
          step="0.01"
          min="0"
          value={values.total_amount}
          onChange={handleChange('total_amount')}
          disabled={submitting}
        />
        {fieldErrors.total_amount ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.total_amount}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="bill_pay">
          Payment status
        </label>
        <select
          id="bill_pay"
          className={selectClass}
          value={values.payment_status}
          onChange={handleChange('payment_status')}
          disabled={submitting}
        >
          {PAYMENT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {fieldErrors.payment_status ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.payment_status}</p>
        ) : null}
        <p className="mt-1 text-xs text-slate-500">
          Typical settlement methods in Pakistan: Cash, Bank Transfer, JazzCash, Easypaisa — track details in your own records alongside payment status here.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || woChoices.length === 0}>
          {submitting ? 'Saving…' : mode === 'create' ? 'Create bill' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
