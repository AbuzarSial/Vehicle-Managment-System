import React from 'react'
import { STATUS_OPTIONS } from '../../serviceRequests/validators/serviceRequestSchema'

/**
 * @param {{
 *   status: string,
 *   centerId: string,
 *   centers: Array<{ center_id: number, center_name?: string }>,
 *   onStatusChange: (v: string) => void,
 *   onCenterChange: (v: string) => void,
 * }} props
 */
export default function ReportFilters({
  status,
  centerId,
  centers,
  onStatusChange,
  onCenterChange,
}) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.02]">
      <div className="min-w-[140px] flex-1">
        <label htmlFor="report-filter-status" className="block text-xs font-medium text-slate-600">
          Request status
        </label>
        <select
          id="report-filter-status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[180px] flex-1">
        <label htmlFor="report-filter-center" className="block text-xs font-medium text-slate-600">
          Service center
        </label>
        <select
          id="report-filter-center"
          value={centerId}
          onChange={(e) => onCenterChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All centers</option>
          {centers.map((c) => (
            <option key={c.center_id} value={String(c.center_id)}>
              {c.center_name ?? `Center #${c.center_id}`}
            </option>
          ))}
        </select>
      </div>
      <p className="flex-1 text-xs text-slate-500">
        The table below updates when you change a filter.
      </p>
    </div>
  )
}
