import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import { ApiError } from '../../../lib/apiClient'
import useDebounce from '../../../hooks/useDebounce'
import MechanicForm from '../components/MechanicForm'
import MechanicTable from '../components/MechanicTable'
import {
  createMechanic,
  deleteMechanic,
  fetchMechanics,
  updateMechanic,
} from '../services/mechanicService'
import { fetchServiceCenters } from '../../serviceCenters/services/serviceCenterService'

export default function MechanicsPage() {
  const [centers, setCenters] = useState([])
  const [mechanics, setMechanics] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [centersError, setCentersError] = useState(null)

  const [filterCenterId, setFilterCenterId] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editing, setEditing] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [bannerError, setBannerError] = useState(null)

  const centersById = useMemo(() => {
    const map = {}
    for (const c of centers) map[c.center_id] = c
    return map
  }, [centers])

  const loadCenters = useCallback(async () => {
    setCentersError(null)
    try {
      const data = await fetchServiceCenters({ skip: 0, limit: 500 })
      setCenters(Array.isArray(data) ? data : [])
    } catch (e) {
      setCentersError(e instanceof ApiError ? e.message : 'Could not load service centers.')
      setCenters([])
    }
  }, [])

  const loadMechanics = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const params = { skip: 0, limit: 500 }
      if (filterCenterId !== '' && filterCenterId != null) {
        params.center_id = Number(filterCenterId)
      }
      const data = await fetchMechanics(params)
      setMechanics(Array.isArray(data) ? data : [])
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : 'Failed to load mechanics.')
      setMechanics([])
    } finally {
      setLoading(false)
    }
  }, [filterCenterId])

  useEffect(() => {
    loadCenters()
  }, [loadCenters])

  useEffect(() => {
    loadMechanics()
  }, [loadMechanics])

  const filteredRows = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return mechanics
    return mechanics.filter((m) => {
      const centerName = (centersById[m.center_id]?.center_name ?? '').toLowerCase()
      const blob = [
        m.mechanic_name,
        m.specialization,
        m.certification_level,
        centerName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [mechanics, debouncedSearch, centersById])

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
        await createMechanic(payload)
      } else {
        await updateMechanic(editing.mechanic_id, payload)
      }
      setModalOpen(false)
      setEditing(null)
      await loadMechanics()
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Could not save mechanic.')
    } finally {
      setFormSubmitting(false)
    }
  }

  async function handleDelete(row) {
    const ok = window.confirm(`Delete mechanic "${row.mechanic_name}"?`)
    if (!ok) return
    setDeletingId(row.mechanic_id)
    setBannerError(null)
    try {
      await deleteMechanic(row.mechanic_id)
      await loadMechanics()
    } catch (e) {
      setBannerError(e instanceof ApiError ? e.message : 'Could not delete mechanic.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <PageHeader title="Mechanics" subtitle="Staff assigned to service centers (mechanics.center_id).">
        <Button onClick={openCreate}>Add mechanic</Button>
      </PageHeader>

      {centersError ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          {centersError}
        </div>
      ) : null}

      {bannerError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {bannerError}
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="max-w-xs flex-1">
          <label htmlFor="mech-filter-center" className="mb-1 block text-xs font-medium text-slate-600">
            Filter by center
          </label>
          <select
            id="mech-filter-center"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
            value={filterCenterId}
            onChange={(e) => setFilterCenterId(e.target.value)}
            disabled={loading && centers.length === 0}
          >
            <option value="">All centers</option>
            {centers.map((c) => (
              <option key={c.center_id} value={String(c.center_id)}>
                {c.center_name}
              </option>
            ))}
          </select>
        </div>
        <div className="max-w-md flex-1">
          <label htmlFor="mech-search" className="mb-1 block text-xs font-medium text-slate-600">
            Search
          </label>
          <Input
            id="mech-search"
            type="search"
            placeholder="Name, specialization, center…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <MechanicTable
        rows={filteredRows}
        centersById={centersById}
        loading={loading}
        loadError={loadError}
        deletingId={deletingId}
        hasAnyRows={mechanics.length > 0}
        searchActive={Boolean(search.trim())}
        filterCenterActive={filterCenterId !== ''}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        title={modalMode === 'create' ? 'New mechanic' : 'Edit mechanic'}
        onClose={closeModal}
      >
        {formError ? (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</div>
        ) : null}
        <MechanicForm
          key={modalMode === 'edit' && editing ? editing.mechanic_id : 'new'}
          mode={modalMode}
          centers={centers}
          initialMechanic={editing}
          submitting={formSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </>
  )
}
