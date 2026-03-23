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
  const navigate = useNavigate()

  const toggleMenu = () => {
    setMenuOpen(previous => !previous)
  }

  const closeMenu = () => {
    setMenuOpen(false)
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

          <form className="fine-pay-card__form" onSubmit={event => event.preventDefault()}>
            <label htmlFor="license-number">Driving License Number</label>
            <input id="license-number" name="licenseNumber" type="text" placeholder="E.g. B1234567" autoComplete="off" />
            <small>Your details are retrieved from the central department database.</small>
            <button type="submit">Check Fines</button>
          </form>
        </section>
      </div>
    </section>
  )
}
