import { apiClient } from '../../../lib/apiClient'

export async function fetchWorkOrders(params = {}) {
  const query = { skip: params.skip ?? 0, limit: params.limit ?? 500 }
  if (params.inspection_id != null && params.inspection_id !== '') {
    query.inspection_id = params.inspection_id
  }
  if (params.status != null && params.status !== '') {
    query.status = params.status
  }
  return apiClient.get('/api/v1/work-orders', { query })
}

/** Full work order with mechanics[] and parts[] */
export async function fetchWorkOrder(workOrderId) {
  return apiClient.get(`/api/v1/work-orders/${workOrderId}`)
}

export async function createWorkOrder(body) {
  return apiClient.post('/api/v1/work-orders', body)
}

export async function updateWorkOrder(workOrderId, body) {
  return apiClient.patch(`/api/v1/work-orders/${workOrderId}`, body)
}

export async function deleteWorkOrder(workOrderId) {
  return apiClient.delete(`/api/v1/work-orders/${workOrderId}`)
}

export async function assignWorkOrderMechanic(workOrderId, body) {
  return apiClient.post(`/api/v1/work-orders/${workOrderId}/mechanics`, body)
}

export async function updateWorkOrderMechanic(workOrderId, mechanicId, body) {
  return apiClient.patch(`/api/v1/work-orders/${workOrderId}/mechanics/${mechanicId}`, body)
}

export async function removeWorkOrderMechanic(workOrderId, mechanicId) {
  return apiClient.delete(`/api/v1/work-orders/${workOrderId}/mechanics/${mechanicId}`)
}

export async function addWorkOrderPart(workOrderId, body) {
  return apiClient.post(`/api/v1/work-orders/${workOrderId}/parts`, body)
}

export async function updateWorkOrderPart(workOrderId, partId, body) {
  return apiClient.patch(`/api/v1/work-orders/${workOrderId}/parts/${partId}`, body)
}

export async function removeWorkOrderPart(workOrderId, partId) {
  return apiClient.delete(`/api/v1/work-orders/${workOrderId}/parts/${partId}`)
}

export const workOrderService = {
  fetchWorkOrders,
  fetchWorkOrder,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  assignWorkOrderMechanic,
  updateWorkOrderMechanic,
  removeWorkOrderMechanic,
  addWorkOrderPart,
  updateWorkOrderPart,
  removeWorkOrderPart,
}

export default workOrderService
