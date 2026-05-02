import { apiClient } from '../../../lib/apiClient'

export async function fetchServiceCenters(params = {}) {
  const skip = params.skip ?? 0
  const limit = params.limit ?? 500
  return apiClient.get('/api/v1/service-centers', { query: { skip, limit } })
}

export async function fetchServiceCenter(centerId) {
  return apiClient.get(`/api/v1/service-centers/${centerId}`)
}

export async function createServiceCenter(body) {
  return apiClient.post('/api/v1/service-centers', body)
}

export async function updateServiceCenter(centerId, body) {
  return apiClient.patch(`/api/v1/service-centers/${centerId}`, body)
}

export async function deleteServiceCenter(centerId) {
  return apiClient.delete(`/api/v1/service-centers/${centerId}`)
}

export const serviceCenterService = {
  fetchServiceCenters,
  fetchServiceCenter,
  createServiceCenter,
  updateServiceCenter,
  deleteServiceCenter,
}

export default serviceCenterService
