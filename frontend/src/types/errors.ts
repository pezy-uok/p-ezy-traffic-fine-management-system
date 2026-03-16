/**
 * Error Handling & HTTP Types
 */

/** HTTP error details */
export interface HttpError {
  statusCode: number
  status: string
  message: string
  details?: Record<string, any>
  timestamp?: string
  path?: string
}

/** Validation error details */
export interface ValidationError extends HttpError {
  fields: Record<string, string[]>
}

/** API error response */
export interface ApiErrorResponse {
  success: false
  error: string
  message?: string
  statusCode?: number
  details?: Record<string, any>
}

/** Form field error */
export interface FieldError {
  field: string
  message: string
  code?: string
}

/** Form validation errors */
export interface FormValidationErrors {
  [key: string]: string | string[]
}

/** Business logic error */
export interface BusinessError {
  code: string
  message: string
  statusCode: number
  recoverable: boolean
  action?: 'retry' | 'refresh' | 'redirect' | 'contact_support'
}

/** Error context for logging */
export interface ErrorContext {
  url: string
  method: string
  statusCode: number
  requestPayload?: Record<string, any>
  responsePayload?: Record<string, any>
  timestamp: string
  userAgent: string
  userId?: string
}

/** Rate limit error */
export interface RateLimitError extends HttpError {
  retryAfter: number
  remaining: number
  limit: number
}

/** Request timeout error */
export interface TimeoutError extends HttpError {
  timeout: number
}

/** Network error */
export interface NetworkError {
  type: 'network' | 'timeout' | 'abort' | 'unknown'
  message: string
  isOnline: boolean
}

/** Error severity levels */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export type ErrorSeverity = (typeof ErrorSeverity)[keyof typeof ErrorSeverity]

/** Structured error log entry */
export interface ErrorLog {
  id: string
  severity: ErrorSeverity
  type: string
  message: string
  stackTrace?: string
  context: ErrorContext
  timestamp: string
  resolved: boolean
}

/** Error recovery strategy */
export interface ErrorRecoveryStrategy {
  code: string
  retry: boolean
  maxRetries: number
  backoffMultiplier: number
  redirectUrl?: string
}
