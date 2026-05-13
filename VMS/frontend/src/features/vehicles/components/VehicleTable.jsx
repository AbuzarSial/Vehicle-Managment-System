import React from 'react'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import Loader from '../../../components/ui/Loader'
import { formatDateTime } from '../../../lib/formatters'

function trimModelLine(make, model, year) {
  const parts = []
  if (make) parts.push(make)
  if (model) parts.push(model)
  if (year !== null && year !== undefined) parts.push(String(year))
  return parts.length ? parts.join(' · ') : '—'
}

function subtypeBadgeVariant(t) {
  if (t === 'car') return 'default'
  if (t === 'motorcycle') return 'warning'
  if (t === 'truck') return 'success'
  return 'default'
}

function subtypeLabel(t) {
  if (!t) return null
  if (t === 'car') return 'Car'
  if (t === 'motorcycle') return 'Motorcycle'
  if (t === 'truck') return 'Truck'
  return t
}

function subtypeHint(v) {
  if (v.vehicle_type === 'car' && v.car) {
    const p = []
    if (v.car.number_of_doors != null) p.push(`${v.car.number_of_doors} dr`)
    if (v.car.body_type) p.push(v.car.body_type)
    return p.length ? p.join(' · ') : null
  }
  if (v.vehicle_type === 'motorcycle' && v.motorcycle) {
    const p = []
    if (v.motorcycle.engine_cc != null) p.push(`${v.motorcycle.engine_cc} cc`)
    if (v.motorcycle.bike_type) p.push(v.motorcycle.bike_type)
    return p.length ? p.join(' · ') : null
  }
  if (v.vehicle_type === 'truck' && v.truck) {
    const p = []
    if (v.truck.load_capacity != null) p.push(`cap ${v.truck.load_capacity}`)
    if (v.truck.axle_count != null) p.push(`${v.truck.axle_count} axles`)
    return p.length ? p.join(' · ') : null
  }
  return null
}

export default function VehicleTable({
  rows,
  customerLabelById,
  loading,
  loadError,
  deletingId,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return <Loader label="Loading vehicles…" />
  }

  if (loadError) {
    return <EmptyState title="Could not load vehicles" message={loadError} />
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="No vehicles"
        message="Add a vehicle or change the customer filter."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.02]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/25">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Registration</th>
              <th className="px-4 py-3 font-medium text-slate-600">VIN</th>
              <th className="px-4 py-3 font-medium text-slate-600">Vehicle</th>
              <th className="px-4 py-3 font-medium text-slate-600">Subtype</th>
              <th className="px-4 py-3 font-medium text-slate-600">Owner</th>
              <th className="px-4 py-3 font-medium text-slate-600">Created</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((v) => {
              const hint = subtypeHint(v)
              return (
                <tr key={v.vehicle_id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{v.registration_no}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{v.vin}</td>
                  <td className="px-4 py-3 text-slate-600">{trimModelLine(v.make, v.model, v.model_year)}</td>
                  <td className="px-4 py-3">
                    {v.vehicle_type ? (
                      <div>
                        <Badge variant={subtypeBadgeVariant(v.vehicle_type)}>{subtypeLabel(v.vehicle_type)}</Badge>
                        {hint ? <p className="mt-1 max-w-[12rem] text-xs text-slate-500">{hint}</p> : null}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {customerLabelById?.get(v.customer_id) ?? `Customer #${v.customer_id}`}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(v.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        className="!px-3 !py-1.5 text-xs"
                        onClick={() => onEdit(v)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="!px-3 !py-1.5 text-xs"
                        disabled={deletingId === v.vehicle_id}
                        onClick={() => onDelete(v)}
                      >
                        {deletingId === v.vehicle_id ? 'Deleting…' : 'Delete'}
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
