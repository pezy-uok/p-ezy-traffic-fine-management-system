import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { authAPI } from '@/api'
import './AdminLogin.css'

interface LoginFormValues {
  identifier: string
  otp: string
}

interface LoginFormErrors {
  identifier?: string
  otp?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,}$/

export default function AdminLogin() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [temporaryId, setTemporaryId] = useState('')
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

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

    if (name === 'otp') {
      if (!/^\d{6}$/.test(trimmedValue)) {
        return 'OTP must be a 6-digit code.'
      }
    }

    return undefined
  }

  const validateForm = (values: LoginFormValues): LoginFormErrors => {
    const nextErrors: LoginFormErrors = {}

    const identifierError = validateField('identifier', values.identifier)
    if (identifierError) {
      nextErrors.identifier = identifierError
    }

    const otpError = validateField('otp', values.otp)
    if (otpError) {
      nextErrors.otp = otpError
    }

    return nextErrors
  }

  const handleIdentifierChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setIdentifier(nextValue)
    setAuthError(null)

    if (errors.identifier || isSubmitted) {
      setErrors(previous => ({
        ...previous,
        identifier: validateField('identifier', nextValue),
      }))
    }
  }

  const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setOtp(nextValue)
    setAuthError(null)

    if (errors.otp || isSubmitted) {
      setErrors(previous => ({
        ...previous,
        otp: validateField('otp', nextValue),
      }))
    }
  }

  const handleBlur = (name: keyof LoginFormValues, value: string) => {
    setErrors(previous => ({
      ...previous,
      [name]: validateField(name, value),
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitted(true)

    if (step === 'request') {
      const identifierError = validateField('identifier', identifier)
      setErrors({ identifier: identifierError })

      if (identifierError) {
        return
      }

      try {
        setIsLoading(true)
        setAuthError(null)

        const response = await authAPI.adminRequestOTP({
          identifier: identifier.trim(),
        })

        setTemporaryId(response.data.temporary_id)
        setStep('verify')
        setIsSubmitted(false)
        setErrors({})
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setAuthError(error.response?.data?.message || 'Failed to request OTP')
        } else {
          setAuthError('Unable to request OTP right now. Please try again.')
        }
      } finally {
        setIsLoading(false)
      }

      return
    }

    const nextErrors = validateForm({ identifier, otp })
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      setIsLoading(true)
      setAuthError(null)

      const tokenResponse = await authAPI.adminVerifyOTP({
        temporary_id: temporaryId,
        otp: otp.trim(),
        expectedRole: 'admin',
      })

      const { accessToken, refreshToken, user } = tokenResponse.data

      localStorage.setItem('authToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('adminUser', JSON.stringify(user))

      navigate('/admin/dashboard', { replace: true })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setAuthError(error.response?.data?.message || 'Invalid OTP code')
      } else {
        setAuthError('Unable to verify OTP right now. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToIdentifier = () => {
    setStep('request')
    setOtp('')
    setTemporaryId('')
    setErrors({})
    setAuthError(null)
    setIsSubmitted(false)
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
            placeholder="admin or admin@pezy.gov"
            autoComplete="username"
            disabled={step === 'verify'}
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={errors.identifier ? 'admin-identifier-error' : undefined}
          />
          {errors.identifier ? (
            <p id="admin-identifier-error" className="admin-login__error" role="alert">
              {errors.identifier}
            </p>
          ) : null}

          {step === 'verify' ? (
            <>
              <label htmlFor="admin-otp">OTP Code</label>
              <input
                id="admin-otp"
                type="text"
                value={otp}
                onChange={handleOtpChange}
                onBlur={() => handleBlur('otp', otp)}
                placeholder="Enter 6-digit OTP"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                aria-invalid={Boolean(errors.otp)}
                aria-describedby={errors.otp ? 'admin-otp-error' : undefined}
              />
              {errors.otp ? (
                <p id="admin-otp-error" className="admin-login__error" role="alert">
                  {errors.otp}
                </p>
              ) : null}
            </>
          ) : null}

          {authError ? (
            <p className="admin-login__error" role="alert">
              {authError}
            </p>
          ) : null}

          <button type="submit" disabled={isLoading}>
            {isLoading ? (step === 'request' ? 'Sending OTP...' : 'Verifying...') : (step === 'request' ? 'Send OTP' : 'Verify OTP')}
          </button>

          {step === 'verify' ? (
            <button type="button" className="admin-login__secondary" onClick={handleBackToIdentifier}>
              Change Username/Email
            </button>
          ) : null}
        </form>

        <p className="admin-login__demo">
          {step === 'request'
            ? 'For testing, OTP is printed in backend terminal.'
            : 'Enter the OTP shown in backend terminal to access dashboard.'}
        </p>
      </div>
    </section>
  )
}
