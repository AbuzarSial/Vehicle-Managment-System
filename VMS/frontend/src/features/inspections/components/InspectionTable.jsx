import React from 'react'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import Loader from '../../../components/ui/Loader'
import { formatDate, formatDateTime } from '../../../lib/formatters'

function truncate(text, max = 72) {
  if (!text) return '—'
  if (text.length <= max) return text
  return `${text.slice(0, max)}…`
}

export default function InspectionTable({
  rows,
  requestLabelById,
  mechanicNameById,
  loading,
  loadError,
  deletingId,
  filterActive,
  hasAnyRows,
  onEdit,
  onDelete,
}) {
  if (loading) return <Loader label="Loading inspections…" />
  if (loadError) return <EmptyState title="Could not load inspections" message={loadError} />

  if (!rows.length) {
    if (!hasAnyRows) {
      return (
        <EmptyState
          title="No inspections yet"
          message="Record an inspection for a service request before opening a work order."
        />
      )
    }
    return (
      <EmptyState title="No inspections match" message={filterActive ? 'Try another filter.' : 'Adjust filters.'} />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Request</th>
              <th className="px-4 py-3">Mechanic</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Findings</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.inspection_id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.inspection_id}</td>
                <td className="px-4 py-3 text-slate-900">
                  {requestLabelById?.get(row.request_id) ?? `Request #${row.request_id}`}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {row.mechanic_id != null
                    ? mechanicNameById?.get(row.mechanic_id) ?? `#${row.mechanic_id}`
                    : '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(row.inspection_date)}</td>
                <td className="px-4 py-3 text-slate-600">{row.result ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600" title={row.findings ?? ''}>
                  {truncate(row.findings)}
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDateTime(row.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => onEdit(row)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={deletingId === row.inspection_id}
                      onClick={() => onDelete(row)}
                    >
                      {deletingId === row.inspection_id ? 'Deleting…' : 'Delete'}
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
