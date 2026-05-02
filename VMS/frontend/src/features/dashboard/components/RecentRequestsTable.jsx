import React from 'react'
import Card from '../../../components/ui/Card'
import EmptyState from '../../../components/ui/EmptyState'
import Loader from '../../../components/ui/Loader'
import { formatDate } from '../../../lib/formatters'

function rowStatus(r) {
  return r.request_status ?? r.status ?? '—'
}

function rowVehicleLabel(r) {
  if (r.registration_no) return r.registration_no
  if (r.make || r.model) return [r.make, r.model].filter(Boolean).join(' ')
  if (r.vehicle_id != null) return `#${r.vehicle_id}`
  return '—'
}

function rowCenterLabel(r) {
  if (r.center_name) return r.center_name
  if (r.center_id != null) return `#${r.center_id}`
  return '—'
}

function rowCustomerLabel(r) {
  if (r.customer_name) return r.customer_name
  if (r.customer_id != null) return `#${r.customer_id}`
  return '—'
}

/**
 * Service requests from either GET /api/v1/service-requests or the pipeline report
 * (registration_no, center_name, request_status, work_order_id, …).
 */
export default function RecentRequestsTable({
  rows,
  loading,
  error,
  title = 'Recent service requests',
  subtitle,
  showWorkOrderColumn = false,
}) {
  const defaultSubtitle =
    'Pipeline rows show registration and center name (demo seed is Pakistan-based); plain list payloads also supported.'

  if (loading) {
    return (
      <Card title={title} subtitle={subtitle ?? defaultSubtitle}>
        <Loader label="Loading requests…" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card title={title}>
        <EmptyState title="Could not load requests" message={error} />
      </Card>
    )
  }

  if (!rows?.length) {
    return (
      <Card title={title} subtitle={subtitle ?? defaultSubtitle}>
        <EmptyState title="No service requests" message="Create requests from the Service Requests page." />
      </Card>
    )
  }

  const pipelineRow = rows.some((r) => r.registration_no != null || r.center_name != null)
  const showCustomer = pipelineRow
  const showWo = showWorkOrderColumn || rows.some((r) => r.work_order_id != null)

  return (
    <Card title={title} subtitle={subtitle ?? defaultSubtitle}>
      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Date</th>
              {showCustomer ? <th className="px-4 py-3">Customer</th> : null}
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Center</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              {showWo ? <th className="px-4 py-3">Work order</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.request_id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.request_id}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(r.request_date)}</td>
                {showCustomer ? (
                  <td className="max-w-[12rem] truncate px-4 py-3 text-slate-600" title={rowCustomerLabel(r)}>
                    {rowCustomerLabel(r)}
                  </td>
                ) : null}
                <td className="max-w-[10rem] truncate px-4 py-3 text-slate-600" title={rowVehicleLabel(r)}>
                  {rowVehicleLabel(r)}
                </td>
                <td className="max-w-[10rem] truncate px-4 py-3 text-slate-600" title={rowCenterLabel(r)}>
                  {rowCenterLabel(r)}
                </td>
                <td className="px-4 py-3 text-slate-600">{r.request_type ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {rowStatus(r)}
                  </span>
                </td>
                {showWo ? (
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {r.work_order_id != null ? (
                      <>
                        <span className="font-mono">#{r.work_order_id}</span>
                        {r.work_order_status ? (
                          <span className="ml-1 text-slate-500">({r.work_order_status})</span>
                        ) : null}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
