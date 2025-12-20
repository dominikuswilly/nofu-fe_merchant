/**
 * Authentication utility functions
 * Manages token storage, retrieval, and validation
 */

const TOKEN_KEY = 'auth_token'
const TOKEN_EXPIRY_KEY = 'token_expiry'
const USER_KEY = 'user_data'

/**
 * Store authentication data after login
 * @param {Object} data - Login response data
 */
export const setAuthData = (data) => {
  if (data.token) {
    localStorage.setItem(TOKEN_KEY, data.token)
  }
  
  if (data.expiresAt) {
    localStorage.setItem(TOKEN_EXPIRY_KEY, data.expiresAt)
  }
  
  if (data.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  }
}

/**
 * Get the stored authentication token
 * @returns {string|null} The auth token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Get the stored user data
 * @returns {Object|null} The user object or null if not found
 */
export const getUser = () => {
  const userData = localStorage.getItem(USER_KEY)
  return userData ? JSON.parse(userData) : null
}

/**
 * Check if token is expired
 * @returns {boolean} True if token is expired or not found
 */
export const isTokenExpired = () => {
  const expiresAt = localStorage.getItem(TOKEN_EXPIRY_KEY)
  
  if (!expiresAt) {
    return true
  }
  
  const expiryDate = new Date(expiresAt)
  const now = new Date()
  
  return now >= expiryDate
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = getToken()
  
  if (!token) {
    return false
  }
  
  if (isTokenExpired()) {
    // Token expired, clear auth data
    clearAuth()
    return false
  }
  
  return true
}

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
  localStorage.removeItem(USER_KEY)
  // Also remove old merchant data if exists
  localStorage.removeItem('merchant')
}

/**
 * Get authorization header for API requests
 * @returns {Object} Headers object with Authorization
 */
export const getAuthHeaders = () => {
  const token = getToken()
  
  if (!token) {
    return {}
  }
  
  return {
    'Authorization': `Bearer ${token}`
  }
}
