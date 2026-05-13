import React, { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { ApiError } from '../../../lib/apiClient'
import { currency } from '../../../lib/formatters'
import { addWorkOrderPart, removeWorkOrderPart, updateWorkOrderPart } from '../services/workOrderService'

const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60'

export default function WorkOrderPartsSection({
  workOrderId,
  partLines = [],
  partCatalog = [],
  partLabelById,
  onRefresh,
}) {
  const [partId, setPartId] = useState('')
  const [qty, setQty] = useState('1')
  const [salePrice, setSalePrice] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [editingPartId, setEditingPartId] = useState(null)
  const [editQty, setEditQty] = useState('')
  const [editPrice, setEditPrice] = useState('')

  const usedPartIds = new Set(partLines.map((p) => p.part_id))
  const addOptions = partCatalog.filter((p) => !usedPartIds.has(p.part_id))

  useEffect(() => {
    if (!partId) {
      setSalePrice('')
      return
    }
    const p = partCatalog.find((x) => String(x.part_id) === String(partId))
    if (p) setSalePrice(String(p.unit_price ?? '0'))
  }, [partId, partCatalog])

  async function handleAdd(e) {
    e.preventDefault()
    setError(null)
    if (!partId) {
      setError('Choose a part.')
      return
    }
    const q = Number(qty)
    if (!Number.isFinite(q) || q < 1) {
      setError('Quantity must be at least 1.')
      return
    }
    setBusy(true)
    try {
      await addWorkOrderPart(workOrderId, {
        part_id: Number(partId),
        quantity_used: q,
        sale_price_at_use: Number(salePrice) >= 0 ? Number(salePrice) : 0,
      })
      setPartId('')
      setQty('1')
      setSalePrice('')
      await onRefresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add part.')
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(pid) {
    if (!window.confirm('Remove this part line?')) return
    setBusy(true)
    setError(null)
    try {
      await removeWorkOrderPart(workOrderId, pid)
      await onRefresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove.')
    } finally {
      setBusy(false)
    }
  }

  function startEdit(line) {
    setEditingPartId(line.part_id)
    setEditQty(String(line.quantity_used ?? '1'))
    setEditPrice(String(line.sale_price_at_use ?? '0'))
    setError(null)
  }

  async function saveEdit(pid) {
    const q = Number(editQty)
    if (!Number.isFinite(q) || q < 0) {
      setError('Invalid quantity.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await updateWorkOrderPart(workOrderId, pid, {
        quantity_used: q,
        sale_price_at_use: Number(editPrice) >= 0 ? Number(editPrice) : 0,
      })
      setEditingPartId(null)
      await onRefresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Parts used</h3>
      <p className="mb-3 text-xs text-slate-500">
        Consumption lines (work_order_parts): quantity and billed unit price (PKR) at time of use.
      </p>
      {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}

      <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/20 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-3 py-2">Part</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Sale price (PKR)</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {partLines.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-xs text-slate-500">
                  No parts recorded yet.
                </td>
              </tr>
            ) : (
              partLines.map((line) => (
                <tr key={line.part_id}>
                  <td className="px-3 py-2 font-medium text-slate-800">
                    {partLabelById?.get(line.part_id) ?? `Part #${line.part_id}`}
                  </td>
                  <td className="px-3 py-2">
                    {editingPartId === line.part_id ? (
                      <Input
                        className="!py-1 text-xs"
                        type="number"
                        min="0"
                        step="1"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        disabled={busy}
                      />
                    ) : (
                      line.quantity_used
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editingPartId === line.part_id ? (
                      <Input
                        className="!py-1 text-xs"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        disabled={busy}
                      />
                    ) : (
                      currency(Number(line.sale_price_at_use))
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {editingPartId === line.part_id ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="secondary"
                          className="!px-2 !py-1 text-xs"
                          disabled={busy}
                          onClick={() => setEditingPartId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          className="!px-2 !py-1 text-xs"
                          disabled={busy}
                          onClick={() => saveEdit(line.part_id)}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="secondary"
                          className="!px-2 !py-1 text-xs"
                          disabled={busy}
                          onClick={() => startEdit(line)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="!px-2 !py-1 text-xs"
                          disabled={busy}
                          onClick={() => handleRemove(line.part_id)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleAdd} className="grid gap-2 sm:grid-cols-4 sm:items-end">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Add part</label>
          <select
            className={selectClass}
            value={partId}
            onChange={(e) => setPartId(e.target.value)}
            disabled={busy || addOptions.length === 0}
          >
            <option value="">{addOptions.length === 0 ? 'All catalog parts already added' : 'Select…'}</option>
            {addOptions.map((p) => (
              <option key={p.part_id} value={String(p.part_id)}>
                {p.part_name}
                {p.brand ? ` (${p.brand})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Qty</label>
          <Input type="number" min="1" step="1" value={qty} onChange={(e) => setQty(e.target.value)} disabled={busy} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Sale price (PKR)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="flex justify-end sm:col-span-4">
          <Button type="submit" disabled={busy || addOptions.length === 0}>
            Add part
          </Button>
        </div>
      </form>
    </div>
  )
}
