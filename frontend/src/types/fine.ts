/**
 * Fine Management Types
 */

import type { PaginatedResponse, PaginationParams } from './common'

/** Fine status enum */
export const FineStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  APPEALED: 'appealed',
  CANCELLED: 'cancelled',
  OVERDUE: 'overdue',
} as const

export type FineStatus = (typeof FineStatus)[keyof typeof FineStatus]

/** Fine severity level */
export const FineSeverity = {
  WARNING: 'warning',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export type FineSeverity = (typeof FineSeverity)[keyof typeof FineSeverity]

/** Fine entity */
export interface Fine {
  id: string
  criminal_id: string
  vehicle_license_plate: string | null
  violation_code: string
  violation_description: string
  fine_amount: number
  paid_amount: number
  status: FineStatus
  severity: FineSeverity
  issued_by: string | null
  issued_at: string
  due_at: string | null
  paid_at: string | null
  payment_method: string | null
  receipt_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/** Fine with calculated fields */
export interface FineWithDetails extends Fine {
  remaining_amount: number
  is_overdue: boolean
  days_until_due: number
}

/** Create fine request */
export interface CreateFineRequest {
  criminal_id: string
  vehicle_license_plate?: string
  violation_code: string
  violation_description: string
  fine_amount: number
  severity: FineSeverity
  due_at?: string
  notes?: string
}

/** Update fine request */
export interface UpdateFineRequest {
  vehicle_license_plate?: string
  violation_code?: string
  violation_description?: string
  fine_amount?: number
  status?: FineStatus
  severity?: FineSeverity
  due_at?: string
  notes?: string
}

/** Fine payment request */
export interface PayFineRequest {
  paid_amount: number
  payment_method: string
  receipt_number: string
}

/** Fine list response */
export interface FineListResponse extends PaginatedResponse<Fine> {
  fines: Fine[]
}

/** Fine query filters */
export interface FineFilters extends PaginationParams {
  status?: FineStatus
  severity?: FineSeverity
  criminal_id?: string
  search?: string
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  from_date?: string
  to_date?: string
}

/** Fine statistics */
export interface FineStatistics {
  total_fines: number
  total_amount: number
  total_paid: number
  total_pending: number
  by_status: Record<FineStatus, number>
  by_severity: Record<FineSeverity, number>
}

/** Helper function to get severity color */
export function getSeverityColor(severity: FineSeverity): string {
  switch (severity) {
    case FineSeverity.CRITICAL:
      return '#dc2626' // red
    case FineSeverity.HIGH:
      return '#ef4444' // light red
    case FineSeverity.MEDIUM:
      return '#f97316' // orange
    case FineSeverity.LOW:
      return '#eab308' // yellow
    case FineSeverity.WARNING:
      return '#3b82f6' // blue
    default:
      return '#6b7280' // gray
  }
}

/** Helper function to get status badge color */
export function getFineStatusColor(status: FineStatus): string {
  switch (status) {
    case FineStatus.PAID:
      return '#22c55e' // green
    case FineStatus.PENDING:
      return '#f97316' // orange
    case FineStatus.OVERDUE:
      return '#ef4444' // red
    case FineStatus.APPEALED:
      return '#3b82f6' // blue
    case FineStatus.CANCELLED:
      return '#6b7280' // gray
    default:
      return '#9ca3af' // light gray
  }
}

/** Helper function to check if fine is overdue */
export function isFineOverdue(fine: Fine): boolean {
  if (!fine.due_at || fine.status === FineStatus.PAID) {
    return false
  }
  return new Date(fine.due_at) < new Date()
}

/** Helper function to calculate remaining amount */
export function getRemainingAmount(fine: Fine): number {
  return Math.max(0, fine.fine_amount - fine.paid_amount)
}

/** Helper function to calculate days until due */
export function getDaysUntilDue(fine: Fine): number {
  if (!fine.due_at) return 0

  const now = new Date()
  const dueDate = new Date(fine.due_at)
  const diffTime = dueDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/** Helper function to format fine amount */
export function formatFineAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
