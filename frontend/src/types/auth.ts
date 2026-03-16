/**
 * Authentication Types
 */

/** User entity */
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

/** User role */
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  GUEST: 'guest',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

/** User status */
export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
} as const

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

/** Login request payload */
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

/** Login response */
export interface LoginResponse {
  token: string
  refreshToken?: string
  user: User
  expiresIn?: number
}

/** Register request payload */
export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  agreeToTerms: boolean
}

/** Register response */
export interface RegisterResponse {
  user: User
  token: string
  message: string
}

/** Password reset request */
export interface PasswordResetRequest {
  email: string
}

/** Password reset token validation */
export interface ResetTokenValidation {
  valid: boolean
  expiresIn?: number
}

/** Password reset with token */
export interface PasswordReset {
  token: string
  newPassword: string
  confirmPassword: string
}

/** Change password request */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/** Auth session/state */
export interface AuthSession {
  user: User | null
  token: string | null
  refreshToken?: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

/** Token refresh response */
export interface TokenRefreshResponse {
  token: string
  refreshToken?: string
  expiresIn?: number
}

/** Logout response */
export interface LogoutResponse {
  message: string
  success: boolean
}
