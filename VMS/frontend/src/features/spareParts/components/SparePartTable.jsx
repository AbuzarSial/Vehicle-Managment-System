import React from 'react'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import Loader from '../../../components/ui/Loader'
import { currency, formatDateTime } from '../../../lib/formatters'

export default function SparePartTable({
  rows,
  loading,
  loadError,
  deletingId,
  searchActive,
  hasAnyRows,
  onEdit,
  onDelete,
}) {
  if (loading) return <Loader label="Loading catalog…" />
  if (loadError) return <EmptyState title="Could not load parts" message={loadError} />

  if (!rows.length) {
    if (!hasAnyRows) {
      return <EmptyState title="No parts in catalog" message="Add a spare part to use it on work orders and stock it at centers." />
    }
    return <EmptyState title="No parts match" message={searchActive ? 'Try another search.' : 'Adjust filters.'} />
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Unit price (PKR)</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => (
              <tr key={p.part_id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.part_id}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{p.part_name}</td>
                <td className="px-4 py-3 text-slate-600">{p.brand ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{currency(Number(p.unit_price))}</td>
                <td className="px-4 py-3 text-slate-500">{formatDateTime(p.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => onEdit(p)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={deletingId === p.part_id}
                      onClick={() => onDelete(p)}
                    >
                      {deletingId === p.part_id ? 'Deleting…' : 'Delete'}
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
