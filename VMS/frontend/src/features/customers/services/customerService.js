import { apiClient } from '../../../lib/apiClient'

/**
 * List customers (pagination matches backend query params).
 * @param {{ skip?: number, limit?: number }} params
 * @returns {Promise<Array>}
 */
export async function fetchCustomers(params = {}) {
  const skip = params.skip ?? 0
  const limit = params.limit ?? 500
  return apiClient.get('/api/v1/customers', { query: { skip, limit } })
}

export async function fetchCustomer(customerId) {
  return apiClient.get(`/api/v1/customers/${customerId}`)
}

export async function createCustomer(body) {
  return apiClient.post('/api/v1/customers', body)
}

export async function updateCustomer(customerId, body) {
  return apiClient.patch(`/api/v1/customers/${customerId}`, body)
}

export async function deleteCustomer(customerId) {
  return apiClient.delete(`/api/v1/customers/${customerId}`)
}

export const customerService = {
  fetchCustomers,
  fetchCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
}

export default customerService
