import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import pLogo from '../assets/plogo.png'
import finePayBg from '../assets/slider/slide-1.png'
import './Home.css'
import './FinePay.css'

const primaryMenu: { label: string; path?: string }[] = [
  { label: 'Home', path: '/' },
  { label: 'About Us' },
  { label: 'Fine Pay', path: '/fine-pay' },
  { label: 'Criminal Records', path: '/criminal-records' },
  { label: 'Division' },
  { label: 'Downloads' },
  { label: 'Library' },
  { label: 'Survey' },
]

export default function FinePay() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseError, setLicenseError] = useState('')
  const navigate = useNavigate()

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

  const toggleMenu = () => {
    setMenuOpen(previous => !previous)
  }

  const closeMenu = () => {
    setMenuOpen(false)
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
  }

  return (
    <section className="home-police fine-pay-page">
      <div className="home-police__topbar">
        <div className="home-police__container home-police__brand-row">
          <div className="home-police__brand">
            <img src={pLogo} alt="Sri Lanka Police logo" className="home-police__brand-logo" />
            <h1>SRI LANKA POLICE</h1>
          </div>
        </div>
      </div>

      <div className="home-police__container home-police__menu-row">
        <button
          type="button"
          className="home-police__menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className="home-police__menu-toggle-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="home-police__menu-toggle-text">MENU</span>
        </button>

        <nav className={`home-police__menu${menuOpen ? ' is-open' : ''}`} aria-label="Primary">
          {primaryMenu.map(item => (
            <button
              key={item.label}
              type="button"
              className={`home-police__menu-item${item.label === 'Fine Pay' ? ' is-active' : ''}`}
              onClick={() => {
                if (item.path) {
                  navigate(item.path)
                }
                closeMenu()
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="home-police__search">
          <span aria-hidden="true">&#128269;</span>
          <input type="text" value="" readOnly placeholder="Search" aria-label="Search" />
        </div>
      </div>

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
