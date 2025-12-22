/**
 * API utility for making HTTP requests with authentication
 */

import { getToken, clearAuth } from './auth'
import { getEnv } from './config'

const BASE_URL = getEnv('VUE_APP_BACKEND_URL') || ''
const CUSTOMER_BASE_URL = getEnv('VUE_APP_CUSTOMER_API_URL') || `${BASE_URL}/customer`
const PRODUCT_BASE_URL = getEnv('VUE_APP_PRODUCT_API_URL') || `${BASE_URL}/product`

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @param {string} customBaseUrl - Optional custom base URL
 * @returns {Promise} Response data
 */
export const apiRequest = async (endpoint, options = {}, customBaseUrl = null) => {
  const token = getToken()
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // Build full URL
  const baseUrl = customBaseUrl || BASE_URL
  const url = `${baseUrl}${endpoint}`
  
  // Make request
  try {
    const response = await fetch(url, {
      ...options,
      headers
    })
// ... existing code ...
    // Handle unauthorized (token expired or invalid)
    if (response.status === 401) {
      clearAuth()
      window.location.href = '/login'
      throw new Error('Unauthorized - redirecting to login')
    }
    
    // Check content type
    const contentType = response.headers.get('content-type')
    
    if (!response.ok) {
      // Try to get error message from JSON response
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.responseMessage || `Request failed with status ${response.status}`)
      } else {
        throw new Error(`Request failed with status ${response.status}`)
      }
    }
    
    // Parse response
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      return await response.text()
    }
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

/**
 * Create a service-specific API instance
 */
const createService = (baseUrl) => ({
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }, baseUrl),
  post: (endpoint, data, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }, baseUrl),
  put: (endpoint, data, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }, baseUrl),
  del: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }, baseUrl),
})

export const customerApi = createService(CUSTOMER_BASE_URL)
export const productApi = createService(PRODUCT_BASE_URL)

/**
 * Default exports for backward compatibility (using BASE_URL)
 */
export const get = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' })
export const post = (endpoint, data, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) })
export const put = (endpoint, data, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) })
export const del = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' })
