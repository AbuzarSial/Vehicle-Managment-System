import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { ApiError } from '../../../lib/apiClient'
import { fetchVehicles } from '../../vehicles/services/vehicleService'
import { fetchServiceCenters } from '../../serviceCenters/services/serviceCenterService'
import ServiceRequestForm from '../components/ServiceRequestForm'
import ServiceRequestTable from '../components/ServiceRequestTable'
import {
  createServiceRequest,
  deleteServiceRequest,
  fetchServiceRequests,
  updateServiceRequest,
} from '../services/serviceRequestService'
import { STATUS_OPTIONS } from '../validators/serviceRequestSchema'

const LIST_LIMIT = 500

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [centers, setCenters] = useState([])

  const [requestsLoading, setRequestsLoading] = useState(true)
  const [lookupsLoading, setLookupsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [filterVehicleId, setFilterVehicleId] = useState('')
  const [filterCenterId, setFilterCenterId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingRequest, setEditingRequest] = useState(null)
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

  const centerLabelById = useMemo(() => {
    const m = new Map()
    centers.forEach((c) => {
      m.set(c.center_id, c.center_name ?? `Center #${c.center_id}`)
    })
    return m
  }, [centers])

  const loadLookups = useCallback(async () => {
    setLookupsLoading(true)
    try {
      const [vRes, cRes] = await Promise.all([
        fetchVehicles({ skip: 0, limit: LIST_LIMIT }),
        fetchServiceCenters({ skip: 0, limit: LIST_LIMIT }),
      ])
      setVehicles(Array.isArray(vRes) ? vRes : [])
      setCenters(Array.isArray(cRes) ? cRes : [])
    } catch {
      setVehicles([])
      setCenters([])
    } finally {
      setLookupsLoading(false)
    }
  }, [])

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true)
    setLoadError(null)
    try {
      const params = { skip: 0, limit: LIST_LIMIT }
      if (filterVehicleId) params.vehicle_id = Number(filterVehicleId)
      if (filterCenterId) params.center_id = Number(filterCenterId)
      if (filterStatus) params.status = filterStatus
      const data = await fetchServiceRequests(params)
      const list = Array.isArray(data) ? data : []
      list.sort((a, b) => b.request_id - a.request_id)
      setRequests(list)
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : 'Something went wrong while loading service requests.'
      setLoadError(msg)
      setRequests([])
    } finally {
      setRequestsLoading(false)
    }
  }, [filterVehicleId, filterCenterId, filterStatus])

  useEffect(() => {
    loadLookups()
  }, [loadLookups])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  function openCreate() {
    setModalMode('create')
    setEditingRequest(null)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(row) {
    setModalMode('edit')
    setEditingRequest(row)
    setFormError(null)
    setModalOpen(true)
  }

  function closeModal() {
    if (formSubmitting) return
    setModalOpen(false)
    setEditingRequest(null)
    setFormError(null)
  }

  async function handleFormSubmit(payload) {
    setFormSubmitting(true)
    setFormError(null)
    setBannerError(null)
    try {
      if (modalMode === 'create') {
        await createServiceRequest(payload)
      } else {
        await updateServiceRequest(editingRequest.request_id, payload)
      }
      setModalOpen(false)
      setEditingRequest(null)
      setFormError(null)
      await loadRequests()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not save service request.'
      setFormError(msg)
    } finally {
      setFormSubmitting(false)
    }
  }

  async function handleDelete(row) {
    const ok = window.confirm(
      `Delete service request #${row.request_id}? This may fail if an inspection references it.`,
    )
    if (!ok) return

    setDeletingId(row.request_id)
    setBannerError(null)
    try {
      await deleteServiceRequest(row.request_id)
      await loadRequests()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not delete service request.'
      setBannerError(msg)
    } finally {
      setDeletingId(null)
    }
  }

  const sortedVehiclesFilter = useMemo(
    () =>
      [...vehicles].sort((a, b) =>
        String(a.registration_no ?? '').localeCompare(String(b.registration_no ?? '')),
      ),
    [vehicles],
  )

  const sortedCentersFilter = useMemo(
    () =>
      [...centers].sort((a, b) =>
        String(a.center_name ?? '').localeCompare(String(b.center_name ?? '')),
      ),
    [centers],
  )

  const canCreate = vehicles.length > 0 && centers.length > 0 && !lookupsLoading

  return (
    <>
      <PageHeader
        title="Service Requests"
        subtitle="Links a vehicle to a service center (vehicle_id + center_id). Uses /api/v1/service-requests."
      >
        <Button onClick={openCreate} disabled={!canCreate}>
          New request
        </Button>
      </PageHeader>

      {!canCreate && !lookupsLoading ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Add at least one vehicle and ensure service centers exist (seed data or DB) before creating
          a request.
        </div>
      ) : null}

      {bannerError ? (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {bannerError}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="flt-v">
            Vehicle
          </label>
          <select
            id="flt-v"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
            value={filterVehicleId}
            onChange={(e) => setFilterVehicleId(e.target.value)}
            disabled={requestsLoading}
          >
            <option value="">All vehicles</option>
            {sortedVehiclesFilter.map((v) => (
              <option key={v.vehicle_id} value={v.vehicle_id}>
                {v.registration_no}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="flt-c">
            Center
          </label>
          <select
            id="flt-c"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
            value={filterCenterId}
            onChange={(e) => setFilterCenterId(e.target.value)}
            disabled={requestsLoading}
          >
            <option value="">All centers</option>
            {sortedCentersFilter.map((c) => (
              <option key={c.center_id} value={c.center_id}>
                {c.center_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="flt-s">
            Status
          </label>
          <select
            id="flt-s"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            disabled={requestsLoading}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ServiceRequestTable
        rows={requests}
        vehicleLabelById={vehicleLabelById}
        centerLabelById={centerLabelById}
        loading={requestsLoading}
        loadError={loadError}
        deletingId={deletingId}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        title={modalMode === 'create' ? 'New service request' : `Edit request #${editingRequest?.request_id}`}
        onClose={closeModal}
      >
        {formError ? (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</div>
        ) : null}
        <ServiceRequestForm
          key={modalMode === 'edit' && editingRequest ? editingRequest.request_id : 'create'}
          mode={modalMode}
          initialRequest={editingRequest}
          vehicleOptions={vehicles}
          centerOptions={centers}
          lookupsLoading={lookupsLoading}
          submitting={formSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </>
  )
}
