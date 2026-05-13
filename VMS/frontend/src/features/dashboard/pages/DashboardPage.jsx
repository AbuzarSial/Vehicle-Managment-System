import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/layout/PageHeader'
import { ApiError } from '../../../lib/apiClient'
import {
  fetchDashboardSummary,
  fetchServiceRequestPipeline,
} from '../../reports/services/reportService'
import LowStockPanel from '../components/LowStockPanel'
import PendingBillsPanel from '../components/PendingBillsPanel'
import RecentRequestsTable from '../components/RecentRequestsTable'
import StatCards from '../components/StatCards'

const PIPELINE_LIMIT = 8

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState(null)

  const [pipelineRows, setPipelineRows] = useState([])
  const [pipelineLoading, setPipelineLoading] = useState(true)
  const [pipelineError, setPipelineError] = useState(null)

  const load = useCallback(async () => {
    setSummaryLoading(true)
    setPipelineLoading(true)
    setSummaryError(null)
    setPipelineError(null)

    const [sumRes, pipeRes] = await Promise.allSettled([
      fetchDashboardSummary(),
      fetchServiceRequestPipeline({ limit: PIPELINE_LIMIT }),
    ])

    if (sumRes.status === 'fulfilled') {
      setSummary(sumRes.value && typeof sumRes.value === 'object' ? sumRes.value : null)
    } else {
      setSummary(null)
      const e = sumRes.reason
      setSummaryError(e instanceof ApiError ? e.message : 'Failed to load dashboard summary.')
    }
    setSummaryLoading(false)

    if (pipeRes.status === 'fulfilled') {
      setPipelineRows(Array.isArray(pipeRes.value) ? pipeRes.value : [])
    } else {
      setPipelineRows([])
      const e = pipeRes.reason
      setPipelineError(
        e instanceof ApiError ? e.message : 'Failed to load service request pipeline.',
      )
    }
    setPipelineLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const statHint = 'COUNT(*) on live tables — not limited to list pagination'

  const statItems = useMemo(() => {
    const s = summary ?? {}
    const err = summaryError
    return [
      {
        key: 'cust',
        label: 'Customers',
        value: s.total_customers ?? '—',
        hint: statHint,
        loading: summaryLoading,
        error: err,
      },
      {
        key: 'veh',
        label: 'Vehicles',
        value: s.total_vehicles ?? '—',
        hint: statHint,
        loading: summaryLoading,
        error: err,
      },
      {
        key: 'open_sr',
        label: 'Open service requests',
        value: s.open_service_requests ?? '—',
        hint: statHint,
        loading: summaryLoading,
        error: err,
      },
      {
        key: 'ongoing_wo',
        label: 'Ongoing work orders',
        value: s.ongoing_work_orders ?? '—',
        hint: statHint,
        loading: summaryLoading,
        error: err,
      },
      {
        key: 'pending_bills',
        label: 'Pending bills',
        value: s.pending_bills ?? '—',
        hint: statHint,
        loading: summaryLoading,
        error: err,
      },
      {
        key: 'low_stock',
        label: 'Low-stock SKUs',
        value: s.low_stock_skus ?? '—',
        hint: statHint,
        loading: summaryLoading,
        error: err,
      },
    ]
  }, [summary, summaryLoading, summaryError, statHint])

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Operations overview — GET /api/v1/reports/dashboard-summary; pipeline shows vehicle, customer, and center names (demo data is Pakistan / PKR)."
      />

      <div className="space-y-8">
        <StatCards items={statItems} />

        <RecentRequestsTable
          title="Recent service requests"
          subtitle={`Latest ${PIPELINE_LIMIT} from GET /api/v1/reports/service-request-pipeline`}
          rows={pipelineRows}
          loading={pipelineLoading}
          error={pipelineError}
          showWorkOrderColumn
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <LowStockPanel />
          <PendingBillsPanel />
        </div>
      </div>
    </>
  )
}
