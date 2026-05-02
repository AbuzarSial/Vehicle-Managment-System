import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import { ApiError } from '../../../lib/apiClient'
import { fetchInventoryLowStock } from '../../spareParts/services/inventoryService'

export default function LowStockPanel() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchInventoryLowStock({ limit: 100 })
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setRows([])
      setError(e instanceof ApiError ? e.message : 'Failed to load low-stock inventory.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Card
      title="Low stock alerts"
      subtitle="Parts at or below reorder level (same rule as vw_low_stock_parts)"
      badge={
        loading ? (
          <Badge>Loading…</Badge>
        ) : error ? (
          <Badge variant="danger">Error</Badge>
        ) : rows.length > 0 ? (
          <Badge variant="warning">{rows.length} SKU</Badge>
        ) : (
          <Badge variant="success">None</Badge>
        )
      }
      actions={
        <Link
          to="/spare-parts"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          Manage inventory
        </Link>
      }
    >
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-600">No low-stock rows in the loaded window.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.slice(0, 8).map((row) => (
            <li key={`${row.center_id}-${row.part_id}`} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-900">{row.part_name}</p>
                <p className="text-xs text-slate-500">{row.center_name}</p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <span className="font-semibold text-amber-700">{row.quantity_on_hand}</span>
                <span className="text-slate-400"> / reorder {row.reorder_level}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
