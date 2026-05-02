import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../../components/layout/PageHeader'
import { ApiError } from '../../../lib/apiClient'
import StatCards from '../../dashboard/components/StatCards'
import RecentRequestsTable from '../../dashboard/components/RecentRequestsTable'
import { fetchServiceCenters } from '../../serviceCenters/services/serviceCenterService'
import ReportFilters from '../components/ReportFilters'
import { fetchDashboardSummary, fetchServiceRequestPipeline } from '../services/reportService'

const PIPELINE_LIMIT = 100

export default function ReportsPage() {
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState(null)

  const [centers, setCenters] = useState([])
  const [centersError, setCentersError] = useState(null)

  const [filterStatus, setFilterStatus] = useState('')
  const [filterCenterId, setFilterCenterId] = useState('')

  const [pipelineRows, setPipelineRows] = useState([])
  const [pipelineLoading, setPipelineLoading] = useState(true)
  const [pipelineError, setPipelineError] = useState(null)

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true)
    setSummaryError(null)
    try {
      const data = await fetchDashboardSummary()
      setSummary(data && typeof data === 'object' ? data : null)
    } catch (e) {
      setSummary(null)
      setSummaryError(e instanceof ApiError ? e.message : 'Failed to load summary.')
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  const loadCenters = useCallback(async () => {
    try {
      const data = await fetchServiceCenters({ skip: 0, limit: 500 })
      setCenters(Array.isArray(data) ? data : [])
      setCentersError(null)
    } catch (e) {
      setCenters([])
      setCentersError(e instanceof ApiError ? e.message : 'Failed to load centers.')
    }
  }, [])

  const loadPipeline = useCallback(async () => {
    setPipelineLoading(true)
    setPipelineError(null)
    try {
      const query = { limit: PIPELINE_LIMIT }
      if (filterStatus) query.status = filterStatus
      if (filterCenterId) query.center_id = Number(filterCenterId)
      const data = await fetchServiceRequestPipeline(query)
      setPipelineRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setPipelineRows([])
      setPipelineError(e instanceof ApiError ? e.message : 'Failed to load pipeline.')
    } finally {
      setPipelineLoading(false)
    }
  }, [filterStatus, filterCenterId])

  useEffect(() => {
    loadSummary()
    loadCenters()
  }, [loadSummary, loadCenters])

  useEffect(() => {
    loadPipeline()
  }, [loadPipeline])

  const statHint = 'Full-table counts from GET /api/v1/reports/dashboard-summary'

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
        title="Reports"
        subtitle="Summary metrics and a filterable service-request pipeline. Inventory detail lives under Spare Parts."
      />

      <div className="space-y-8">
        {centersError ? (
          <p className="text-sm text-amber-700">
            Center filter unavailable: {centersError}
          </p>
        ) : null}

        <StatCards items={statItems} />

        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            to="/spare-parts"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Low-stock parts → Spare Parts
          </Link>
          <span className="text-slate-300">|</span>
          <Link to="/bills" className="font-medium text-blue-600 hover:text-blue-700">
            Bills
          </Link>
        </div>

        <ReportFilters
          status={filterStatus}
          centerId={filterCenterId}
          centers={centers}
          onStatusChange={setFilterStatus}
          onCenterChange={setFilterCenterId}
        />

        <RecentRequestsTable
          title="Service request pipeline"
          subtitle={`Latest ${PIPELINE_LIMIT} rows (same joins as vw_service_request_summary)`}
          rows={pipelineRows}
          loading={pipelineLoading}
          error={pipelineError}
          showWorkOrderColumn
        />
      </div>
    </>
  )
}
