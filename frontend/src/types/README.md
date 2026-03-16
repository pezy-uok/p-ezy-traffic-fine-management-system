# TypeScript Types & Interfaces

Complete type definitions for the frontend application. All types are organized by domain and exported from a central index file.

## File Structure

```
src/types/
├── index.ts          # Main export file (import all types from here)
├── common.ts         # Generic/common types (ApiResponse, Pagination, etc.)
├── auth.ts           # Authentication types (User, Login, Register, etc.)
├── user.ts           # User management types (UserList, Preferences, etc.)
├── dashboard.ts      # Dashboard & analytics types (Stats, Charts, etc.)
├── content.ts        # Content types (Post, Comment, Tag, etc.)
├── errors.ts         # Error handling types
└── README.md         # This file
```

## Usage

### Import all types from the index
```typescript
import type {
  User,
  LoginRequest,
  ApiResponse,
  DashboardStats,
  Post,
  ApiError,
} from '@/types'
```

### Import specific types
```typescript
import type { User, UserRole, UserStatus } from '@/types'
```

### Use in your components
```typescript
const user: User = {
  id: '1',
  name: 'John',
  email: 'john@example.com',
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}
```

## Type Categories

### Common Types (`common.ts`)
- `ApiResponse<T>` - Generic API response wrapper
- `ApiError` - Error response structure
- `PaginationMeta` - Pagination information
- `PaginatedResponse<T>` - Paginated data wrapper
- `PaginationParams` - Query parameters for pagination
- `FileUpload` - File upload information
- `ListQuery` - Generic list query with filters

### Authentication Types (`auth.ts`)
- `User` - User entity with role and status
- `UserRole` - User role constant object: ADMIN, USER, MODERATOR, GUEST
- `UserStatus` - User status constant object: ACTIVE, INACTIVE, SUSPENDED, DELETED
- `LoginRequest` - Login credentials
- `LoginResponse` - Login result with token and user
- `RegisterRequest` - Registration payload
- `RegisterResponse` - Registration result
- `PasswordResetRequest` - Password reset request
- `PasswordReset` - Password reset with token
- `ChangePasswordRequest` - Change password form
- `AuthSession` - Current auth state
- `TokenRefreshResponse` - Token refresh result

### User Management Types (`user.ts`)
- `UserListQuery` - User list query with filters
- `UserListResponse` - Paginated user list
- `UpdateProfileRequest` - Profile update data
- `UserPreferences` - User settings and preferences
- `NotificationPreferences` - Notification settings
- `PrivacySettings` - Privacy configuration
- `UserActivity` - Activity log entry
- `UserStats` - User statistics
- `BulkUserOperation` - Bulk user actions
- `ExportUsersResponse` - Export download info

### Dashboard & Analytics Types (`dashboard.ts`)
- `DashboardStats` - Dashboard statistics
- `ChartDataPoint` - Single chart data point
- `ChartDataset` - Collection of chart data
- `ChartData` - Complete chart configuration
- `DashboardWidget` - Dashboard widget
- `AnalyticsPeriod` - Time period for analysis
- `TrafficAnalytics` - Traffic metrics
- `PageStats` - Individual page statistics
- `TrafficSource` - Traffic source information
- `EngagementMetrics` - User engagement data
- `AnalyticsReport` - Complete analytics report
- `ReportExportOptions` - Export configuration

### Content Types (`content.ts`)
- `Post` - Blog post entity
- `PostStatus` - Post status constant object: DRAFT, PUBLISHED, ARCHIVED, DELETED
- `PostCategory` - Post category
- `Tag` - Post tag
- `PostMetadata` - SEO and social metadata
- `CreatePostRequest` - Create/update post payload
- `Comment` - Comment entity
- `CommentStatus` - Comment status constant object: APPROVED, PENDING, SPAM, DELETED
- `CreateCommentRequest` - Create comment payload
- `PostQueryParams` - Post list query parameters
- `PostListResponse` - Paginated post list
- `CategoryListResponse` - Category list
- `TagListResponse` - Tag list

### Error Types (`errors.ts`)
- `HttpError` - HTTP error details
- `ValidationError` - Form validation errors
- `ApiErrorResponse` - Structured error response
- `FieldError` - Individual field error
- `FormValidationErrors` - Form errors dictionary
- `BusinessError` - Business logic error
- `ErrorContext` - Error logging context
- `RateLimitError` - Rate limit error
- `TimeoutError` - Request timeout error
- `NetworkError` - Network error
- `ErrorSeverity` - Error severity levels: LOW, MEDIUM, HIGH, CRITICAL
- `ErrorLog` - Error log entry
- `ErrorRecoveryStrategy` - Error recovery configuration

## Constants vs Enums

This project uses **const objects** instead of enums due to TypeScript's `erasableSyntaxOnly` setting. This provides the same type safety while being more compatible with strict mode:

```typescript
// Instead of: enum UserRole { ADMIN = 'admin', ... }
// We use: const objects with type assertions
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  GUEST: 'guest',
} as const

// TypeScript infers the type automatically
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

// Usage:
const role: UserRole = UserRole.ADMIN // Type safe!
```

## Type Composition

### Using with API responses
```typescript
import { authAPI } from '@/api'
import type { ApiResponse, LoginResponse } from '@/types'

const response: ApiResponse<LoginResponse> = await authAPI.login(credentials)
```

### Using with forms
```typescript
import type { UpdateProfileRequest } from '@/types'

const formData: UpdateProfileRequest = {
  name: 'John Doe',
  email: 'john@example.com',
}

await userAPI.updateProfile(userId, formData)
```

### Using with state
```typescript
import { useState } from 'react'
import type { User, AuthSession } from '@/types'

const [session, setSession] = useState<AuthSession>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
})
```

## Path Alias

All types are imported using the `@` alias:
- `@/types` - Types folder
- `@/api` - API folder
- `@/pages` - Pages folder
- `@/hooks` - Hooks folder

This is configured in:
- `tsconfig.app.json` - TypeScript path mapping
- `vite.config.ts` - Vite resolver alias

## Best Practices

1. **Always use `type` imports for types-only**
   ```typescript
   import type { User, ApiResponse } from '@/types'
   ```

2. **Define request/response types for each API endpoint**
   ```typescript
   interface GetUserRequest { userId: string }
   interface GetUserResponse { user: User }
   ```

3. **Use generic types for flexibility**
   ```typescript
   const handleResponse = <T>(response: ApiResponse<T>) => { ... }
   ```

4. **Extend interfaces for variations**
   ```typescript
   interface UpdateProfileRequest extends Partial<User> {
     newPassword?: string
   }
   ```

5. **Use const objects for enumerated values**
   ```typescript
   const PaymentStatus = { PENDING: 'pending', COMPLETED: 'completed' } as const
   type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]
   ```

## Adding New Types

1. Create a new file in `src/types/domain.ts`
2. Define your types
3. Export them at the top level in `index.ts`
4. Use throughout the application

Example:
```typescript
// src/types/payment.ts
export interface Payment {
  id: string
  amount: number
  status: PaymentStatus
  createdAt: string
}

export const PaymentStatus = { PENDING: 'pending', COMPLETED: 'completed' } as const
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]
```

Then in `index.ts`:
```typescript
export * from './payment'
```

## Type Checking

Run type checking with:
```bash
npm run build  # Includes TypeScript type checking
```

## IDE Support

Most IDEs with TypeScript support will:
- Show type hints on hover
- Provide autocomplete for properties
- Warn about type mismatches
- Enable safe refactoring

Make sure your IDE is configured to use the workspace TypeScript version for best results.
