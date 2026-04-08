import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authAPI } from '@/api'

interface AdminRouteGuardProps {
  children: ReactNode
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const validateAdminSession = async () => {
      const token = localStorage.getItem('authToken')

      if (!token) {
        setIsAuthorized(false)
        setIsChecking(false)
        return
      }

      try {
        const response = await authAPI.getCurrentUser()
        const user = (response.data as { user?: { role?: string } }).user

        if (user?.role === 'admin') {
          setIsAuthorized(true)
        } else {
          localStorage.removeItem('authToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('adminUser')
          setIsAuthorized(false)
        }
      } catch {
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('adminUser')
        setIsAuthorized(false)
      } finally {
        setIsChecking(false)
      }
    }

    validateAdminSession()
  }, [location.pathname])

  if (isChecking) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Checking admin session...</div>
  }

  if (!isAuthorized) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
