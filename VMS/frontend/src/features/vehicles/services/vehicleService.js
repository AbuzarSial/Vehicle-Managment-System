import { apiClient } from '../../../lib/apiClient'

export async function fetchVehicles(params = {}) {
  const query = {
    skip: params.skip ?? 0,
    limit: params.limit ?? 500,
  }
  if (params.customer_id != null && params.customer_id !== '') {
    query.customer_id = params.customer_id
  }
  return apiClient.get('/api/v1/vehicles', { query })
}

export async function fetchVehicle(vehicleId) {
  return apiClient.get(`/api/v1/vehicles/${vehicleId}`)
}

export async function createVehicle(body) {
  return apiClient.post('/api/v1/vehicles', body)
}

export async function updateVehicle(vehicleId, body) {
  return apiClient.patch(`/api/v1/vehicles/${vehicleId}`, body)
}

export async function deleteVehicle(vehicleId) {
  return apiClient.delete(`/api/v1/vehicles/${vehicleId}`)
}

export const vehicleService = {
  fetchVehicles,
  fetchVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
}

export default vehicleService
