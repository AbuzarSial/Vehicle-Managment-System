/**
 * Thin fetch wrapper for the FastAPI backend (JSON in/out).
 * Base URL: VITE_API_BASE_URL (see .env.example).
 */

function getBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL
  const base =
    typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : 'http://127.0.0.1:5173'
  return base.replace(/\/$/, '')
}

export class ApiError extends Error {
  constructor(message, status, payload = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function formatDetail(payload) {
  if (!payload || typeof payload !== 'object') return 'Request failed'
  const { detail } = payload
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((e) => e.msg ?? JSON.stringify(e)).join('; ')
  }
  return JSON.stringify(detail)
}

/**
 * @param {string} method
 * @param {string} path - begins with /api/...
 * @param {{ body?: object, query?: Record<string, string|number> }} [opts]
 */
export async function apiRequest(method, path, opts = {}) {
  let url = `${getBaseUrl()}${path}`
  if (opts.query && Object.keys(opts.query).length > 0) {
    const q = new URLSearchParams()
    Object.entries(opts.query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) q.set(k, String(v))
    })
    url += `?${q.toString()}`
  }

  /** @type {RequestInit} */
  const init = {
    method,
    headers: {
      Accept: 'application/json',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
  }
  if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body)
  }

  let res
  try {
    res = await fetch(url, init)
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Network request failed'
    throw new ApiError(
      `Cannot reach API (${msg}). Start the backend on port 8000 and ensure VITE_API_BASE_URL matches your dev setup.`,
      0,
      null,
    )
  }

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { detail: text }
    }
  }

  if (!res.ok) {
    throw new ApiError(formatDetail(data), res.status, data)
  }

  if (res.status === 204) return null
  return data
}

export const apiClient = {
  get: (path, opts) => apiRequest('GET', path, opts),
  post: (path, body) => apiRequest('POST', path, { body }),
  patch: (path, body) => apiRequest('PATCH', path, { body }),
  delete: (path) => apiRequest('DELETE', path),
}

export default apiClient
