import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import finePayBg from '../assets/slider/slide-1.png'
import './Home.css'
import './FinePay.css'

export default function FinePay() {
  const navigate = useNavigate()
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseError, setLicenseError] = useState('')

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
  }

  const handleLicenseBlur = () => {
    setLicenseError(validateLicenseNumber(licenseNumber))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationError = validateLicenseNumber(licenseNumber)

    if (validationError) {
      setLicenseError(validationError)
      return
    }

    setLicenseError('')
    navigate('/fine-pay/success')
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
            />
            <small id="license-help">Use your Sri Lankan driving license number as printed on the card.</small>
            {licenseError && (
              <small id="license-error" className="fine-pay-card__error" role="alert">
                {licenseError}
              </small>
            )}
            <button type="submit">Check Fines</button>
          </form>
        </section>
      </div>
    </section>
  )
}
