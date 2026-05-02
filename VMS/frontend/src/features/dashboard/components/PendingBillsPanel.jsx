import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import { ApiError } from '../../../lib/apiClient'
import { currency, formatDate } from '../../../lib/formatters'
import { fetchPendingBillsReport } from '../../reports/services/reportService'

export default function PendingBillsPanel() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPendingBillsReport({ limit: 30 })
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setRows([])
      setError(e instanceof ApiError ? e.message : 'Failed to load pending bills.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Card
      title="Pending bills"
      subtitle="Unpaid / pending payment (aligned with vw_pending_bills)"
      badge={
        loading ? (
          <Badge>Loading…</Badge>
        ) : error ? (
          <Badge variant="danger">Error</Badge>
        ) : rows.length > 0 ? (
          <Badge variant="warning">{rows.length} shown</Badge>
        ) : (
          <Badge variant="success">None</Badge>
        )
      }
      actions={
        <Link to="/bills" className="text-xs font-medium text-blue-600 hover:text-blue-700">
          View bills
        </Link>
      }
    >
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-600">No unpaid or pending bills in this window.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.slice(0, 8).map((row) => (
            <li key={row.bill_id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">
                  Bill #{row.bill_id}{' '}
                  <span className="font-normal text-slate-500">· WO {row.work_order_id}</span>
                </p>
                <p className="truncate text-xs text-slate-500">
                  {formatDate(row.bill_date)} · WO {row.work_order_status}
                </p>
                <p className="text-xs capitalize text-slate-500">{row.payment_status}</p>
              </div>
              <p className="shrink-0 font-semibold tabular-nums text-slate-900">
                {currency(Number(row.total_amount))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
