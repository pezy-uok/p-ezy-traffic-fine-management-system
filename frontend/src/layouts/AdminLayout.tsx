import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authAPI } from '@/api'
import './AdminLayout.css'

interface AdminLayoutProps {
  children: ReactNode
}

interface AdminNavItem {
  label: string
  to: string
  icon: ReactNode
}

const navItems: AdminNavItem[] = [
  {
    label: 'Dashboard',
    to: '/admin/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Fine Management',
    to: '/admin/fines',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 5h16v2H4V5Zm0 12h16v2H4v-2Zm2-2h2.2l1.5-6h4.6l1.5 6H18l-2-8H8l-2 8Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Criminal Records',
    to: '/admin/criminal-records',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 3h8l4 4v14H5V3h2Zm1 2v14h9V8h-3V5H8Zm2 6h6v2h-6v-2Zm0 4h6v2h-6v-2Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'News Management',
    to: '/admin/news',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 4h14v14H4V4Zm2 2v10h10V6H6Zm13 2h1v8a2 2 0 0 1-2 2h-1v-2h1V8Zm-11 1h6v2H8V9Zm0 4h6v2H8v-2Z" fill="currentColor" />
      </svg>
    ),
  },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage and redirect to login regardless of API response
      localStorage.removeItem('authToken')
      navigate('/admin')
    }
  }

  return (
    <section className="admin-shell" aria-label="Admin dashboard layout">
      <aside className="admin-shell__sidebar">
        <div className="admin-shell__brand">
          <div className="admin-shell__brand-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation" focusable="false">
              <path d="M4 6h3l2-2h6l2 2h3v2h-2l-1.3 8.1c-.1 1.1-1 1.9-2.1 1.9h-5.2c-1.1 0-2-.8-2.1-1.9L6 8H4V6Zm4.1 2 1.1 7h5.6l1.1-7h-7.8Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1>Police Admin</h1>
            <p>Management</p>
          </div>
        </div>

        <nav className="admin-shell__nav" aria-label="Admin navigation">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-shell__nav-link${isActive ? ' is-active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="admin-shell__nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive ? (
                    <svg
                      className="admin-shell__nav-arrow"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="m9 6 6 6-6 6-1.5-1.5 4.5-4.5-4.5-4.5L9 6Z" fill="currentColor" />
                    </svg>
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button 
          type="button" 
          className="admin-shell__logout"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Logout from admin panel"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M10 4h7a2 2 0 0 1 2 2v4h-2V6h-7v12h7v-4h2v4a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm-6 7h9.2l-2.6-2.6L12 7l5 5-5 5-1.4-1.4 2.6-2.6H4v-2Z" fill="currentColor" />
          </svg>
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </aside>

      <div className="admin-shell__content">{children}</div>
    </section>
  )
}
