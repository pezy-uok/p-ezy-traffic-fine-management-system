import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

// Get base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

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
    const token = localStorage.getItem('authToken')
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
      switch (error.response.status) {
        case 401: {
          // Unauthorized - clear auth token and redirect to login
          localStorage.removeItem('authToken')
          window.location.href = '/login'
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
