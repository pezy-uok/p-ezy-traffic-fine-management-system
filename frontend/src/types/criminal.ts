/**
 * Criminal Management Types
 */

import type { PaginatedResponse, PaginationParams } from './common'

/** Criminal status enum */
export const CriminalStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DECEASED: 'deceased',
  DEPORTED: 'deported',
} as const

export type CriminalStatus = (typeof CriminalStatus)[keyof typeof CriminalStatus]

/** Criminal danger level */
export const DangerLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export type DangerLevel = (typeof DangerLevel)[keyof typeof DangerLevel]

/** Criminal entity */
export interface Criminal {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  gender: string | null
  physical_description: string | null
  identification_number: string | null
  status: CriminalStatus
  wanted: boolean
  danger_level: DangerLevel | null
  known_aliases: string[] | null
  arrested_before: boolean
  arrest_count: number
  photo_path: string | null
  photo_uploaded_at: string | null
  photo_size: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/** Criminal with computed fields */
export interface CriminalWithDetails extends Criminal {
  fullName: string
  photoUrl?: string
}

/** Create criminal request */
export interface CreateCriminalRequest {
  first_name: string
  last_name: string
  date_of_birth?: string
  gender?: string
  physical_description?: string
  identification_number?: string
  status?: CriminalStatus
  wanted?: boolean
  danger_level?: DangerLevel
  known_aliases?: string[]
  arrested_before?: boolean
  arrest_count?: number
}

/** Update criminal request */
export interface UpdateCriminalRequest {
  first_name?: string
  last_name?: string
  date_of_birth?: string
  gender?: string
  physical_description?: string
  identification_number?: string
  status?: CriminalStatus
  wanted?: boolean
  danger_level?: DangerLevel
  known_aliases?: string[]
  arrested_before?: boolean
  arrest_count?: number
  photo_path?: string
}

/** Criminal list response */
export interface CriminalListResponse extends PaginatedResponse<Criminal> {
  criminals: Criminal[]
}

/** Criminal query filters */
export interface CriminalFilters extends PaginationParams {
  status?: CriminalStatus
  wanted?: boolean
  search?: string
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

/** Criminal photo upload response */
export interface CriminalPhotoUploadResponse {
  success: boolean
  message?: string
  criminal?: Criminal
  error?: string
}

/** Helper function to get full name */
export function getCriminalFullName(criminal: Criminal | CriminalWithDetails): string {
  if ('fullName' in criminal) {
    return criminal.fullName
  }
  return `${criminal.first_name} ${criminal.last_name}`
}

/** Helper function to get danger level color */
export function getDangerLevelColor(dangerLevel: DangerLevel | null | undefined): string {
  switch (dangerLevel) {
    case DangerLevel.CRITICAL:
    case DangerLevel.HIGH:
      return '#ef4444' // red
    case DangerLevel.MEDIUM:
      return '#f97316' // orange
    case DangerLevel.LOW:
      return '#22c55e' // green
    default:
      return '#6b7280' // gray
  }
}

/** Helper function to get status badge color */
export function getStatusColor(status: CriminalStatus): string {
  switch (status) {
    case CriminalStatus.ACTIVE:
      return '#22c55e' // green
    case CriminalStatus.INACTIVE:
      return '#f97316' // orange
    case CriminalStatus.DECEASED:
    case CriminalStatus.DEPORTED:
      return '#6b7280' // gray
    default:
      return '#3b82f6' // blue
  }
}
