import React from 'react'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import Loader from '../../../components/ui/Loader'
import { formatDateTime } from '../../../lib/formatters'

export default function ServiceCenterTable({
  rows,
  loading,
  loadError,
  deletingId,
  searchActive,
  hasAnyRows,
  onEdit,
  onDelete,
}) {
  if (loading) return <Loader label="Loading service centers…" />
  if (loadError) return <EmptyState title="Could not load centers" message={loadError} />

  if (!rows.length) {
    if (!hasAnyRows) {
      return (
        <EmptyState title="No service centers yet" message="Create a center to use it on requests and mechanics." />
      )
    }
    return (
      <EmptyState
        title="No centers match"
        message={searchActive ? 'Try another search.' : 'Adjust filters.'}
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((c) => (
              <tr key={c.center_id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{c.center_name}</td>
                <td className="px-4 py-3 text-slate-600">{c.city ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{c.phone ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{formatDateTime(c.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => onEdit(c)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={deletingId === c.center_id}
                      onClick={() => onDelete(c)}
                    >
                      {deletingId === c.center_id ? 'Deleting…' : 'Delete'}
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
