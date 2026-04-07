/**
 * Incident API Service
 * Handles all CRUD operations for incidents/accidents
 */

import { axiosInstance } from '../api'
import type {
  Incident,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  IncidentListResponse,
  IncidentFilters,
} from '../types'

export class IncidentService {
  private readonly baseUrl = '/incidents'

  /**
   * Get all incidents with optional filters
   */
  async getIncidents(filters?: IncidentFilters): Promise<IncidentListResponse> {
    const params = new URLSearchParams()

    if (filters) {
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.status) params.append('status', filters.status)
      if (filters.severity) params.append('severity', filters.severity)
      if (filters.incident_type) params.append('incident_type', filters.incident_type)
      if (filters.search) params.append('search', filters.search)
      if (filters.orderBy) params.append('orderBy', filters.orderBy)
      if (filters.orderDirection) params.append('orderDirection', filters.orderDirection)
    }

    const queryString = params.toString()
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

    const response = await axiosInstance.get<IncidentListResponse>(url)
    return response.data
  }

  /**
   * Get a single incident by ID
   */
  async getIncidentById(id: string): Promise<Incident> {
    const response = await axiosInstance.get<Incident>(`${this.baseUrl}/${id}`)
    return response.data
  }

  /**
   * Create a new incident record
   */
  async createIncident(data: CreateIncidentRequest): Promise<Incident> {
    const response = await axiosInstance.post<Incident>(this.baseUrl, data)
    return response.data
  }

  /**
   * Update an existing incident record
   */
  async updateIncident(id: string, data: UpdateIncidentRequest): Promise<Incident> {
    const response = await axiosInstance.patch<Incident>(
      `${this.baseUrl}/${id}`,
      data
    )
    return response.data
  }

  /**
   * Delete an incident record
   */
  async deleteIncident(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`)
  }

  /**
   * Get active incidents (reported or investigating)
   */
  async getActiveIncidents(page?: number): Promise<IncidentListResponse> {
    return this.getIncidents({
      status: 'reported',
      page,
      orderBy: 'reported_at',
      orderDirection: 'desc',
    })
  }

  /**
   * Get resolved incidents
   */
  async getResolvedIncidents(page?: number): Promise<IncidentListResponse> {
    return this.getIncidents({
      status: 'resolved',
      page,
      orderBy: 'resolved_at',
      orderDirection: 'desc',
    })
  }

  /**
   * Get critical incidents
   */
  async getCriticalIncidents(page?: number): Promise<IncidentListResponse> {
    return this.getIncidents({
      severity: 'critical',
      page,
      orderBy: 'reported_at',
      orderDirection: 'desc',
    })
  }
}

// Export singleton instance
export const incidentService = new IncidentService()

export default incidentService
