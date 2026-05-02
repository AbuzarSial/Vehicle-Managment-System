import React from 'react'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import Loader from '../../../components/ui/Loader'
import { formatDate } from '../../../lib/formatters'

function clip(text, max = 48) {
  if (!text) return '—'
  const t = String(text)
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

export default function ServiceRequestTable({
  rows,
  vehicleLabelById,
  centerLabelById,
  loading,
  loadError,
  deletingId,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return <Loader label="Loading service requests…" />
  }

  if (loadError) {
    return <EmptyState title="Could not load service requests" message={loadError} />
  }

  if (!rows?.length) {
    return (
      <EmptyState
        title="No service requests"
        message="Create a request to link a vehicle with a service center."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Center</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Problem</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.request_id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.request_id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDate(r.request_date)}</td>
                <td className="max-w-[140px] px-4 py-3 text-slate-700">
                  {vehicleLabelById?.get(r.vehicle_id) ?? `#${r.vehicle_id}`}
                </td>
                <td className="max-w-[140px] px-4 py-3 text-slate-700">
                  {centerLabelById?.get(r.center_id) ?? `#${r.center_id}`}
                </td>
                <td className="px-4 py-3 text-slate-600">{r.request_type ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">
                    {String(r.status ?? '').replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="max-w-xs px-4 py-3 text-slate-500" title={r.problem_description ?? ''}>
                  {clip(r.problem_description)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      className="!px-3 !py-1.5 text-xs"
                      onClick={() => onEdit(r)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={deletingId === r.request_id}
                      onClick={() => onDelete(r)}
                    >
                      {deletingId === r.request_id ? 'Deleting…' : 'Delete'}
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
