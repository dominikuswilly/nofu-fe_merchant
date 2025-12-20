/**
 * API utility for making HTTP requests with authentication
 */

import { getToken, clearAuth } from './auth'
import { getEnv } from './config'

const BASE_URL = getEnv('VUE_APP_BACKEND_URL') || ''

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
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
  const url = `${BASE_URL}${endpoint}`
  
  // Make request
  try {
    const response = await fetch(url, {
      ...options,
      headers
    })
    
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
 * GET request
 */
export const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'GET'
  })
}

/**
 * POST request
 */
export const post = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * PUT request
 */
export const put = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

/**
 * DELETE request
 */
export const del = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'DELETE'
  })
}
