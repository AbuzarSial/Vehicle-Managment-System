import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { ApiError } from '../../../lib/apiClient'
import { fetchMechanics } from '../../mechanics/services/mechanicService'
import { fetchServiceRequests } from '../../serviceRequests/services/serviceRequestService'
import { fetchVehicles } from '../../vehicles/services/vehicleService'
import InspectionForm from '../components/InspectionForm'
import InspectionTable from '../components/InspectionTable'
import {
  createInspection,
  deleteInspection,
  fetchInspections,
  updateInspection,
} from '../services/inspectionService'

const LIST_LIMIT = 500

export default function InspectionsPage() {
  const [inspections, setInspections] = useState([])
  const [requests, setRequests] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [mechanics, setMechanics] = useState([])

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [lookupError, setLookupError] = useState(null)

  const [filterMechanicId, setFilterMechanicId] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editing, setEditing] = useState(null)
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

  const requestLabelById = useMemo(() => {
    const m = new Map()
    requests.forEach((r) => {
      const vLabel = vehicleLabelById.get(r.vehicle_id) ?? `vehicle ${r.vehicle_id}`
      m.set(r.request_id, `Request #${r.request_id} · ${vLabel}`)
    })
    return m
  }, [requests, vehicleLabelById])

  const mechanicNameById = useMemo(() => {
    const m = new Map()
    mechanics.forEach((x) => m.set(x.mechanic_id, x.mechanic_name))
    return m
  }, [mechanics])

  const inspectedRequestIds = useMemo(() => new Set(inspections.map((i) => i.request_id)), [inspections])

  const formRequestOptions = useMemo(() => {
    const addLabel = (r) => ({
      ...r,
      _label: requestLabelById.get(r.request_id) ?? undefined,
    })
    if (modalMode === 'edit' && editing) {
      return requests
        .filter(
          (r) =>
            !inspectedRequestIds.has(r.request_id) || r.request_id === editing.request_id,
        )
        .map(addLabel)
    }
    return requests.filter((r) => !inspectedRequestIds.has(r.request_id)).map(addLabel)
  }, [requests, inspectedRequestIds, modalMode, editing, requestLabelById])

  const loadCore = useCallback(async () => {
    setLookupError(null)
    try {
      const [v, m, req] = await Promise.all([
        fetchVehicles({ skip: 0, limit: LIST_LIMIT }),
        fetchMechanics({ skip: 0, limit: LIST_LIMIT }),
        fetchServiceRequests({ skip: 0, limit: LIST_LIMIT }),
      ])
      setVehicles(Array.isArray(v) ? v : [])
      setMechanics(Array.isArray(m) ? m : [])
      setRequests(Array.isArray(req) ? req : [])
    } catch (e) {
      setLookupError(e instanceof ApiError ? e.message : 'Could not load requests or lookups.')
    }
  }, [])

  const loadInspections = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const params = { skip: 0, limit: LIST_LIMIT }
      if (filterMechanicId !== '' && filterMechanicId != null) {
        params.mechanic_id = Number(filterMechanicId)
      }
      const data = await fetchInspections(params)
      setInspections(Array.isArray(data) ? data : [])
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : 'Failed to load inspections.')
      setInspections([])
    } finally {
      setLoading(false)
    }
  }, [filterMechanicId])

  useEffect(() => {
    loadCore()
  }, [loadCore])

  useEffect(() => {
    loadInspections()
  }, [loadInspections])

  function openCreate() {
    setModalMode('create')
    setEditing(null)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(row) {
    setModalMode('edit')
    setEditing(row)
    setFormError(null)
    setModalOpen(true)
  }

  function closeModal() {
    if (formSubmitting) return
    setModalOpen(false)
    setEditing(null)
    setFormError(null)
  }

  async function handleFormSubmit(payload) {
    setFormSubmitting(true)
    setFormError(null)
    setBannerError(null)
    try {
      if (modalMode === 'create') {
        await createInspection(payload)
      } else {
        await updateInspection(editing.inspection_id, payload)
      }
      setModalOpen(false)
      setEditing(null)
      await loadInspections()
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Could not save inspection.')
    } finally {
      setFormSubmitting(false)
    }
  }

  async function handleDelete(row) {
    const ok = window.confirm(
      `Delete inspection #${row.inspection_id}? This fails if a work order references it.`,
    )
    if (!ok) return
    setDeletingId(row.inspection_id)
    setBannerError(null)
    try {
      await deleteInspection(row.inspection_id)
      await loadInspections()
    } catch (e) {
      setBannerError(e instanceof ApiError ? e.message : 'Could not delete inspection.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Inspections"
        subtitle="One inspection per service request; links to an optional mechanic."
      >
        <Button onClick={openCreate}>New inspection</Button>
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
        <label htmlFor="insp-filter-mech" className="mb-1 block text-xs font-medium text-slate-600">
          Filter by mechanic
        </label>
        <select
          id="insp-filter-mech"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
          value={filterMechanicId}
          onChange={(e) => setFilterMechanicId(e.target.value)}
        >
          <option value="">All mechanics</option>
          <option value="__unassigned">Unassigned only</option>
          {mechanics.map((m) => (
            <option key={m.mechanic_id} value={String(m.mechanic_id)}>
              {m.mechanic_name}
            </option>
          ))}
        </select>
      </div>

      <InspectionTable
        rows={
          filterMechanicId === '__unassigned'
            ? inspections.filter((i) => i.mechanic_id == null)
            : inspections
        }
        requestLabelById={requestLabelById}
        mechanicNameById={mechanicNameById}
        loading={loading}
        loadError={loadError}
        deletingId={deletingId}
        hasAnyRows={inspections.length > 0}
        filterActive={filterMechanicId !== ''}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        title={modalMode === 'create' ? 'New inspection' : 'Edit inspection'}
        onClose={closeModal}
      >
        {formError ? (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</div>
        ) : null}
        <InspectionForm
          key={modalMode === 'edit' && editing ? editing.inspection_id : 'new'}
          mode={modalMode}
          serviceRequests={formRequestOptions}
          mechanics={mechanics}
          initialInspection={editing}
          submitting={formSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </>
  )
}
