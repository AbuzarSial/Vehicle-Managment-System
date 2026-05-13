import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { ApiError } from '../../../lib/apiClient'
import useDebounce from '../../../hooks/useDebounce'
import CustomerFilters from '../components/CustomerFilters'
import CustomerForm from '../components/CustomerForm'
import CustomerTable from '../components/CustomerTable'
import {
  createCustomer,
  deleteCustomer,
  fetchCustomers,
  updateCustomer,
} from '../services/customerService'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const [deletingId, setDeletingId] = useState(null)
  const [bannerError, setBannerError] = useState(null)

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await fetchCustomers({ skip: 0, limit: 500 })
      setCustomers(Array.isArray(data) ? data : [])
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : 'Something went wrong while loading customers.'
      setLoadError(msg)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const filteredRows = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => {
      const name = (c.customer_name ?? '').toLowerCase()
      const email = (c.email ?? '').toLowerCase()
      const phone = c.phone ?? ''
      return name.includes(q) || email.includes(q) || phone.includes(q)
    })
  }, [customers, debouncedSearch])

  function openCreate() {
    setModalMode('create')
    setEditingCustomer(null)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(customer) {
    setModalMode('edit')
    setEditingCustomer(customer)
    setFormError(null)
    setModalOpen(true)
  }

  function closeModal() {
    if (formSubmitting) return
    setModalOpen(false)
    setEditingCustomer(null)
    setFormError(null)
  }

  async function handleFormSubmit(payload) {
    setFormSubmitting(true)
    setFormError(null)
    setBannerError(null)
    try {
      if (modalMode === 'create') {
        await createCustomer(payload)
      } else {
        await updateCustomer(editingCustomer.customer_id, payload)
      }
      setModalOpen(false)
      setEditingCustomer(null)
      await loadCustomers()
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : 'Could not save customer. Try again.'
      setFormError(msg)
    } finally {
      setFormSubmitting(false)
    }
  }

  async function handleDelete(customer) {
    const ok = window.confirm(
      `Delete customer "${customer.customer_name}"? This may fail if vehicles still reference them.`,
    )
    if (!ok) return

    setDeletingId(customer.customer_id)
    setBannerError(null)
    try {
      await deleteCustomer(customer.customer_id)
      await loadCustomers()
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : 'Could not delete customer.'
      setBannerError(msg)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Vehicle owners (sample addresses and contacts are Pakistan-style). Loads from GET /api/v1/customers."
      >
        <Button onClick={openCreate}>Add customer</Button>
      </PageHeader>

      {bannerError ? (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {bannerError}
        </div>
      ) : null}

      <div className="mb-6">
        <CustomerFilters value={search} onChange={setSearch} disabled={loading} />
      </div>

      <CustomerTable
        rows={filteredRows}
        loading={loading}
        loadError={loadError}
        deletingId={deletingId}
        hasAnyCustomers={customers.length > 0}
        searchActive={Boolean(search.trim())}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        title={modalMode === 'create' ? 'New customer' : 'Edit customer'}
        onClose={closeModal}
      >
        {formError ? (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</div>
        ) : null}
        <CustomerForm
          key={modalMode === 'edit' && editingCustomer ? editingCustomer.customer_id : 'create'}
          mode={modalMode}
          initialCustomer={editingCustomer}
          submitting={formSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </>
  )
}
