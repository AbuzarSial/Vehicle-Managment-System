import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import { ApiError } from '../../../lib/apiClient'
import useDebounce from '../../../hooks/useDebounce'
import { fetchServiceCenters } from '../../serviceCenters/services/serviceCenterService'
import InventoryRowForm from '../components/InventoryRowForm'
import InventoryTable from '../components/InventoryTable'
import SparePartForm from '../components/SparePartForm'
import SparePartTable from '../components/SparePartTable'
import {
  createInventoryRow,
  deleteInventoryRow,
  fetchInventory,
  fetchInventoryLowStock,
  updateInventoryRow,
} from '../services/inventoryService'
import {
  createSparePart,
  deleteSparePart,
  fetchSpareParts,
  updateSparePart,
} from '../services/sparePartService'

const LIST_LIMIT = 500

export default function SparePartsPage() {
  const [parts, setParts] = useState([])
  const [centers, setCenters] = useState([])
  const [inventoryRows, setInventoryRows] = useState([])
  const [lowStockRows, setLowStockRows] = useState([])

  const [partsLoading, setPartsLoading] = useState(true)
  const [invLoading, setInvLoading] = useState(false)
  const [lowStockLoading, setLowStockLoading] = useState(true)
  const [lookupsLoading, setLookupsLoading] = useState(true)

  const [partsError, setPartsError] = useState(null)
  const [invError, setInvError] = useState(null)
  const [lowStockError, setLowStockError] = useState(null)
  const [lookupError, setLookupError] = useState(null)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const [centerId, setCenterId] = useState('')

  const [catalogModal, setCatalogModal] = useState(false)
  const [catalogMode, setCatalogMode] = useState('create')
  const [editingPart, setEditingPart] = useState(null)
  const [catalogSubmitting, setCatalogSubmitting] = useState(false)
  const [catalogFormError, setCatalogFormError] = useState(null)
  const [deletingPartId, setDeletingPartId] = useState(null)

  const [invModalMode, setInvModalMode] = useState(null)
  const [invEditRow, setInvEditRow] = useState(null)
  const [invSubmitting, setInvSubmitting] = useState(false)
  const [invFormError, setInvFormError] = useState(null)
  const [deletingInvKey, setDeletingInvKey] = useState(null)

  const [bannerError, setBannerError] = useState(null)

  const loadParts = useCallback(async () => {
    setPartsLoading(true)
    setPartsError(null)
    try {
      const data = await fetchSpareParts({ skip: 0, limit: LIST_LIMIT })
      setParts(Array.isArray(data) ? data : [])
    } catch (e) {
      setPartsError(e instanceof ApiError ? e.message : 'Failed to load catalog.')
      setParts([])
    } finally {
      setPartsLoading(false)
    }
  }, [])

  const loadCenters = useCallback(async () => {
    setLookupError(null)
    try {
      const data = await fetchServiceCenters({ skip: 0, limit: LIST_LIMIT })
      setCenters(Array.isArray(data) ? data : [])
    } catch (e) {
      setLookupError(e instanceof ApiError ? e.message : 'Could not load service centers.')
      setCenters([])
    } finally {
      setLookupsLoading(false)
    }
  }, [])

  const loadLowStock = useCallback(async () => {
    setLowStockLoading(true)
    setLowStockError(null)
    try {
      const data = await fetchInventoryLowStock({ limit: 200 })
      setLowStockRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setLowStockError(e instanceof ApiError ? e.message : 'Failed to load low-stock data.')
      setLowStockRows([])
    } finally {
      setLowStockLoading(false)
    }
  }, [])

  const loadInventoryForCenter = useCallback(async (cid) => {
    if (!cid) {
      setInventoryRows([])
      return
    }
    setInvLoading(true)
    setInvError(null)
    try {
      const data = await fetchInventory({ center_id: Number(cid), skip: 0, limit: LIST_LIMIT })
      setInventoryRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setInvError(e instanceof ApiError ? e.message : 'Failed to load inventory.')
      setInventoryRows([])
    } finally {
      setInvLoading(false)
    }
  }, [])

  useEffect(() => {
    loadParts()
    loadCenters()
    loadLowStock()
  }, [loadParts, loadCenters, loadLowStock])

  useEffect(() => {
    loadInventoryForCenter(centerId)
  }, [centerId, loadInventoryForCenter])

  const filteredParts = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return parts
    return parts.filter((p) => {
      const blob = [p.part_name, p.brand, String(p.part_id)].filter(Boolean).join(' ').toLowerCase()
      return blob.includes(q)
    })
  }, [parts, debouncedSearch])

  const existingPartIdsAtCenter = useMemo(
    () => new Set(inventoryRows.map((r) => r.part_id)),
    [inventoryRows],
  )

  function openCreatePart() {
    setCatalogMode('create')
    setEditingPart(null)
    setCatalogFormError(null)
    setCatalogModal(true)
  }

  function openEditPart(p) {
    setCatalogMode('edit')
    setEditingPart(p)
    setCatalogFormError(null)
    setCatalogModal(true)
  }

  function closeCatalogModal() {
    if (catalogSubmitting) return
    setCatalogModal(false)
    setEditingPart(null)
    setCatalogFormError(null)
  }

  async function handleCatalogSubmit(payload) {
    setCatalogSubmitting(true)
    setCatalogFormError(null)
    setBannerError(null)
    try {
      if (catalogMode === 'create') {
        await createSparePart(payload)
      } else {
        await updateSparePart(editingPart.part_id, payload)
      }
      closeCatalogModal()
      await loadParts()
      await loadLowStock()
    } catch (e) {
      setCatalogFormError(e instanceof ApiError ? e.message : 'Could not save part.')
    } finally {
      setCatalogSubmitting(false)
    }
  }

  async function handleDeletePart(p) {
    if (!window.confirm(`Delete part "${p.part_name}"? Fails if used on work orders or inventory.`)) return
    setDeletingPartId(p.part_id)
    setBannerError(null)
    try {
      await deleteSparePart(p.part_id)
      await loadParts()
      await loadLowStock()
      if (centerId) await loadInventoryForCenter(centerId)
    } catch (e) {
      setBannerError(e instanceof ApiError ? e.message : 'Could not delete part.')
    } finally {
      setDeletingPartId(null)
    }
  }

  function openAddInventory() {
    if (!centerId) return
    setInvModalMode('add')
    setInvEditRow(null)
    setInvFormError(null)
  }

  function openEditInventory(row) {
    setInvModalMode('edit')
    setInvEditRow(row)
    setInvFormError(null)
  }

  function closeInvModal() {
    if (invSubmitting) return
    setInvModalMode(null)
    setInvEditRow(null)
    setInvFormError(null)
  }

  async function handleInvSubmit(payload) {
    setInvSubmitting(true)
    setInvFormError(null)
    setBannerError(null)
    try {
      if (invModalMode === 'add') {
        await createInventoryRow(payload)
      } else {
        await updateInventoryRow(invEditRow.center_id, invEditRow.part_id, payload)
      }
      closeInvModal()
      await loadInventoryForCenter(centerId)
      await loadLowStock()
    } catch (e) {
      setInvFormError(e instanceof ApiError ? e.message : 'Could not save inventory row.')
    } finally {
      setInvSubmitting(false)
    }
  }

  async function handleDeleteInventory(row) {
    if (!window.confirm(`Remove "${row.part_name}" from this center’s inventory?`)) return
    const key = `${row.center_id}-${row.part_id}`
    setDeletingInvKey(key)
    setBannerError(null)
    try {
      await deleteInventoryRow(row.center_id, row.part_id)
      await loadInventoryForCenter(centerId)
      await loadLowStock()
    } catch (e) {
      setBannerError(e instanceof ApiError ? e.message : 'Could not remove row.')
    } finally {
      setDeletingInvKey(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Spare parts & inventory"
        subtitle="Catalog (spare_parts) and per–service center stock (service_center_inventory)."
      >
        <Button onClick={openCreatePart}>Add part</Button>
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

      <Card
        className="mb-8"
        title="Low stock (all centers)"
        subtitle="Rows where quantity on hand ≤ reorder level"
        badge={
          lowStockLoading ? (
            <Badge>Loading…</Badge>
          ) : lowStockError ? (
            <Badge variant="danger">Error</Badge>
          ) : lowStockRows.length > 0 ? (
            <Badge variant="warning">{lowStockRows.length} SKU</Badge>
          ) : (
            <Badge variant="success">None</Badge>
          )
        }
      >
        {lowStockError ? (
          <p className="text-sm text-red-600">{lowStockError}</p>
        ) : lowStockLoading ? (
          <p className="text-sm text-slate-500">Loading low-stock list…</p>
        ) : lowStockRows.length === 0 ? (
          <p className="text-sm text-slate-600">No parts are at or below their reorder level.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-medium uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Center</th>
                  <th className="py-2 pr-4">Part</th>
                  <th className="py-2 pr-4">On hand</th>
                  <th className="py-2 pr-4">Reorder</th>
                  <th className="py-2">Shelf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockRows.map((row) => (
                  <tr key={`${row.center_id}-${row.part_id}`}>
                    <td className="py-2 pr-4 font-medium text-slate-900">{row.center_name}</td>
                    <td className="py-2 pr-4 text-slate-700">
                      {row.part_name}
                      {row.brand ? <span className="text-xs text-slate-500"> · {row.brand}</span> : null}
                    </td>
                    <td className="py-2 pr-4 text-amber-800">{row.quantity_on_hand}</td>
                    <td className="py-2 pr-4 text-slate-600">{row.reorder_level}</td>
                    <td className="py-2 text-slate-600">{row.shelf_location ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <section className="mb-10">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Parts catalog</h2>
        <div className="mb-4 max-w-md">
          <label htmlFor="part-search" className="mb-1 block text-xs font-medium text-slate-600">
            Search catalog
          </label>
          <Input
            id="part-search"
            type="search"
            placeholder="Name, brand, ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={partsLoading}
          />
        </div>
        <SparePartTable
          rows={filteredParts}
          loading={partsLoading}
          loadError={partsError}
          deletingId={deletingPartId}
          hasAnyRows={parts.length > 0}
          searchActive={Boolean(search.trim())}
          onEdit={openEditPart}
          onDelete={handleDeletePart}
        />
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Inventory by service center</h2>
            <p className="mt-1 text-sm text-slate-500">
              Stock levels per center — composite key (center_id, part_id).
            </p>
          </div>
          <Button onClick={openAddInventory} disabled={!centerId || lookupsLoading}>
            Add stock row
          </Button>
        </div>

        <div className="mb-4 max-w-md">
          <label htmlFor="inv-center" className="mb-1 block text-xs font-medium text-slate-600">
            Service center
          </label>
          <select
            id="inv-center"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            value={centerId}
            onChange={(e) => setCenterId(e.target.value)}
            disabled={lookupsLoading}
          >
            <option value="">Select center…</option>
            {centers.map((c) => (
              <option key={c.center_id} value={String(c.center_id)}>
                {c.center_name}
              </option>
            ))}
          </select>
        </div>

        <InventoryTable
          rows={inventoryRows}
          loading={invLoading}
          loadError={invError}
          centerSelected={Boolean(centerId)}
          deletingKey={deletingInvKey}
          onEdit={openEditInventory}
          onDelete={handleDeleteInventory}
        />
      </section>

      <Modal isOpen={catalogModal} title={catalogMode === 'create' ? 'New part' : 'Edit part'} onClose={closeCatalogModal}>
        {catalogFormError ? (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{catalogFormError}</div>
        ) : null}
        <SparePartForm
          key={catalogMode === 'edit' && editingPart ? editingPart.part_id : 'new'}
          mode={catalogMode}
          initialPart={editingPart}
          submitting={catalogSubmitting}
          onSubmit={handleCatalogSubmit}
          onCancel={closeCatalogModal}
        />
      </Modal>

      <Modal
        isOpen={invModalMode !== null}
        title={invModalMode === 'add' ? 'Add inventory row' : 'Edit inventory'}
        onClose={closeInvModal}
      >
        {invFormError ? (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{invFormError}</div>
        ) : null}
        {invModalMode && centerId ? (
          <InventoryRowForm
            key={invModalMode === 'edit' && invEditRow ? `${invEditRow.part_id}` : 'add'}
            mode={invModalMode === 'add' ? 'create' : 'edit'}
            centerId={Number(centerId)}
            partCatalog={parts}
            existingPartIds={existingPartIdsAtCenter}
            initialRow={invEditRow}
            submitting={invSubmitting}
            onSubmit={handleInvSubmit}
            onCancel={closeInvModal}
          />
        ) : null}
      </Modal>
    </>
  )
}
