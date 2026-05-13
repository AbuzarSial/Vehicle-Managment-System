import React from 'react'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import Loader from '../../../components/ui/Loader'
import { formatDateTime } from '../../../lib/formatters'

export default function CustomerTable({
  rows,
  loading,
  loadError,
  deletingId,
  hasAnyCustomers,
  searchActive,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return <Loader label="Loading customers…" />
  }

  if (loadError) {
    return (
      <EmptyState
        title="Could not load customers"
        message={loadError}
      />
    )
  }

  if (!rows.length) {
    if (!hasAnyCustomers) {
      return (
        <EmptyState
          title="No customers yet"
          message="Use “Add customer” to create your first record."
        />
      )
    }
    return (
      <EmptyState
        title="No customers match"
        message={
          searchActive
            ? 'Try a different search term.'
            : 'Try adjusting filters.'
        }
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.02]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/25">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 font-medium text-slate-600">Phone</th>
              <th className="px-4 py-3 font-medium text-slate-600">Email</th>
              <th className="px-4 py-3 font-medium text-slate-600">Created</th>
              <th className="px-4 py-3 font-medium text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((c) => (
              <tr key={c.customer_id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-medium text-slate-900">{c.customer_name}</td>
                <td className="px-4 py-3 text-slate-600">{c.phone ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{c.email ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{formatDateTime(c.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => onEdit(c)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={deletingId === c.customer_id}
                      onClick={() => onDelete(c)}
                    >
                      {deletingId === c.customer_id ? 'Deleting…' : 'Delete'}
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
