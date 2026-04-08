# API Configuration

This folder contains the HTTP client setup for your React application using axios.

## Files

### `axiosInstance.ts`
The main axios instance with:
- **Base URL**: Automatically configured from `VITE_API_BASE_URL` environment variable
- **Default Timeout**: 10 seconds
- **Request Interceptor**: Automatically adds Bearer token using `VITE_AUTH_TOKEN_KEY` (defaults to `authToken`)
- **Response Interceptor**: Handles errors with status-specific logic:
  - `401`: Clears auth storage and redirects to `/admin` for protected routes
  - `401` on auth challenge endpoints: no redirect (`/auth/login`, `/auth/admin-login`, `/auth/admin-request-otp`, `/auth/verify-otp`)
  - `403`: Logs forbidden error
  - `404`: Logs not found error
  - `500`: Logs server error
  - Network errors: Logs appropriate messages

### `index.ts`
Pre-configured API endpoints for common operations:
- **authAPI**: Login, logout, register, get current user
- **userAPI**: Get profile, update profile, get all users, delete user
- **dashboardAPI**: Get stats and chart data

All endpoints include TypeScript types for request/response data.

## Usage

### 1. Set up environment variables (`.env`)
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_AUTH_TOKEN_KEY=authToken
```

### 2. Use API service functions directly
```typescript
import { authAPI } from '@/api'

// Login
const response = await authAPI.login({ email, password })
const { token, user } = response.data.data
localStorage.setItem('authToken', token)
```

### 3. Use React hooks for queries
```typescript
// src/hooks/useApi.ts exports two hooks:

// useApi() - for fetching data
const { data, loading, error, refetch } = useApi(() => userAPI.getProfile(userId))

// useApiMutation() - for creating/updating/deleting
const { execute, loading, error } = useApiMutation((data) => 
  userAPI.updateProfile(userId, data)
)

const handleSubmit = async (newData) => {
  await execute(newData)
}
```

### 4. Use axios instance directly for custom requests
```typescript
import axiosInstance from '@/api/axiosInstance'

const response = await axiosInstance.get('/custom-endpoint')
const data = await axiosInstance.post('/custom-endpoint', { /* data */ })
```

## Authentication

The axios instance automatically handles Bearer token authentication:

1. When a login request succeeds, store the token with the configured key:
   ```typescript
  const tokenKey = import.meta.env.VITE_AUTH_TOKEN_KEY || 'authToken'
  localStorage.setItem(tokenKey, token)
   ```

2. The request interceptor automatically adds it to all requests:
   ```
   Authorization: Bearer <token>
   ```

3. If a 401 response is received for a protected route, the error interceptor clears auth storage and redirects to `/admin`.

## Error Handling

Errors are handled at the axios level and bubble up as rejected promises. Handle them in your components:

```typescript
try {
  await authAPI.login(credentials)
} catch (error: AxiosError) {
  console.error('Login failed:', error.response?.status)
}
```

## Extending the API

Add more API endpoints in `index.ts`:

```typescript
export const postAPI = {
  getAll: () => axiosInstance.get<ApiResponse<Post[]>>('/posts'),
  getById: (id: string) => axiosInstance.get<ApiResponse<Post>>(`/posts/${id}`),
  create: (data: Omit<Post, 'id'>) => axiosInstance.post<ApiResponse<Post>>('/posts', data),
}
```

Then use it in your components as shown above.
