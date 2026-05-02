import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { ApiError } from '../../../lib/apiClient'
import { fetchInspections } from '../../inspections/services/inspectionService'
import { fetchMechanics } from '../../mechanics/services/mechanicService'
import { fetchServiceRequests } from '../../serviceRequests/services/serviceRequestService'
import { fetchSpareParts } from '../../spareParts/services/sparePartService'
import { fetchVehicles } from '../../vehicles/services/vehicleService'
import WorkOrderForm from '../components/WorkOrderForm'
import WorkOrderMechanicsSection from '../components/WorkOrderMechanicsSection'
import WorkOrderPartsSection from '../components/WorkOrderPartsSection'
import WorkOrderTable from '../components/WorkOrderTable'
import {
  createWorkOrder,
  deleteWorkOrder,
  fetchWorkOrder,
  fetchWorkOrders,
  updateWorkOrder,
} from '../services/workOrderService'

const LIST_LIMIT = 500

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState([])
  const [inspections, setInspections] = useState([])
  const [requests, setRequests] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [mechanics, setMechanics] = useState([])
  const [parts, setParts] = useState([])

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [lookupError, setLookupError] = useState(null)

  const [filterStatus, setFilterStatus] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingId, setEditingId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const [deletingId, setDeletingId] = useState(null)
  const [bannerError, setBannerError] = useState(null)

  const vehicleLabelById = useMemo(() => {
    const m = new Map()
    vehicles.forEach((v) => {
      const tail = [v.make, v.model].filter(Boolean).join(' ')
      m.set(
        v.vehicle_id,
        tail ? `${v.registration_no} (${tail})` : String(v.registration_no ?? v.vehicle_id),
      )
    })
    return m
  }, [vehicles])

  const requestById = useMemo(() => {
    const m = new Map()
    requests.forEach((r) => m.set(r.request_id, r))
    return m
  }, [requests])

  const inspectionLabelById = useMemo(() => {
    const m = new Map()
    inspections.forEach((insp) => {
      const req = requestById.get(insp.request_id)
      const vLabel = req ? vehicleLabelById.get(req.vehicle_id) ?? `vehicle ${req.vehicle_id}` : 'unknown vehicle'
      m.set(insp.inspection_id, `Inspection #${insp.inspection_id} · Request #${insp.request_id} · ${vLabel}`)
    })
    return m
  }, [inspections, requestById, vehicleLabelById])

  const mechanicNameById = useMemo(() => {
    const m = new Map()
    mechanics.forEach((x) => m.set(x.mechanic_id, x.mechanic_name))
    return m
  }, [mechanics])

  const partLabelById = useMemo(() => {
    const m = new Map()
    parts.forEach((p) => {
      m.set(p.part_id, p.brand ? `${p.part_name} (${p.brand})` : p.part_name)
    })
    return m
  }, [parts])

  const inspectionIdsWithWO = useMemo(
    () => new Set(workOrders.map((w) => w.inspection_id)),
    [workOrders],
  )

  const formInspectionOptions = useMemo(() => {
    const addLabel = (insp) => ({
      ...insp,
      _label: inspectionLabelById.get(insp.inspection_id),
    })
    if (modalMode === 'edit' && detail) {
      return inspections
        .filter((i) => !inspectionIdsWithWO.has(i.inspection_id) || i.inspection_id === detail.inspection_id)
        .map(addLabel)
    }
    return inspections.filter((i) => !inspectionIdsWithWO.has(i.inspection_id)).map(addLabel)
  }, [inspections, inspectionIdsWithWO, modalMode, detail, inspectionLabelById])

  const loadLookups = useCallback(async () => {
    setLookupError(null)
    try {
      const [insp, req, veh, mech, prts] = await Promise.all([
        fetchInspections({ skip: 0, limit: LIST_LIMIT }),
        fetchServiceRequests({ skip: 0, limit: LIST_LIMIT }),
        fetchVehicles({ skip: 0, limit: LIST_LIMIT }),
        fetchMechanics({ skip: 0, limit: LIST_LIMIT }),
        fetchSpareParts({ skip: 0, limit: LIST_LIMIT }),
      ])
      setInspections(Array.isArray(insp) ? insp : [])
      setRequests(Array.isArray(req) ? req : [])
      setVehicles(Array.isArray(veh) ? veh : [])
      setMechanics(Array.isArray(mech) ? mech : [])
      setParts(Array.isArray(prts) ? prts : [])
    } catch (e) {
      setLookupError(e instanceof ApiError ? e.message : 'Could not load lookups.')
    }
  }, [])

  const loadWorkOrders = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const params = { skip: 0, limit: LIST_LIMIT }
      if (filterStatus) params.status = filterStatus
      const data = await fetchWorkOrders(params)
      setWorkOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : 'Failed to load work orders.')
      setWorkOrders([])
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    loadLookups()
  }, [loadLookups])

  useEffect(() => {
    loadWorkOrders()
  }, [loadWorkOrders])

  const refreshDetail = useCallback(async () => {
    if (!editingId) return
    const d = await fetchWorkOrder(editingId)
    setDetail(d)
  }, [editingId])

  function closeModal() {
    if (formSubmitting || detailLoading) return
    setModalOpen(false)
    setEditingId(null)
    setDetail(null)
    setFormError(null)
  }

  function openCreate() {
    setModalMode('create')
    setEditingId(null)
    setDetail(null)
    setFormError(null)
    setModalOpen(true)
  }

  async function openEdit(row) {
    setModalMode('edit')
    setEditingId(row.work_order_id)
    setFormError(null)
    setDetail(null)
    setModalOpen(true)
    setDetailLoading(true)
    try {
      const d = await fetchWorkOrder(row.work_order_id)
      setDetail(d)
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Could not load work order.')
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleFormSubmit(payload) {
    setFormSubmitting(true)
    setFormError(null)
    setBannerError(null)
    try {
      if (modalMode === 'create') {
        await createWorkOrder(payload)
        setModalOpen(false)
        setEditingId(null)
        setDetail(null)
      } else {
        await updateWorkOrder(editingId, payload)
        await refreshDetail()
      }
      await loadWorkOrders()
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Could not save work order.')
    } finally {
      setFormSubmitting(false)
    }
  }

  async function handleDelete(row) {
    const ok = window.confirm(
      `Delete work order #${row.work_order_id}? Labor/parts lines cascade; fails if a bill exists.`,
    )
    if (!ok) return
    setDeletingId(row.work_order_id)
    setBannerError(null)
    try {
      await deleteWorkOrder(row.work_order_id)
      if (editingId === row.work_order_id) closeModal()
      await loadWorkOrders()
    } catch (e) {
      setBannerError(e instanceof ApiError ? e.message : 'Could not delete.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredRows = useMemo(() => workOrders, [workOrders])

  return (
    <>
      <PageHeader
        title="Work Orders"
        subtitle="Jobs tied 1:1 to inspections — assign mechanics and record parts usage."
      >
        <Button onClick={openCreate}>New work order</Button>
      </PageHeader>

      {lookupError ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          {lookupError}
        </div>
      ) : null}

      {bannerError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {bannerError}
        </div>
      ) : null}

      <div className="mb-6 max-w-xs">
        <label htmlFor="wo-filter-status" className="mb-1 block text-xs font-medium text-slate-600">
          Filter by status
        </label>
        <select
          id="wo-filter-status"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="open">open</option>
          <option value="in_progress">in_progress</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>

      <WorkOrderTable
        rows={filteredRows}
        inspectionLabelById={inspectionLabelById}
        loading={loading}
        loadError={loadError}
        deletingId={deletingId}
        hasAnyRows={workOrders.length > 0}
        filterActive={Boolean(filterStatus)}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen && modalMode === 'create'}
        title="New work order"
        onClose={closeModal}
      >
        {formError ? (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</div>
        ) : null}
        <WorkOrderForm
          mode="create"
          inspectionOptions={formInspectionOptions}
          submitting={formSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={modalOpen && modalMode === 'edit'}
        title={detail ? `Work order #${detail.work_order_id}` : 'Work order'}
        onClose={closeModal}
        maxWidthClass="max-w-3xl"
      >
        {formError ? (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</div>
        ) : null}
        {detailLoading || !detail ? (
          <p className="text-sm text-slate-500">{detailLoading ? 'Loading…' : 'No data.'}</p>
        ) : (
          <div className="space-y-6">
            <WorkOrderForm
              key={detail.work_order_id}
              mode="edit"
              inspectionOptions={formInspectionOptions}
              initialWorkOrder={detail}
              submitting={formSubmitting}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
            <WorkOrderMechanicsSection
              workOrderId={detail.work_order_id}
              assignedLines={detail.mechanics}
              mechanicCatalog={mechanics}
              mechanicNameById={mechanicNameById}
              onRefresh={refreshDetail}
            />
            <WorkOrderPartsSection
              workOrderId={detail.work_order_id}
              partLines={detail.parts}
              partCatalog={parts}
              partLabelById={partLabelById}
              onRefresh={refreshDetail}
            />
          </div>
        )}
      </Modal>
    </>
  )
}
