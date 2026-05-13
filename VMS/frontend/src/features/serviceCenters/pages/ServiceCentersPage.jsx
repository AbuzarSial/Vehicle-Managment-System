import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import { ApiError } from '../../../lib/apiClient'
import useDebounce from '../../../hooks/useDebounce'
import ServiceCenterForm from '../components/ServiceCenterForm'
import ServiceCenterTable from '../components/ServiceCenterTable'
import {
  createServiceCenter,
  deleteServiceCenter,
  fetchServiceCenters,
  updateServiceCenter,
} from '../services/serviceCenterService'

export default function ServiceCentersPage() {
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editing, setEditing] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [bannerError, setBannerError] = useState(null)

  const loadCenters = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await fetchServiceCenters({ skip: 0, limit: 500 })
      setCenters(Array.isArray(data) ? data : [])
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : 'Failed to load service centers.')
      setCenters([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCenters()
  }, [loadCenters])

  const filteredRows = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return centers
    return centers.filter((c) => {
      const blob = [c.center_name, c.city, c.phone, c.address].filter(Boolean).join(' ').toLowerCase()
      return blob.includes(q)
    })
  }, [centers, debouncedSearch])

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
        await createServiceCenter(payload)
      } else {
        await updateServiceCenter(editing.center_id, payload)
      }
      setModalOpen(false)
      setEditing(null)
      await loadCenters()
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Could not save center.')
    } finally {
      setFormSubmitting(false)
    }
  }

  async function handleDelete(row) {
    const ok = window.confirm(`Delete "${row.center_name}"? Mechanics or requests may block this.`)
    if (!ok) return
    setDeletingId(row.center_id)
    setBannerError(null)
    try {
      await deleteServiceCenter(row.center_id)
      await loadCenters()
    } catch (e) {
      setBannerError(e instanceof ApiError ? e.message : 'Could not delete center.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <PageHeader title="Service Centers" subtitle="Repair locations (service_centers table).">
        <Button onClick={openCreate}>Add center</Button>
      </PageHeader>

      {bannerError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {bannerError}
        </div>
      ) : null}

      <div className="mb-6 max-w-md">
        <label htmlFor="sc-search" className="mb-1 block text-xs font-medium text-slate-600">
          Search
        </label>
        <Input
          id="sc-search"
          type="search"
          placeholder="Name, city, phone, address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
        />
      </div>

      <ServiceCenterTable
        rows={filteredRows}
        loading={loading}
        loadError={loadError}
        deletingId={deletingId}
        hasAnyRows={centers.length > 0}
        searchActive={Boolean(search.trim())}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        title={modalMode === 'create' ? 'New service center' : 'Edit service center'}
        onClose={closeModal}
      >
        {formError ? (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</div>
        ) : null}
        <ServiceCenterForm
          key={modalMode === 'edit' && editing ? editing.center_id : 'new'}
          mode={modalMode}
          initialCenter={editing}
          submitting={formSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </>
  )
}
