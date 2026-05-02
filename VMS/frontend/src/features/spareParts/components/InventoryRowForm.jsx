import React, { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60'

function validate(values, mode) {
  const errors = {}
  const q = Number(values.quantity_on_hand)
  const r = Number(values.reorder_level)
  if (Number.isNaN(q) || q < 0) errors.quantity_on_hand = 'Must be >= 0.'
  if (Number.isNaN(r) || r < 0) errors.reorder_level = 'Must be >= 0.'
  if ((values.shelf_location?.trim() ?? '').length > 128) errors.shelf_location = 'Max 128 characters.'
  if (mode === 'create') {
    if (!values.part_id) errors.part_id = 'Select a part.'
  }
  return errors
}

/** Add stock row at a center, or edit qty/reorder/shelf for an existing row. */
export default function InventoryRowForm({
  mode = 'create',
  centerId,
  partCatalog = [],
  existingPartIds = new Set(),
  initialRow = null,
  submitting = false,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState({
    part_id: '',
    quantity_on_hand: '0',
    reorder_level: '0',
    shelf_location: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})

  const partOptions = useMemo(() => {
    if (mode === 'edit') return []
    return partCatalog.filter((p) => !existingPartIds.has(p.part_id))
  }, [mode, partCatalog, existingPartIds])

  useEffect(() => {
    if (mode === 'edit' && initialRow) {
      setValues({
        part_id: String(initialRow.part_id),
        quantity_on_hand: String(initialRow.quantity_on_hand ?? 0),
        reorder_level: String(initialRow.reorder_level ?? 0),
        shelf_location: initialRow.shelf_location ?? '',
      })
    } else {
      setValues({
        part_id: '',
        quantity_on_hand: '0',
        reorder_level: '0',
        shelf_location: '',
      })
    }
    setFieldErrors({})
  }, [mode, initialRow])

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
    const errs = validate(values, mode)
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    if (mode === 'create') {
      await onSubmit({
        center_id: centerId,
        part_id: Number(values.part_id),
        quantity_on_hand: Number(values.quantity_on_hand),
        reorder_level: Number(values.reorder_level),
        shelf_location: values.shelf_location?.trim() ? values.shelf_location.trim() : null,
      })
    } else {
      await onSubmit({
        quantity_on_hand: Number(values.quantity_on_hand),
        reorder_level: Number(values.reorder_level),
        shelf_location: values.shelf_location?.trim() ? values.shelf_location.trim() : null,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'create' ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="inv_part">
            Part <span className="text-red-500">*</span>
          </label>
          <select
            id="inv_part"
            className={selectClass}
            value={values.part_id}
            onChange={handleChange('part_id')}
            disabled={submitting || partOptions.length === 0}
          >
            <option value="">{partOptions.length === 0 ? 'All parts stocked at this center' : 'Select part…'}</option>
            {partOptions.map((p) => (
              <option key={p.part_id} value={String(p.part_id)}>
                {p.part_name}
                {p.brand ? ` (${p.brand})` : ''}
              </option>
            ))}
          </select>
          {fieldErrors.part_id ? <p className="mt-1 text-xs text-red-600">{fieldErrors.part_id}</p> : null}
        </div>
      ) : (
        <p className="text-sm text-slate-700">
          <span className="font-medium">{initialRow?.part_name}</span>
          {initialRow?.brand ? <span className="text-slate-500"> · {initialRow.brand}</span> : null}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="inv_qty">
            Quantity on hand
          </label>
          <Input
            id="inv_qty"
            type="number"
            min="0"
            step="1"
            value={values.quantity_on_hand}
            onChange={handleChange('quantity_on_hand')}
            disabled={submitting}
          />
          {fieldErrors.quantity_on_hand ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.quantity_on_hand}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="inv_reorder">
            Reorder level
          </label>
          <Input
            id="inv_reorder"
            type="number"
            min="0"
            step="1"
            value={values.reorder_level}
            onChange={handleChange('reorder_level')}
            disabled={submitting}
          />
          {fieldErrors.reorder_level ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.reorder_level}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="inv_shelf">
          Shelf location
        </label>
        <Input id="inv_shelf" value={values.shelf_location} onChange={handleChange('shelf_location')} disabled={submitting} />
        {fieldErrors.shelf_location ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.shelf_location}</p>
        ) : null}
      </div>

      <p className="text-xs text-slate-500">Low stock when on hand ≤ reorder level.</p>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || (mode === 'create' && partOptions.length === 0)}>
          {submitting ? 'Saving…' : mode === 'create' ? 'Add to inventory' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
