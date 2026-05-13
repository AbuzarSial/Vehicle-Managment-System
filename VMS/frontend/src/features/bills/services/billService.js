import { apiClient } from '../../../lib/apiClient'

export async function fetchBills(params = {}) {
  const query = { skip: params.skip ?? 0, limit: params.limit ?? 500 }
  if (params.work_order_id != null && params.work_order_id !== '') {
    query.work_order_id = params.work_order_id
  }
  if (params.payment_status != null && params.payment_status !== '') {
    query.payment_status = params.payment_status
  }
  return apiClient.get('/api/v1/bills', { query })
}

export async function fetchBill(billId) {
  return apiClient.get(`/api/v1/bills/${billId}`)
}

export async function createBill(body) {
  return apiClient.post('/api/v1/bills', body)
}

export async function updateBill(billId, body) {
  return apiClient.patch(`/api/v1/bills/${billId}`, body)
}

export async function deleteBill(billId) {
  return apiClient.delete(`/api/v1/bills/${billId}`)
}

export const billService = {
  fetchBills,
  fetchBill,
  createBill,
  updateBill,
  deleteBill,
}

export default billService
