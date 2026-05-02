import React from 'react'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import Loader from '../../../components/ui/Loader'

export default function InventoryTable({
  rows,
  loading,
  loadError,
  centerSelected,
  deletingKey,
  onEdit,
  onDelete,
}) {
  if (!centerSelected) {
    return (
      <EmptyState title="Select a service center" message="Choose a center above to view or edit stocked parts." />
    )
  }

  if (loading) return <Loader label="Loading inventory…" />
  if (loadError) return <EmptyState title="Could not load inventory" message={loadError} />

  if (!rows.length) {
    return (
      <EmptyState
        title="No stock rows for this center"
        message="Add a part to inventory with quantity, reorder level, and optional shelf location."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">On hand</th>
              <th className="px-4 py-3">Reorder</th>
              <th className="px-4 py-3">Shelf</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const key = `${row.center_id}-${row.part_id}`
              return (
                <tr key={key} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{row.part_name}</p>
                    {row.brand ? <p className="text-xs text-slate-500">{row.brand}</p> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-800">{row.quantity_on_hand}</td>
                  <td className="px-4 py-3 text-slate-600">{row.reorder_level}</td>
                  <td className="px-4 py-3 text-slate-600">{row.shelf_location ?? '—'}</td>
                  <td className="px-4 py-3">
                    {row.is_low_stock ? (
                      <Badge variant="warning">Low stock</Badge>
                    ) : (
                      <span className="text-xs text-slate-500">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => onEdit(row)}>
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="!px-3 !py-1.5 text-xs"
                        disabled={deletingKey === key}
                        onClick={() => onDelete(row)}
                      >
                        {deletingKey === key ? 'Removing…' : 'Remove'}
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
