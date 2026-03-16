import axiosInstance from './axiosInstance'

// Define types for API responses
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface User {
  id: string
  name: string
  email: string
}

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: User
}

// Auth API endpoints
export const authAPI = {
  login: (credentials: LoginRequest) =>
    axiosInstance.post<ApiResponse<LoginResponse>>('/auth/login', credentials),

  logout: () =>
    axiosInstance.post<ApiResponse<void>>('/auth/logout'),

  register: (data: Omit<User, 'id'> & { password: string }) =>
    axiosInstance.post<ApiResponse<LoginResponse>>('/auth/register', data),

  getCurrentUser: () =>
    axiosInstance.get<ApiResponse<User>>('/auth/me'),
}

// User API endpoints
export const userAPI = {
  getProfile: (userId: string) =>
    axiosInstance.get<ApiResponse<User>>(`/users/${userId}`),

  updateProfile: (userId: string, data: Partial<User>) =>
    axiosInstance.put<ApiResponse<User>>(`/users/${userId}`, data),

  getAll: () =>
    axiosInstance.get<ApiResponse<User[]>>('/users'),

  delete: (userId: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/users/${userId}`),
}

// Dashboard API endpoints
export const dashboardAPI = {
  getStats: () =>
    axiosInstance.get<ApiResponse<any>>('/dashboard/stats'),

  getChartData: () =>
    axiosInstance.get<ApiResponse<any>>('/dashboard/chart-data'),
}

export default axiosInstance
