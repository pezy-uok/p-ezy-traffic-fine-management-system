import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminLogin.css'

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/admin/dashboard')
  }

  return (
    <section className="admin-login" aria-label="Admin login page">
      <div className="admin-login__card">
        <header className="admin-login__header">
          <div className="admin-login__badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation" focusable="false" className="admin-login__badge-icon">
              <path d="M4 6h3l2-2h6l2 2h3v2h-2l-1.3 8.1c-.1 1.1-1 1.9-2.1 1.9h-5.2c-1.1 0-2-.8-2.1-1.9L6 8H4V6Zm4.1 2 1.1 7h5.6l1.1-7h-7.8Zm3.9 0v6h-2V8h2Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1>Police Admin</h1>
            <p>Secure access only</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="admin-login__form">
          <label htmlFor="admin-identifier">Username or Email</label>
          <input
            id="admin-identifier"
            type="text"
            value={identifier}
            onChange={event => setIdentifier(event.target.value)}
            placeholder="admin@police.gov"
            autoComplete="username"
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />

          <button type="submit">Sign in</button>
        </form>

        <p className="admin-login__demo">Demo credentials: admin@police.gov / admin123</p>
      </div>
    </section>
  )
}
