import axiosInstance from './axiosInstance'
import type {
  ApiResponse,
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserListQuery,
  UserListResponse,
  UpdateProfileRequest,
  DashboardStats,
  ChartData,
  AnalyticsPeriod,
} from '@/types'

// Export axiosInstance for use in services
export { axiosInstance }

// Auth API endpoints
export const authAPI = {
  adminRequestOTP: (payload: { identifier: string }) =>
    axiosInstance.post('/auth/admin-request-otp', payload),

  adminVerifyOTP: (payload: { temporary_id: string; otp: string; expectedRole: 'admin' }) =>
    axiosInstance.post('/auth/verify-otp', payload),

  adminLogin: (credentials: { identifier: string; password: string }) =>
    axiosInstance.post('/auth/admin-login', credentials),

  login: (credentials: LoginRequest) =>
    axiosInstance.post<ApiResponse<LoginResponse>>('/auth/login', credentials),

  logout: () =>
    axiosInstance.post<ApiResponse<void>>('/auth/logout'),

  register: (data: RegisterRequest) =>
    axiosInstance.post<ApiResponse<RegisterResponse>>('/auth/register', data),

  getCurrentUser: () =>
    axiosInstance.get<ApiResponse<User>>('/auth/me'),

  refreshToken: () =>
    axiosInstance.post<ApiResponse<{ token: string }>>('/auth/refresh'),
}

// User API endpoints
export const userAPI = {
  getProfile: (userId: string) =>
    axiosInstance.get<ApiResponse<User>>(`/users/${userId}`),

  updateProfile: (userId: string, data: UpdateProfileRequest) =>
    axiosInstance.put<ApiResponse<User>>(`/users/${userId}`, data),

  getAll: (query?: UserListQuery) =>
    axiosInstance.get<ApiResponse<UserListResponse>>('/users', { params: query }),

  delete: (userId: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/users/${userId}`),

  changePassword: (userId: string, passwords: { currentPassword: string; newPassword: string }) =>
    axiosInstance.post<ApiResponse<void>>(`/users/${userId}/change-password`, passwords),
}

// Dashboard API endpoints
export const dashboardAPI = {
  getStats: () =>
    axiosInstance.get<ApiResponse<DashboardStats>>('/dashboard/stats'),

  getChartData: (period?: AnalyticsPeriod) =>
    axiosInstance.get<ApiResponse<ChartData>>('/dashboard/chart-data', { params: period }),

  getMetrics: (startDate: string, endDate: string) =>
    axiosInstance.get<ApiResponse<any>>('/dashboard/metrics', {
      params: { startDate, endDate },
    }),
}

export const adminAPI = {
  getAllFines: () => axiosInstance.get('/admin/fines'),
}

export default axiosInstance
