import { apiClient } from '../../../lib/apiClient'

export async function fetchInspections(params = {}) {
  const query = {
    skip: params.skip ?? 0,
    limit: params.limit ?? 500,
  }
  if (params.request_id != null && params.request_id !== '') {
    query.request_id = params.request_id
  }
  if (params.mechanic_id != null && params.mechanic_id !== '') {
    query.mechanic_id = params.mechanic_id
  }
  return apiClient.get('/api/v1/inspections', { query })
}

export async function fetchInspection(inspectionId) {
  return apiClient.get(`/api/v1/inspections/${inspectionId}`)
}

export async function createInspection(body) {
  return apiClient.post('/api/v1/inspections', body)
}

export async function updateInspection(inspectionId, body) {
  return apiClient.patch(`/api/v1/inspections/${inspectionId}`, body)
}

export async function deleteInspection(inspectionId) {
  return apiClient.delete(`/api/v1/inspections/${inspectionId}`)
}

export const inspectionService = {
  fetchInspections,
  fetchInspection,
  createInspection,
  updateInspection,
  deleteInspection,
}

export default inspectionService
