import { apiClient } from '../../../lib/apiClient'

export async function fetchInventory(params = {}) {
  const query = { skip: params.skip ?? 0, limit: params.limit ?? 500 }
  if (params.center_id != null && params.center_id !== '') {
    query.center_id = params.center_id
  }
  if (params.low_stock_only) {
    query.low_stock_only = true
  }
  return apiClient.get('/api/v1/inventory', { query })
}

/** Same filter as SQL view vw_low_stock_parts (qty <= reorder). */
export async function fetchInventoryLowStock(params = {}) {
  return apiClient.get('/api/v1/inventory/low-stock', {
    query: { skip: params.skip ?? 0, limit: params.limit ?? 200 },
  })
}

export async function createInventoryRow(body) {
  return apiClient.post('/api/v1/inventory', body)
}

export async function updateInventoryRow(centerId, partId, body) {
  return apiClient.patch(`/api/v1/inventory/${centerId}/${partId}`, body)
}

export async function deleteInventoryRow(centerId, partId) {
  return apiClient.delete(`/api/v1/inventory/${centerId}/${partId}`)
}

export const inventoryService = {
  fetchInventory,
  fetchInventoryLowStock,
  createInventoryRow,
  updateInventoryRow,
  deleteInventoryRow,
}

export default inventoryService
