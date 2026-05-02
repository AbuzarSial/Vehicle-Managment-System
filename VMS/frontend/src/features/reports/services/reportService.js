import { apiClient } from '../../../lib/apiClient'

/**
 * @returns {Promise<{
 *   total_customers: number,
 *   total_vehicles: number,
 *   open_service_requests: number,
 *   ongoing_work_orders: number,
 *   pending_bills: number,
 *   low_stock_skus: number
 * }>}
 */
export async function fetchDashboardSummary() {
  return apiClient.get('/api/v1/reports/dashboard-summary')
}

/**
 * @param {{ limit?: number }} params
 * @returns {Promise<Array>}
 */
export async function fetchPendingBillsReport(params = {}) {
  const limit = params.limit ?? 50
  return apiClient.get('/api/v1/reports/pending-bills', { query: { limit } })
}

/**
 * @param {{ limit?: number, status?: string, center_id?: number }} params
 * @returns {Promise<Array>}
 */
export async function fetchServiceRequestPipeline(params = {}) {
  const query = { limit: params.limit ?? 50 }
  if (params.status) query.status = params.status
  if (params.center_id != null && params.center_id !== '') query.center_id = Number(params.center_id)
  return apiClient.get('/api/v1/reports/service-request-pipeline', { query })
}
