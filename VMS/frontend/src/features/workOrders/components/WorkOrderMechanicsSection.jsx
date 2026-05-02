import React, { useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { ApiError } from '../../../lib/apiClient'
import { currency } from '../../../lib/formatters'
import {
  assignWorkOrderMechanic,
  removeWorkOrderMechanic,
  updateWorkOrderMechanic,
} from '../services/workOrderService'

const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60'

export default function WorkOrderMechanicsSection({
  workOrderId,
  assignedLines = [],
  mechanicCatalog = [],
  mechanicNameById,
  onRefresh,
}) {
  const [mechanicId, setMechanicId] = useState('')
  const [hours, setHours] = useState('1')
  const [rate, setRate] = useState('2800')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editHours, setEditHours] = useState('')
  const [editRate, setEditRate] = useState('')

  const assignedIds = new Set(assignedLines.map((m) => m.mechanic_id))
  const addOptions = mechanicCatalog.filter((m) => !assignedIds.has(m.mechanic_id))

  async function handleAssign(e) {
    e.preventDefault()
    setError(null)
    if (!mechanicId) {
      setError('Choose a mechanic.')
      return
    }
    setBusy(true)
    try {
      await assignWorkOrderMechanic(workOrderId, {
        mechanic_id: Number(mechanicId),
        hours_worked: Number(hours) || 0,
        labor_rate: Number(rate) || 0,
      })
      setMechanicId('')
      await onRefresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not assign mechanic.')
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(mid) {
    if (!window.confirm('Remove this mechanic from the work order?')) return
    setBusy(true)
    setError(null)
    try {
      await removeWorkOrderMechanic(workOrderId, mid)
      await onRefresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove.')
    } finally {
      setBusy(false)
    }
  }

  function startEdit(line) {
    setEditingId(line.mechanic_id)
    setEditHours(String(line.hours_worked ?? '0'))
    setEditRate(String(line.labor_rate ?? '0'))
    setError(null)
  }

  async function saveEdit(mid) {
    setBusy(true)
    setError(null)
    try {
      await updateWorkOrderMechanic(workOrderId, mid, {
        hours_worked: Number(editHours) || 0,
        labor_rate: Number(editRate) || 0,
      })
      setEditingId(null)
      await onRefresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Assigned mechanics</h3>
      <p className="mb-3 text-xs text-slate-500">
        Labor lines (work_order_mechanics): hours and hourly rate in PKR per mechanic on this job.
      </p>
      {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}

      <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Mechanic</th>
              <th className="px-3 py-2">Hours</th>
              <th className="px-3 py-2">Labor rate (PKR/hr)</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assignedLines.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-xs text-slate-500">
                  No mechanics assigned yet.
                </td>
              </tr>
            ) : (
              assignedLines.map((line) => (
                <tr key={line.mechanic_id}>
                  <td className="px-3 py-2 font-medium text-slate-800">
                    {mechanicNameById?.get(line.mechanic_id) ?? `#${line.mechanic_id}`}
                  </td>
                  <td className="px-3 py-2">
                    {editingId === line.mechanic_id ? (
                      <Input
                        className="!py-1 text-xs"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editHours}
                        onChange={(e) => setEditHours(e.target.value)}
                        disabled={busy}
                      />
                    ) : (
                      line.hours_worked
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editingId === line.mechanic_id ? (
                      <Input
                        className="!py-1 text-xs"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                        disabled={busy}
                      />
                    ) : (
                      currency(Number(line.labor_rate))
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {editingId === line.mechanic_id ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="secondary"
                          className="!px-2 !py-1 text-xs"
                          disabled={busy}
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          className="!px-2 !py-1 text-xs"
                          disabled={busy}
                          onClick={() => saveEdit(line.mechanic_id)}
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
                          onClick={() => handleRemove(line.mechanic_id)}
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

      <form onSubmit={handleAssign} className="grid gap-2 sm:grid-cols-4 sm:items-end">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Add mechanic</label>
          <select
            className={selectClass}
            value={mechanicId}
            onChange={(e) => setMechanicId(e.target.value)}
            disabled={busy || addOptions.length === 0}
          >
            <option value="">{addOptions.length === 0 ? 'All mechanics assigned' : 'Select…'}</option>
            {addOptions.map((m) => (
              <option key={m.mechanic_id} value={String(m.mechanic_id)}>
                {m.mechanic_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Hours</label>
          <Input type="number" step="0.01" min="0" value={hours} onChange={(e) => setHours(e.target.value)} disabled={busy} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Rate (PKR/hr)</label>
          <Input type="number" step="0.01" min="0" value={rate} onChange={(e) => setRate(e.target.value)} disabled={busy} />
        </div>
        <div className="flex justify-end sm:col-span-4">
          <Button type="submit" disabled={busy || addOptions.length === 0}>
            Assign
          </Button>
        </div>
      </form>
    </div>
  )
}
