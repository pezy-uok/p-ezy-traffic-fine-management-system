import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import NavBar from '../components/NavBar'
import finePayBg from '../assets/slider/slide-1.png'
import { fineAPI } from '../api'
import './Home.css'
import './FinePay.css'

const suspendedLicenseNumbers = new Set([
  'B1234567',
  'AB123456',
  'AB1234567',
])

const suspensionWarningMessage =
  'This driving license may be suspended in 7 days if the outstanding fine is not cleared. Please settle it early to avoid suspension.'

export default function FinePay() {
  const navigate = useNavigate()
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseError, setLicenseError] = useState('')
  const [licenseWarning, setLicenseWarning] = useState('')
  const [showSuspensionWarning, setShowSuspensionWarning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  // Common Sri Lankan license formats supported by the portal.
  const sriLankanLicensePatterns = [
    /^[A-Z]\d{7}$/, // Example: B1234567
    /^[A-Z]{2}\d{6}$/, // Example: AB123456
    /^[A-Z]{2}\d{7}$/, // Example: AB1234567
  ]

  const validateLicenseNumber = (value: string): string => {
    const normalized = value.trim().toUpperCase()

    if (!normalized) {
      return 'Driving license number is required.'
    }

    if (!sriLankanLicensePatterns.some(pattern => pattern.test(normalized))) {
      return 'Enter a valid Sri Lankan license number (e.g. B1234567 or AB123456).'
    }

    return ''
  }

  const handleLicenseChange = (value: string) => {
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9)
    setLicenseNumber(sanitized)

    if (licenseError) {
      setLicenseError(validateLicenseNumber(sanitized))
    }

    if (suspendedLicenseNumbers.has(sanitized)) {
      setShowSuspensionWarning(true)
      setLicenseWarning(suspensionWarningMessage)
      return
    }

    setShowSuspensionWarning(false)
    setLicenseWarning('')
  }

  const handleLicenseBlur = () => {
    setLicenseError(validateLicenseNumber(licenseNumber))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationError = validateLicenseNumber(licenseNumber)

    if (validationError) {
      setLicenseError(validationError)
      setShowSuspensionWarning(false)
      setLicenseWarning('')
      setApiError('')
      return
    }

    setLicenseError('')
    setApiError('')
    setLoading(true)

    try {
      // Call API to fetch driver's fines
      const response = await fineAPI.getDriverFines(licenseNumber)
      
      if (response.data.success && response.data.driver) {
        // Check for suspension warning
        if (suspendedLicenseNumbers.has(licenseNumber)) {
          setShowSuspensionWarning(true)
          setLicenseWarning(suspensionWarningMessage)
        } else {
          setShowSuspensionWarning(false)
          setLicenseWarning('')
        }

        // Navigate with driver and fines data
        navigate('/fine-pay/outstanding', {
          state: {
            driver: response.data.driver,
            fines: response.data.fines || [],
            licenseNumber,
            suspensionReminder: suspendedLicenseNumbers.has(licenseNumber) ? suspensionWarningMessage : undefined,
          },
        })
      }
    } catch (error) {
      setShowSuspensionWarning(false)
      setLicenseWarning('')
      
      // Handle different error types
      const axiosError = error as AxiosError<{ message?: string }>
      if (axiosError.response?.status === 404) {
        setApiError('No records found for this license number. Please check and try again.')
      } else if (axiosError.response?.status === 400) {
        setApiError(axiosError.response?.data?.message || 'Invalid license number format.')
      } else {
        setApiError('Failed to fetch fines. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="home-police fine-pay-page">
      <NavBar />

      <div className="fine-pay-page__content" style={{ '--fine-pay-bg-image': `url(${finePayBg})` } as CSSProperties}>
        <div className="fine-pay-page__overlay" />
        <section className="fine-pay-card" aria-labelledby="fine-pay-title">
          <h2 id="fine-pay-title">Pay Traffic Fines Instantly</h2>
          <p>Enter your driving license number to verify details and settle outstanding fines securely.</p>

          <form className="fine-pay-card__form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="license-number">Driving License Number</label>
            <input
              id="license-number"
              name="licenseNumber"
              type="text"
              placeholder="E.g. B1234567 / AB123456"
              autoComplete="off"
              maxLength={9}
              value={licenseNumber}
              onChange={event => handleLicenseChange(event.target.value)}
              onBlur={handleLicenseBlur}
              aria-invalid={Boolean(licenseError)}
              aria-describedby="license-help license-error"
              className={licenseError ? 'is-invalid' : ''}
              disabled={loading}
            />
            <small id="license-help">Use your Sri Lankan driving license number as printed on the card.</small>
            {licenseError && (
              <small id="license-error" className="fine-pay-card__error" role="alert">
                {licenseError}
              </small>
            )}
            {apiError && (
              <small id="api-error" className="fine-pay-card__error" role="alert">
                {apiError}
              </small>
            )}
            {showSuspensionWarning && (
              <section className="fine-pay-card__warning" role="alert" aria-live="polite">
                <div className="fine-pay-card__warning-icon" aria-hidden="true">
                  !
                </div>
                <div className="fine-pay-card__warning-body">
                  <h3>Suspension reminder</h3>
                  <p>{licenseWarning}</p>
                </div>
              </section>
            )}
            <button type="submit" disabled={loading}>
              {loading ? 'Checking Fines...' : 'Check Fines'}
            </button>
          </form>
        </section>
      </div>
    </section>
  )
}
