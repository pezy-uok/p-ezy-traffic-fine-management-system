/**
 * Criminal Service
 * Handles all CRUD operations for criminals
 */

import { axiosInstance } from '../api'
import type {
  Criminal,
  CreateCriminalRequest,
  UpdateCriminalRequest,
  CriminalListResponse,
  CriminalFilters,
} from '../types'

export class CriminalService {
  private readonly baseUrl = '/criminals'

  /**
   * Get all criminals with optional filters
   */
  async getCriminals(filters?: CriminalFilters): Promise<CriminalListResponse> {
    const params = new URLSearchParams()

    if (filters) {
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.status) params.append('status', filters.status)
      if (filters.wanted !== undefined) params.append('wanted', filters.wanted.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.orderBy) params.append('orderBy', filters.orderBy)
      if (filters.orderDirection) params.append('orderDirection', filters.orderDirection)
    }

    const queryString = params.toString()
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

    const response = await axiosInstance.get<CriminalListResponse>(url)
    return response.data
  }

  /**
   * Get a single criminal by ID
   */
  async getCriminalById(id: string): Promise<Criminal> {
    const response = await axiosInstance.get<Criminal>(`${this.baseUrl}/${id}`)
    return response.data
  }

  /**
   * Create a new criminal record
   */
  async createCriminal(data: CreateCriminalRequest): Promise<Criminal> {
    const response = await axiosInstance.post<{ success: boolean; criminal: Criminal }>(
      `${this.baseUrl}/create`,
      data
    )
    return response.data.criminal
  }

  /**
   * Update an existing criminal record
   */
  async updateCriminal(id: string, data: UpdateCriminalRequest): Promise<Criminal> {
    const response = await axiosInstance.patch<Criminal>(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  /**
   * Delete a criminal record
   */
  async deleteCriminal(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`)
  }

  /**
   * Get wanted criminals only
   */
  async getWantedCriminals(
    page?: number,
    limit?: number
  ): Promise<CriminalListResponse> {
    return this.getCriminals({
      wanted: true,
      page,
      limit,
      orderBy: 'danger_level',
      orderDirection: 'desc',
    })
  }

  /**
   * Search criminals by name or ID
   */
  async searchCriminals(
    searchTerm: string,
    page?: number
  ): Promise<CriminalListResponse> {
    return this.getCriminals({
      search: searchTerm,
      page,
    })
  }

  /**
   * Get criminals by danger level
   */
  async getCriminalsByDangerLevel(
    page?: number
  ): Promise<CriminalListResponse> {
    return this.getCriminals({
      orderBy: 'danger_level',
      orderDirection: 'desc',
      page,
    })
  }

  /**
   * Get active criminals only
   */
  async getActiveCriminals(page?: number): Promise<CriminalListResponse> {
    return this.getCriminals({
      status: 'active',
      page,
    })
  }
}

// Export singleton instance
export const criminalService = new CriminalService()

export default criminalService
