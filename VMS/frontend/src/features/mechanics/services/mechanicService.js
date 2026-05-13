import { apiClient } from '../../../lib/apiClient'

export async function fetchMechanics(params = {}) {
  const query = { skip: params.skip ?? 0, limit: params.limit ?? 500 }
  if (params.center_id != null && params.center_id !== '') {
    query.center_id = params.center_id
  }
  return apiClient.get('/api/v1/mechanics', { query })
}

export async function fetchMechanic(mechanicId) {
  return apiClient.get(`/api/v1/mechanics/${mechanicId}`)
}

export async function createMechanic(body) {
  return apiClient.post('/api/v1/mechanics', body)
}

export async function updateMechanic(mechanicId, body) {
  return apiClient.patch(`/api/v1/mechanics/${mechanicId}`, body)
}

export async function deleteMechanic(mechanicId) {
  return apiClient.delete(`/api/v1/mechanics/${mechanicId}`)
}

export const mechanicService = {
  fetchMechanics,
  fetchMechanic,
  createMechanic,
  updateMechanic,
  deleteMechanic,
}

export default mechanicService
