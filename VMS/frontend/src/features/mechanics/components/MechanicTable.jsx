import React from 'react'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import Loader from '../../../components/ui/Loader'
import { formatDateTime } from '../../../lib/formatters'

export default function MechanicTable({
  rows,
  centersById,
  loading,
  loadError,
  deletingId,
  searchActive,
  filterCenterActive,
  hasAnyRows,
  onEdit,
  onDelete,
}) {
  if (loading) return <Loader label="Loading mechanics…" />
  if (loadError) return <EmptyState title="Could not load mechanics" message={loadError} />

  if (!rows.length) {
    if (!hasAnyRows) {
      return (
        <EmptyState title="No mechanics yet" message="Add a mechanic and assign them to a service center." />
      )
    }
    return (
      <EmptyState
        title="No mechanics match"
        message={
          searchActive || filterCenterActive
            ? 'Try another search or filter.'
            : 'Adjust filters.'
        }
      />
    )
  }

  function centerLabel(centerId) {
    const c = centersById?.[centerId]
    return c?.center_name ?? `Center #${centerId}`
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.02]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Center</th>
              <th className="px-4 py-3">Specialization</th>
              <th className="px-4 py-3">Certification</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((m) => (
              <tr key={m.mechanic_id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{m.mechanic_name}</td>
                <td className="px-4 py-3 text-slate-600">{centerLabel(m.center_id)}</td>
                <td className="px-4 py-3 text-slate-600">{m.specialization ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{m.certification_level ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{formatDateTime(m.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => onEdit(m)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={deletingId === m.mechanic_id}
                      onClick={() => onDelete(m)}
                    >
                      {deletingId === m.mechanic_id ? 'Deleting…' : 'Delete'}
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
