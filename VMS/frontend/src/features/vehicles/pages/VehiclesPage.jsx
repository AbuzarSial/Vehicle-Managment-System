import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { ApiError } from '../../../lib/apiClient'
import { fetchCustomers } from '../../customers/services/customerService'
import VehicleForm from '../components/VehicleForm'
import VehicleTable from '../components/VehicleTable'
import {
  createVehicle,
  deleteVehicle,
  fetchVehicles,
  updateVehicle,
} from '../services/vehicleService'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [customers, setCustomers] = useState([])
  const [vehiclesLoading, setVehiclesLoading] = useState(true)
  const [customersLoading, setCustomersLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [filterCustomerId, setFilterCustomerId] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const [deletingId, setDeletingId] = useState(null)
  const [bannerError, setBannerError] = useState(null)

  const customerLabelById = useMemo(() => {
    const m = new Map()
    customers.forEach((c) => {
      m.set(c.customer_id, c.customer_name ?? `Customer #${c.customer_id}`)
    })
    return m
  }, [customers])

  const loadCustomers = useCallback(async () => {
    setCustomersLoading(true)
    try {
      const data = await fetchCustomers({ skip: 0, limit: 500 })
      setCustomers(Array.isArray(data) ? data : [])
    } catch {
      setCustomers([])
    } finally {
      setCustomersLoading(false)
    }
  }, [])

  const loadVehicles = useCallback(async () => {
    setVehiclesLoading(true)
    setLoadError(null)
    try {
      const params = { skip: 0, limit: 500 }
      if (filterCustomerId) params.customer_id = Number(filterCustomerId)
      const data = await fetchVehicles(params)
      setVehicles(Array.isArray(data) ? data : [])
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : 'Something went wrong while loading vehicles.'
      setLoadError(msg)
      setVehicles([])
    } finally {
      setVehiclesLoading(false)
    }
  }, [filterCustomerId])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  function openCreate() {
    setModalMode('create')
    setEditingVehicle(null)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(v) {
    setModalMode('edit')
    setEditingVehicle(v)
    setFormError(null)
    setModalOpen(true)
  }

  function closeModal() {
    if (formSubmitting) return
    setModalOpen(false)
    setEditingVehicle(null)
    setFormError(null)
  }

  async function handleFormSubmit(payload) {
    setFormSubmitting(true)
    setFormError(null)
    setBannerError(null)
    try {
      if (modalMode === 'create') {
        await createVehicle(payload)
      } else {
        await updateVehicle(editingVehicle.vehicle_id, payload)
      }
      setModalOpen(false)
      setEditingVehicle(null)
      await loadVehicles()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not save vehicle. Try again.'
      setFormError(msg)
    } finally {
      setFormSubmitting(false)
    }
  }

  async function handleDelete(v) {
    const ok = window.confirm(
      `Delete vehicle ${v.registration_no}? This fails if service requests still reference it.`,
    )
    if (!ok) return

    setDeletingId(v.vehicle_id)
    setBannerError(null)
    try {
      await deleteVehicle(v.vehicle_id)
      await loadVehicles()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not delete vehicle.'
      setBannerError(msg)
    } finally {
      setDeletingId(null)
    }
  }

  const sortedCustomersForFilter = useMemo(
    () =>
      [...customers].sort((a, b) =>
        (a.customer_name ?? '').localeCompare(b.customer_name ?? ''),
      ),
    [customers],
  )

  return (
    <>
      <PageHeader
        title="Vehicles"
        subtitle="Supertype in vehicles; optional car / motorcycle / truck rows hold subtype-specific fields."
      >
        <Button onClick={openCreate} disabled={customersLoading || customers.length === 0}>
          Add vehicle
        </Button>
      </PageHeader>

      {bannerError ? (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {bannerError}
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="max-w-xs flex-1">
          <label htmlFor="vehicle-filter-customer" className="mb-1 block text-xs font-medium text-slate-600">
            Filter by owner
          </label>
          <select
            id="vehicle-filter-customer"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={filterCustomerId}
            onChange={(e) => setFilterCustomerId(e.target.value)}
            disabled={vehiclesLoading}
          >
            <option value="">All customers</option>
            {sortedCustomersForFilter.map((c) => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.customer_name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-500 sm:pb-2">
          Uses GET /api/v1/vehicles?customer_id=… when a customer is selected.
        </p>
      </div>

      <VehicleTable
        rows={vehicles}
        customerLabelById={customerLabelById}
        loading={vehiclesLoading}
        loadError={loadError}
        deletingId={deletingId}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        title={modalMode === 'create' ? 'New vehicle' : 'Edit vehicle'}
        onClose={closeModal}
      >
        {formError ? (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</div>
        ) : null}
        <VehicleForm
          key={modalMode === 'edit' && editingVehicle ? editingVehicle.vehicle_id : 'create'}
          mode={modalMode}
          initialVehicle={editingVehicle}
          customerOptions={customers}
          customersLoading={customersLoading}
          submitting={formSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </>
  )
}
