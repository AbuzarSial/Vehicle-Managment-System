import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import { ApiError } from '../../../lib/apiClient'
import useDebounce from '../../../hooks/useDebounce'
import { fetchWorkOrders } from '../../workOrders/services/workOrderService'
import BillForm from '../components/BillForm'
import BillTable from '../components/BillTable'
import { PAYMENT_STATUS_OPTIONS } from '../lib/paymentStatusDisplay'
import { createBill, deleteBill, fetchBills, updateBill } from '../services/billService'

const LIST_LIMIT = 500

export default function BillsPage() {
  const [bills, setBills] = useState([])
  const [workOrders, setWorkOrders] = useState([])

  const [loading, setLoading] = useState(true)
  const [woLoading, setWoLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [woError, setWoError] = useState(null)

  const [filterPayment, setFilterPayment] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingBill, setEditingBill] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const [deletingId, setDeletingId] = useState(null)
  const [bannerError, setBannerError] = useState(null)

  const billedWorkOrderIds = useMemo(() => new Set(bills.map((b) => b.work_order_id)), [bills])

  const workOrderOptionsCreate = useMemo(() => {
    return workOrders
      .filter((wo) => !billedWorkOrderIds.has(wo.work_order_id))
      .map((wo) => ({
        ...wo,
        _label: `WO #${wo.work_order_id} · inspection ${wo.inspection_id} · ${wo.status}`,
      }))
  }, [workOrders, billedWorkOrderIds])

  const workOrderOptionsEdit = useMemo(() => {
    if (!editingBill) return []
    const wo = workOrders.find((w) => w.work_order_id === editingBill.work_order_id)
    if (!wo) {
      return [
        {
          work_order_id: editingBill.work_order_id,
          inspection_id: null,
          status: '',
          _label: `WO #${editingBill.work_order_id}`,
        },
      ]
    }
    return [
      {
        ...wo,
        _label: `WO #${wo.work_order_id} · inspection ${wo.inspection_id} · ${wo.status}`,
      },
    ]
  }, [editingBill, workOrders])

  const loadBills = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const params = { skip: 0, limit: LIST_LIMIT }
      if (filterPayment) params.payment_status = filterPayment
      const data = await fetchBills(params)
      setBills(Array.isArray(data) ? data : [])
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : 'Failed to load bills.')
      setBills([])
    } finally {
      setLoading(false)
    }
  }, [filterPayment])

  const loadWorkOrders = useCallback(async () => {
    setWoLoading(true)
    setWoError(null)
    try {
      const data = await fetchWorkOrders({ skip: 0, limit: LIST_LIMIT })
      setWorkOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      setWoError(e instanceof ApiError ? e.message : 'Failed to load work orders.')
      setWorkOrders([])
    } finally {
      setWoLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWorkOrders()
  }, [loadWorkOrders])

  useEffect(() => {
    loadBills()
  }, [loadBills])

  const filteredRows = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return bills
    return bills.filter((b) => {
      const blob = [
        String(b.bill_id),
        String(b.work_order_id),
        String(b.total_amount),
        b.payment_status,
      ]
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [bills, debouncedSearch])

  function openCreate() {
    setModalMode('create')
    setEditingBill(null)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(row) {
    setModalMode('edit')
    setEditingBill(row)
    setFormError(null)
    setModalOpen(true)
  }

  function closeModal() {
    if (formSubmitting) return
    setModalOpen(false)
    setEditingBill(null)
    setFormError(null)
  }

  async function handleFormSubmit(payload) {
    setFormSubmitting(true)
    setFormError(null)
    setBannerError(null)
    try {
      if (modalMode === 'create') {
        await createBill(payload)
      } else {
        await updateBill(editingBill.bill_id, payload)
      }
      setModalOpen(false)
      setEditingBill(null)
      await loadBills()
      await loadWorkOrders()
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Could not save bill.')
    } finally {
      setFormSubmitting(false)
    }
  }

  async function handleDelete(row) {
    const ok = window.confirm(`Delete bill #${row.bill_id}? You can recreate billing for WO #${row.work_order_id} later.`)
    if (!ok) return
    setDeletingId(row.bill_id)
    setBannerError(null)
    try {
      await deleteBill(row.bill_id)
      await loadBills()
      await loadWorkOrders()
    } catch (e) {
      setBannerError(e instanceof ApiError ? e.message : 'Could not delete bill.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Bills"
        subtitle="One bill per work order — payment status drives collections reporting."
      >
        <Button onClick={openCreate} disabled={woLoading}>
          New bill
        </Button>
      </PageHeader>

      {woError ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          {woError}
        </div>
      ) : null}

      {bannerError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {bannerError}
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="max-w-xs flex-1">
          <label htmlFor="bill-filter-pay" className="mb-1 block text-xs font-medium text-slate-600">
            Payment status
          </label>
          <select
            id="bill-filter-pay"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            <option value="">All</option>
            {PAYMENT_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="max-w-md flex-1">
          <label htmlFor="bill-search" className="mb-1 block text-xs font-medium text-slate-600">
            Search
          </label>
          <Input
            id="bill-search"
            type="search"
            placeholder="Bill #, work order, amount, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <BillTable
        rows={filteredRows}
        loading={loading}
        loadError={loadError}
        deletingId={deletingId}
        hasAnyRows={bills.length > 0}
        filterActive={Boolean(filterPayment) || Boolean(search.trim())}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        title={modalMode === 'create' ? 'New bill' : `Edit bill #${editingBill?.bill_id ?? ''}`}
        onClose={closeModal}
      >
        {formError ? (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</div>
        ) : null}
        <BillForm
          key={modalMode === 'edit' && editingBill ? editingBill.bill_id : 'new'}
          mode={modalMode}
          workOrderOptions={modalMode === 'create' ? workOrderOptionsCreate : workOrderOptionsEdit}
          initialBill={editingBill}
          submitting={formSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </>
  )
}
