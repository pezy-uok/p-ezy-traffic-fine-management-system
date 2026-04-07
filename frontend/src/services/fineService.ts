/**
 * Fine API Service
 * Handles all CRUD operations for traffic fines
 */

import { axiosInstance } from '../api'
import type {
  Fine,
  CreateFineRequest,
  UpdateFineRequest,
  FineListResponse,
  FineFilters,
} from '../types'

export class FineService {
  private readonly baseUrl = '/fines'

  /**
   * Get all fines with optional filters
   */
  async getFines(filters?: FineFilters): Promise<FineListResponse> {
    const params = new URLSearchParams()

    if (filters) {
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.status) params.append('status', filters.status)
      if (filters.severity) params.append('severity', filters.severity)
      if (filters.search) params.append('search', filters.search)
      if (filters.orderBy) params.append('orderBy', filters.orderBy)
      if (filters.orderDirection) params.append('orderDirection', filters.orderDirection)
    }

    const queryString = params.toString()
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

    const response = await axiosInstance.get<FineListResponse>(url)
    return response.data
  }

  /**
   * Get a single fine by ID
   */
  async getFineById(id: string): Promise<Fine> {
    const response = await axiosInstance.get<Fine>(`${this.baseUrl}/${id}`)
    return response.data
  }

  /**
   * Create a new fine record
   */
  async createFine(data: CreateFineRequest): Promise<Fine> {
    const response = await axiosInstance.post<Fine>(this.baseUrl, data)
    return response.data
  }

  /**
   * Update an existing fine record
   */
  async updateFine(id: string, data: UpdateFineRequest): Promise<Fine> {
    const response = await axiosInstance.patch<Fine>(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  /**
   * Delete a fine record
   */
  async deleteFine(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`)
  }

  /**
   * Get pending fines
   */
  async getPendingFines(page?: number): Promise<FineListResponse> {
    return this.getFines({
      status: 'pending',
      page,
      orderBy: 'due_at',
      orderDirection: 'asc',
    })
  }

  /**
   * Get overdue fines
   */
  async getOverdueFines(page?: number): Promise<FineListResponse> {
    return this.getFines({
      status: 'overdue',
      page,
      orderBy: 'due_at',
      orderDirection: 'asc',
    })
  }

  /**
   * Get paid fines
   */
  async getPaidFines(page?: number): Promise<FineListResponse> {
    return this.getFines({
      status: 'paid',
      page,
      orderBy: 'paid_at',
      orderDirection: 'desc',
    })
  }
}

// Export singleton instance
export const fineService = new FineService()

export default fineService
