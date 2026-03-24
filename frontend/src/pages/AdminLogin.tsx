import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminLogin.css'

interface LoginFormValues {
  identifier: string
  password: string
}

interface LoginFormErrors {
  identifier?: string
  password?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,}$/

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateField = (name: keyof LoginFormValues, value: string): string | undefined => {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      return name === 'identifier' ? 'Username or email is required.' : 'Password is required.'
    }

    if (name === 'identifier') {
      if (trimmedValue.includes('@')) {
        if (!EMAIL_PATTERN.test(trimmedValue)) {
          return 'Please enter a valid email address.'
        }
      } else if (!USERNAME_PATTERN.test(trimmedValue)) {
        return 'Username must be at least 3 characters and use letters, numbers, ., _, or -.'
      }
    }

    if (name === 'password' && trimmedValue.length < 6) {
      return 'Password must be at least 6 characters long.'
    }

    return undefined
  }

  const validateForm = (values: LoginFormValues): LoginFormErrors => {
    const nextErrors: LoginFormErrors = {}

    const identifierError = validateField('identifier', values.identifier)
    if (identifierError) {
      nextErrors.identifier = identifierError
    }

    const passwordError = validateField('password', values.password)
    if (passwordError) {
      nextErrors.password = passwordError
    }

    return nextErrors
  }

  const handleIdentifierChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setIdentifier(nextValue)

    if (errors.identifier || isSubmitted) {
      setErrors(previous => ({
        ...previous,
        identifier: validateField('identifier', nextValue),
      }))
    }
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setPassword(nextValue)

    if (errors.password || isSubmitted) {
      setErrors(previous => ({
        ...previous,
        password: validateField('password', nextValue),
      }))
    }
  }

  const handleBlur = (name: keyof LoginFormValues, value: string) => {
    setErrors(previous => ({
      ...previous,
      [name]: validateField(name, value),
    }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitted(true)

    const nextErrors = validateForm({ identifier, password })
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    // Form is valid. API login integration can be added here.
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
            onChange={handleIdentifierChange}
            onBlur={() => handleBlur('identifier', identifier)}
            placeholder="admin@police.gov"
            autoComplete="username"
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={errors.identifier ? 'admin-identifier-error' : undefined}
          />
          {errors.identifier ? (
            <p id="admin-identifier-error" className="admin-login__error" role="alert">
              {errors.identifier}
            </p>
          ) : null}

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => handleBlur('password', password)}
            placeholder="Password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'admin-password-error' : undefined}
          />
          {errors.password ? (
            <p id="admin-password-error" className="admin-login__error" role="alert">
              {errors.password}
            </p>
          ) : null}

          <button type="submit">Sign in</button>
        </form>

        <p className="admin-login__demo">Demo credentials: admin@police.gov / admin123</p>
      </div>
    </section>
  )
}
