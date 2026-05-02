import React from 'react'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import Loader from '../../../components/ui/Loader'
import { currency, formatDate, formatDateTime } from '../../../lib/formatters'
import { getPaymentStatusPresentation } from '../lib/paymentStatusDisplay'

export default function BillTable({
  rows,
  loading,
  loadError,
  deletingId,
  filterActive,
  hasAnyRows,
  onEdit,
  onDelete,
}) {
  if (loading) return <Loader label="Loading bills…" />
  if (loadError) return <EmptyState title="Could not load bills" message={loadError} />

  if (!rows.length) {
    if (!hasAnyRows) {
      return (
        <EmptyState
          title="No bills yet"
          message="Create a bill for a work order that does not already have one."
        />
      )
    }
    return (
      <EmptyState title="No bills match" message={filterActive ? 'Try another filter or search.' : 'Adjust filters.'} />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Bill #</th>
              <th className="px-4 py-3">Work order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount (PKR)</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((b) => {
              const pay = getPaymentStatusPresentation(b.payment_status)
              return (
                <tr key={b.bill_id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-slate-800">{b.bill_id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">#{b.work_order_id}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(b.bill_date)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{currency(Number(b.total_amount))}</td>
                  <td className="px-4 py-3">
                    <Badge variant={pay.variant}>{pay.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(b.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => onEdit(b)}>
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="!px-3 !py-1.5 text-xs"
                        disabled={deletingId === b.bill_id}
                        onClick={() => onDelete(b)}
                      >
                        {deletingId === b.bill_id ? 'Deleting…' : 'Delete'}
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
