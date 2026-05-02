import React from 'react'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import Loader from '../../../components/ui/Loader'
import { formatDate } from '../../../lib/formatters'

export default function WorkOrderTable({
  rows,
  inspectionLabelById,
  loading,
  loadError,
  deletingId,
  filterActive,
  hasAnyRows,
  onEdit,
  onDelete,
}) {
  if (loading) return <Loader label="Loading work orders…" />
  if (loadError) return <EmptyState title="Could not load work orders" message={loadError} />

  if (!rows.length) {
    if (!hasAnyRows) {
      return (
        <EmptyState
          title="No work orders yet"
          message="Open a work order from an inspection to schedule labor and parts."
        />
      )
    }
    return (
      <EmptyState title="No work orders match" message={filterActive ? 'Try another filter.' : 'Adjust filters.'} />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Inspection</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Open</th>
              <th className="px-4 py-3">Close</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((wo) => (
              <tr key={wo.work_order_id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{wo.work_order_id}</td>
                <td className="px-4 py-3 text-slate-900">
                  {inspectionLabelById?.get(wo.inspection_id) ?? `Inspection #${wo.inspection_id}`}
                </td>
                <td className="px-4 py-3 text-slate-600">{wo.status}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(wo.open_date)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(wo.close_date)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => onEdit(wo)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={deletingId === wo.work_order_id}
                      onClick={() => onDelete(wo)}
                    >
                      {deletingId === wo.work_order_id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
