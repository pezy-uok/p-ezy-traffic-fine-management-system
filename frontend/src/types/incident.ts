/**
 * Incident/Accident Management Types
 */

import type { PaginatedResponse, PaginationParams } from './common'

/** Incident type enum */
export const IncidentType = {
  ACCIDENT: 'accident',
  MINOR_VIOLATION: 'minor_violation',
  MAJOR_VIOLATION: 'major_violation',
  HIT_AND_RUN: 'hit_and_run',
  CRIMINAL_ACTIVITY: 'criminal_activity',
  OTHER: 'other',
} as const

export type IncidentType = (typeof IncidentType)[keyof typeof IncidentType]

/** Incident severity enum */
export const IncidentSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export type IncidentSeverity = (typeof IncidentSeverity)[keyof typeof IncidentSeverity]

/** Incident status enum */
export const IncidentStatus = {
  REPORTED: 'reported',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
} as const

export type IncidentStatus = (typeof IncidentStatus)[keyof typeof IncidentStatus]

/** Injury level enum */
export const InjuryLevel = {
  NONE: 'none',
  MINOR: 'minor',
  MODERATE: 'moderate',
  SEVERE: 'severe',
  FATAL: 'fatal',
} as const

export type InjuryLevel = (typeof InjuryLevel)[keyof typeof InjuryLevel]

/** Incident entity */
export interface Incident {
  id: string
  incident_number: string
  criminal_id: string | null
  location: string
  latitude: number | null
  longitude: number | null
  incident_type: IncidentType
  severity: IncidentSeverity
  status: IncidentStatus
  description: string
  injury_level: InjuryLevel
  injuries_count: number
  vehicles_involved: number
  reported_at: string
  reported_by: string | null
  assigned_to: string | null
  investigation_notes: string | null
  evidence_collected: string | null
  suspect_description: string | null
  witness_contact: string | null
  resolved_at: string | null
  resolution_notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/** Incident with computed fields */
export interface IncidentWithDetails extends Incident {
  daysOpen: number
  isPending: boolean
}

/** Create incident request */
export interface CreateIncidentRequest {
  incident_number: string
  criminal_id?: string
  location: string
  latitude?: number
  longitude?: number
  incident_type: IncidentType
  severity: IncidentSeverity
  description: string
  injury_level?: InjuryLevel
  injuries_count?: number
  vehicles_involved?: number
  suspect_description?: string
  witness_contact?: string
}

/** Update incident request */
export interface UpdateIncidentRequest {
  location?: string
  latitude?: number
  longitude?: number
  incident_type?: IncidentType
  severity?: IncidentSeverity
  status?: IncidentStatus
  description?: string
  injury_level?: InjuryLevel
  injuries_count?: number
  vehicles_involved?: number
  assigned_to?: string
  investigation_notes?: string
  evidence_collected?: string
  suspect_description?: string
  witness_contact?: string
  resolved_at?: string
  resolution_notes?: string
}

/** Incident list response */
export interface IncidentListResponse extends PaginatedResponse<Incident> {
  incidents: Incident[]
}

/** Incident query filters */
export interface IncidentFilters extends PaginationParams {
  status?: IncidentStatus
  severity?: IncidentSeverity
  incident_type?: IncidentType
  search?: string
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  from_date?: string
  to_date?: string
}

/** Incident statistics */
export interface IncidentStatistics {
  total_incidents: number
  total_by_type: Record<IncidentType, number>
  total_by_severity: Record<IncidentSeverity, number>
  total_by_status: Record<IncidentStatus, number>
  total_injuries: number
  total_fatalities: number
  average_resolution_time: number
}

/** Helper function to get incident type label */
export function getIncidentTypeLabel(type: IncidentType): string {
  const labels: Record<IncidentType, string> = {
    [IncidentType.ACCIDENT]: 'Traffic Accident',
    [IncidentType.MINOR_VIOLATION]: 'Minor Violation',
    [IncidentType.MAJOR_VIOLATION]: 'Major Violation',
    [IncidentType.HIT_AND_RUN]: 'Hit and Run',
    [IncidentType.CRIMINAL_ACTIVITY]: 'Criminal Activity',
    [IncidentType.OTHER]: 'Other',
  }
  return labels[type] || type
}

/** Helper function to get incident severity color */
export function getIncidentSeverityColor(severity: IncidentSeverity): string {
  switch (severity) {
    case IncidentSeverity.CRITICAL:
      return '#dc2626' // red
    case IncidentSeverity.HIGH:
      return '#ef4444' // light red
    case IncidentSeverity.MEDIUM:
      return '#f97316' // orange
    case IncidentSeverity.LOW:
      return '#eab308' // yellow
    default:
      return '#6b7280' // gray
  }
}

/** Helper function to get incident status color */
export function getIncidentStatusColor(status: IncidentStatus): string {
  switch (status) {
    case IncidentStatus.CLOSED:
    case IncidentStatus.ARCHIVED:
      return '#22c55e' // green
    case IncidentStatus.RESOLVED:
      return '#3b82f6' // blue
    case IncidentStatus.INVESTIGATING:
      return '#f97316' // orange
    case IncidentStatus.REPORTED:
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
}

/** Helper function to get injury level color */
export function getInjuryLevelColor(injuryLevel: InjuryLevel): string {
  switch (injuryLevel) {
    case InjuryLevel.FATAL:
    case InjuryLevel.SEVERE:
      return '#dc2626' // red
    case InjuryLevel.MODERATE:
      return '#f97316' // orange
    case InjuryLevel.MINOR:
      return '#eab308' // yellow
    case InjuryLevel.NONE:
      return '#22c55e' // green
    default:
      return '#6b7280' // gray
  }
}

/** Helper function to calculate days open */
export function getDaysOpen(incident: Incident | IncidentWithDetails): number {
  if ('daysOpen' in incident) {
    return incident.daysOpen
  }
  const createdDate = new Date(incident.created_at)
  const now = new Date()
  return Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
}

/** Helper function to check if incident is pending */
export function isIncidentPending(incident: Incident): boolean {
  return (
    incident.status === IncidentStatus.REPORTED ||
    incident.status === IncidentStatus.INVESTIGATING
  )
}
