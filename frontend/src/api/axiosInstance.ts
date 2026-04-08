import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

// Get base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'authToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const ADMIN_USER_KEY = 'adminUser'

const clearAuthStorage = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(ADMIN_USER_KEY)
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor with error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // Handle different error status codes
    if (error.response) {
      const requestUrl = error.config?.url || ''
      const isAuthChallengeRequest =
        requestUrl.includes('/auth/admin-login') ||
        requestUrl.includes('/auth/admin-request-otp') ||
        requestUrl.includes('/auth/verify-otp') ||
        requestUrl.includes('/auth/login')

      switch (error.response.status) {
        case 401: {
          // Don't force redirect on failed login attempts.
          if (!isAuthChallengeRequest) {
            clearAuthStorage()
            window.location.href = '/admin'
          }
          break
        }
        case 403: {
          // Forbidden
          console.error('Access forbidden')
          break
        }
        case 404: {
          // Not found
          console.error('Resource not found')
          break
        }
        case 500: {
          // Server error
          console.error('Server error occurred')
          break
        }
        default: {
          console.error(`Error: ${error.response.status}`)
        }
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response received from server')
    } else {
      // Error in request setup
      console.error('Error setting up request:', error.message)
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
