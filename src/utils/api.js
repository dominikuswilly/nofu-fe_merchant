/**
 * API utility for making HTTP requests with authentication
 */

import { getToken, clearAuth } from './auth'
import { getEnv } from './config'

// ---- Base URLs -------------------------------------------------------------

const BASE_URL = getEnv('VUE_APP_BACKEND_URL') || ''
const CUSTOMER_BASE_URL =
  getEnv('VUE_APP_CUSTOMER_API_URL') || `${BASE_URL}/customer`
const PRODUCT_BASE_URL =
  getEnv('VUE_APP_PRODUCT_API_URL') || `${BASE_URL}/product`
const TRANSACTION_BASE_URL =
  getEnv('VUE_APP_TRANSACTION_API_URL') || `${BASE_URL}/transaction`

if (process.env.NODE_ENV !== 'production') {
  console.log('API Configuration:', {
    BASE_URL,
    CUSTOMER_BASE_URL,
    PRODUCT_BASE_URL,
    TRANSACTION_BASE_URL,
  })
}

// ---- Core request helper ---------------------------------------------------

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (starting with /)
 * @param {RequestInit} options - Fetch options
 * @param {string|null} customBaseUrl - Optional custom base URL
 * @returns {Promise<any>} Parsed response
 */
export const apiRequest = async (
  endpoint,
  options = {},
  customBaseUrl = null
) => {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const baseUrl = customBaseUrl || BASE_URL
  const url = `${baseUrl}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle unauthorized
    if (response.status === 401) {
      clearAuth()
      window.location.href = '/login'
      throw new Error('Unauthorized - redirecting to login')
    }

    const contentType = response.headers.get('content-type') || ''

    // Non-OK responses: try to extract message
    if (!response.ok) {
      let message = `Request failed with status ${response.status}`

      if (contentType.includes('application/json')) {
        try {
          const errorData = await response.json()
          message =
            errorData.message ||
            errorData.responseMessage ||
            message
        } catch {
          // ignore JSON parse error, keep default message
        }
      } else {
        try {
          const text = await response.text()
          if (text) message = text
        } catch {
          // ignore text read error
        }
      }

      throw new Error(message)
    }

    // OK responses: parse body if present
    if (contentType.includes('application/json')) {
      return response.json()
    }

    // No/unknown content-type: best-effort text, may be empty
    return response.text()
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

// ---- Service factory -------------------------------------------------------

/**
 * Create a service-specific API instance
 */
export const createService = (baseUrl) => {
  const request = (method, endpoint, data, options = {}) =>
    apiRequest(
      endpoint,
      {
        ...options,
        method,
        body:
          data !== undefined && data !== null
            ? JSON.stringify(data)
            : undefined,
      },
      baseUrl
    )

  return {
    get: (endpoint, options) => request('GET', endpoint, null, options),
    post: (endpoint, data, options) => request('POST', endpoint, data, options),
    put: (endpoint, data, options) => request('PUT', endpoint, data, options),
    patch: (endpoint, data, options) => request('PATCH', endpoint, data, options),
    del: (endpoint, options) => request('DELETE', endpoint, null, options),
  }
}

// ---- Preconfigured services -----------------------------------------------

export const customerApi = createService(CUSTOMER_BASE_URL)
export const productApi = createService(PRODUCT_BASE_URL)
export const transactionApi = createService(TRANSACTION_BASE_URL)

// ---- Backward-compatible root-level helpers -------------------------------

export const get = (endpoint, options = {}) =>
  apiRequest(endpoint, { ...options, method: 'GET' })

export const post = (endpoint, data, options = {}) =>
  apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  })

export const put = (endpoint, data, options = {}) =>
  apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const patch = (endpoint, data, options = {}) =>
  apiRequest(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const del = (endpoint, options = {}) =>
  apiRequest(endpoint, { ...options, method: 'DELETE' })
