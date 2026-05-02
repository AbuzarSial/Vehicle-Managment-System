import { apiClient } from '../../../lib/apiClient'

/**
 * Matches backend /api/v1/service-requests (snake_case bodies).
 */
export async function fetchServiceRequests(params = {}) {
  const query = {
    skip: params.skip ?? 0,
    limit: params.limit ?? 500,
  }
  if (params.vehicle_id != null && params.vehicle_id !== '') {
    query.vehicle_id = params.vehicle_id
  }
  if (params.center_id != null && params.center_id !== '') {
    query.center_id = params.center_id
  }
  if (params.status != null && params.status !== '') {
    query.status = params.status
  }
  return apiClient.get('/api/v1/service-requests', { query })
}

export async function fetchServiceRequest(requestId) {
  return apiClient.get(`/api/v1/service-requests/${requestId}`)
}

export async function createServiceRequest(body) {
  return apiClient.post('/api/v1/service-requests', body)
}

export async function updateServiceRequest(requestId, body) {
  return apiClient.patch(`/api/v1/service-requests/${requestId}`, body)
}

export async function deleteServiceRequest(requestId) {
  return apiClient.delete(`/api/v1/service-requests/${requestId}`)
}

export const serviceRequestService = {
  fetchServiceRequests,
  fetchServiceRequest,
  createServiceRequest,
  updateServiceRequest,
  deleteServiceRequest,
}

export default serviceRequestService
