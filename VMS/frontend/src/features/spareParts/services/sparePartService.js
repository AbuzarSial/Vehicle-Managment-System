import { apiClient } from '../../../lib/apiClient'

export async function fetchSpareParts(params = {}) {
  return apiClient.get('/api/v1/spare-parts', {
    query: { skip: params.skip ?? 0, limit: params.limit ?? 500 },
  })
}

export async function fetchSparePart(partId) {
  return apiClient.get(`/api/v1/spare-parts/${partId}`)
}

export async function createSparePart(body) {
  return apiClient.post('/api/v1/spare-parts', body)
}

export async function updateSparePart(partId, body) {
  return apiClient.patch(`/api/v1/spare-parts/${partId}`, body)
}

export async function deleteSparePart(partId) {
  return apiClient.delete(`/api/v1/spare-parts/${partId}`)
}

export const sparePartService = {
  fetchSpareParts,
  fetchSparePart,
  createSparePart,
  updateSparePart,
  deleteSparePart,
}

export default sparePartService
