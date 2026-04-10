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
  AdminDashboardStats,
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

  updateFine: (fineId: string, payload: { violation?: string; amount?: number; date?: string; status?: 'paid' | 'pending' | 'overdue' }) =>
    axiosInstance.patch(`/admin/fines/${fineId}`, payload),

  deleteFine: (fineId: string) =>
    axiosInstance.delete(`/admin/fines/${fineId}`),

  getAllCriminals: () => axiosInstance.get('/admin/criminals'),

  getCriminalById: (criminalId: string) => axiosInstance.get(`/admin/criminals/${criminalId}`),

  createCriminal: (payload: {
    first_name: string
    last_name: string
    date_of_birth?: string | null
    gender?: string | null
    physical_description?: string | null
    identification_number?: string | null
    status?: 'active' | 'inactive' | 'deceased' | 'deported' | 'arrested'
    wanted?: boolean
    danger_level?: string | null
    known_aliases?: string[] | string | null
    arrested_before?: boolean
    arrest_count?: number
  }, image?: File | null) => {
    if (!image) {
      return axiosInstance.post('/admin/criminals/create', payload)
    }

    const formData = new FormData()
    formData.append('first_name', payload.first_name)
    formData.append('last_name', payload.last_name)
    formData.append('status', payload.status || 'active')
    formData.append('wanted', String(Boolean(payload.wanted)))
    formData.append('danger_level', payload.danger_level || '')
    formData.append('arrested_before', String(Boolean(payload.arrested_before)))
    formData.append('arrest_count', String(payload.arrest_count ?? 0))
    if (payload.date_of_birth) formData.append('date_of_birth', payload.date_of_birth)
    if (payload.gender) formData.append('gender', payload.gender)
    if (payload.physical_description) formData.append('physical_description', payload.physical_description)
    if (payload.identification_number) formData.append('identification_number', payload.identification_number)
    if (payload.known_aliases) {
      formData.append(
        'known_aliases',
        Array.isArray(payload.known_aliases)
          ? JSON.stringify(payload.known_aliases)
          : String(payload.known_aliases),
      )
    }
    formData.append('image', image)

    return axiosInstance.post('/admin/criminals/create', formData)
  },

  updateCriminal: (criminalId: string, payload: {
    first_name?: string
    last_name?: string
    date_of_birth?: string | null
    gender?: string | null
    physical_description?: string | null
    identification_number?: string | null
    status?: 'active' | 'inactive' | 'deceased' | 'deported' | 'arrested'
    wanted?: boolean
    danger_level?: string | null
    known_aliases?: string[] | string | null
    arrested_before?: boolean
    arrest_count?: number
  }, image?: File | null) => {
    if (!image) {
      return axiosInstance.patch(`/admin/criminals/${criminalId}`, payload)
    }

    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return

      if (key === 'known_aliases' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value))
        return
      }

      formData.append(key, String(value))
    })
    formData.append('image', image)

    return axiosInstance.patch(`/admin/criminals/${criminalId}`, formData)
  },

  deleteCriminal: (criminalId: string) => axiosInstance.delete(`/admin/criminals/${criminalId}/permanent`),

  createNews: (payload: {
    title: string
    content: string
    category?: string
    featured?: boolean
    pinned?: boolean
    status?: 'draft' | 'scheduled' | 'published'
    publishedAt?: string | null
  }, image?: File | null) => {
    if (!image) {
      return axiosInstance.post('/admin/news', payload)
    }

    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('content', payload.content)
    formData.append('category', payload.category || 'general')
    formData.append('status', payload.status || 'draft')
    formData.append('featured', String(Boolean(payload.featured)))
    formData.append('pinned', String(Boolean(payload.pinned)))
    if (payload.publishedAt) formData.append('publishedAt', payload.publishedAt)
    formData.append('image', image)

    return axiosInstance.post('/admin/news', formData)
  },

  updateNews: (newsId: string, payload: {
    title?: string
    content?: string
    category?: string
    featured?: boolean
    pinned?: boolean
    status?: 'draft' | 'scheduled' | 'published'
    publishedAt?: string | null
  }, image?: File | null) => {
    if (!image) {
      return axiosInstance.put(`/admin/news/${newsId}`, payload)
    }

    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      formData.append(key, String(value))
    })
    formData.append('image', image)

    return axiosInstance.put(`/admin/news/${newsId}`, formData)
  },

  deleteNews: (newsId: string) => axiosInstance.delete(`/admin/news/${newsId}`),

  getAllOfficers: () => axiosInstance.get('/admin/officers'),

  createOfficer: (payload: {
    name: string
    phone: string
    email?: string
    badge_number?: string
    department?: string
    rank?: string
    status?: 'active' | 'inactive' | 'suspended'
  }) => axiosInstance.post('/admin/officers', payload),

  updateOfficer: (officerId: string, payload: {
    name?: string
    phone?: string
    email?: string
    badge_number?: string
    department?: string
    rank?: string
    status?: 'active' | 'inactive' | 'suspended'
  }) => axiosInstance.put(`/admin/officers/${officerId}`, payload),

  deleteOfficer: (officerId: string) =>
    axiosInstance.delete(`/admin/officers/${officerId}`),

  getAllNews: () => axiosInstance.get('/admin/news'),

  getStats: () => axiosInstance.get<{ success: boolean; stats: AdminDashboardStats }>('/admin/stats'),

  getAllTips: (params?: {
    limit?: number
    offset?: number
    status?: string | string[]
    category?: string | string[]
    assignedTo?: string
    search?: string
  }) => axiosInstance.get('/admin/tips', { params }),

  getTipById: (tipId: string) => axiosInstance.get(`/admin/tips/${tipId}`),

  assignTipToOfficer: (tipId: string, payload: { assignedOfficerId: string; assignmentNotes?: string }) =>
    axiosInstance.patch(`/admin/tips/${tipId}/assign`, payload),

  updateTipStatus: (tipId: string, payload: { newStatus: 'submitted' | 'under_review' | 'resolved' | 'closed' | 'archived'; notes?: string }) =>
    axiosInstance.patch(`/admin/tips/${tipId}/status`, payload),
}

export const newsAPI = {
  getPublicNews: (params?: { limit?: number; offset?: number; category?: string; search?: string }) =>
    axiosInstance.get('/news', { params }),
}

export interface SubmitTipPayload {
  title: string
  description: string
  category: string
  location: string
  dateTime: string
  contactEmail?: string
  isAnonymous: boolean
}

export const tipAPI = {
  submit: (payload: SubmitTipPayload) =>
    axiosInstance.post('/tips/submit', payload),
}

// Fine API endpoints for driver payment portal (PUBLIC - NO AUTH)
export const fineAPI = {
  getDriverFines: (licenseNo: string) =>
    axiosInstance.get<{
      success: boolean
      driver: { driver_id: string; driver_name: string; license_number: string }
      fines: any[]
    }>(`/public-fines/driver/${licenseNo}`),
}

// Payment API endpoints
export const paymentAPI = {
  // Initiate payment - POST to /api/payments/initiate
  initiatePayment: (payload: { fineIds: string[]; licenseNo: string }) =>
    axiosInstance.post<{
      success: boolean
      orderId: string
      total: string
      currency: string
      fineCount: number
      driver: {
        licenseNo: string
        name: string
        email: string
        phone: string
      }
      checkoutParams: any
    }>('/payments/initiate', payload),

  // Webhook - simulate payment gateway callback (for testing)
  simulateWebhook: (payload: { transaction_id: string; status: 'completed' | 'failed'; hash: string }) =>
    axiosInstance.post<{
      success: boolean
      message: string
    }>('/payments/webhook', payload),

  // Get payment status
  getPaymentStatus: (orderId: string) =>
    axiosInstance.get<{
      success: boolean
      data: {
        orderId: string
        status: string
        amount: string
        paymentMethod: string
        fineIds: string[]
      }
    }>(`/payments/${orderId}`),
}

export default axiosInstance
