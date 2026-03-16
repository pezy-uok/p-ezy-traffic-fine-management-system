/**
 * User Management Types
 */

import type { User } from './auth'
import type { PaginatedResponse, PaginationParams } from './common'

/** User list query */
export interface UserListQuery extends PaginationParams {
  search?: string
  role?: string
  status?: string
  sortBy?: keyof User
}

/** User list response */
export interface UserListResponse extends PaginatedResponse<User> {
  total: number
}

/** Update user profile request */
export interface UpdateProfileRequest {
  name?: string
  email?: string
  phone?: string
  avatar?: string
}

/** User preferences */
export interface UserPreferences {
  userId: string
  theme: 'light' | 'dark' | 'auto'
  language: string
  notifications: NotificationPreferences
  privacy: PrivacySettings
}

/** Notification preferences */
export interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
}

/** Privacy settings */
export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  showOnlineStatus: boolean
  allowMessages: boolean
  dataCollection: boolean
}

/** User activity log */
export interface UserActivity {
  id: string
  userId: string
  action: string
  description: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

/** User statistics */
export interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  newUsersThisMonth: number
  byRole: Record<string, number>
  byStatus: Record<string, number>
}

/** Bulk user operation request */
export interface BulkUserOperation {
  userIds: string[]
  operation: 'activate' | 'deactivate' | 'suspend' | 'delete' | 'changeRole'
  roleTarget?: string
}

/** Export users response */
export interface ExportUsersResponse {
  downloadUrl: string
  filename: string
  format: 'csv' | 'xlsx' | 'json'
  generatedAt: string
}
