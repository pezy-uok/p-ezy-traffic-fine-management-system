import { NavLink } from 'react-router-dom'
import type { CSSProperties } from 'react'
import pLogo from '../assets/plogo.png'
import heroBackdrop from '../assets/slider/slide-1.png'
import './Home.css'
import './FinePay.css'

const menuItems = [
  { label: 'Home', path: '/' },
  { label: 'About Us' },
  { label: 'Fine Pay', path: '/fine-pay' },
  { label: 'Criminal Records' },
  { label: 'Division' },
  { label: 'Downloads' },
  { label: 'Library' },
  { label: 'Survey' },
]

export default function FinePay() {
  return (
    <section className="home-police fine-pay-page" style={{ '--fine-pay-backdrop': `url(${heroBackdrop})` } as CSSProperties}>
      <div className="home-police__topbar">
        <div className="home-police__container home-police__brand-row">
          <div className="home-police__brand">
            <img src={pLogo} alt="Sri Lanka Police logo" className="home-police__brand-logo" />
            <h1>SRI LANKA POLICE</h1>
          </div>
        </div>
      </div>

      <div className="home-police__container home-police__menu-row">
        <nav className="home-police__menu" aria-label="Primary navigation">
            {menuItems.map(item => (
              item.path ? (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `home-police__menu-item${isActive ? ' is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ) : (
                <button key={item.label} className="home-police__menu-item" type="button">
                  {item.label}
                </button>
              )
            ))}
          </nav>

          <label className="home-police__search" aria-label="Search">
            <span aria-hidden="true">&#128269;</span>
            <input type="text" placeholder="Search" readOnly />
          </label>
      </div>

      <main className="fine-pay-hero">
        <div className="fine-pay-form-card">
          <h2>Pay Traffic Fines Instantly</h2>
          <p>Enter your driving license number to verify details and settle outstanding fines securely.</p>

          <label htmlFor="license-number" className="fine-pay-label">Driving License Number</label>

          <div className="fine-pay-input-wrap">
            <span aria-hidden="true">&#9633;</span>
            <input id="license-number" type="text" placeholder="E.G., B1234567" />
          </div>

          <small>Your details are retrieved from the central department database.</small>

          <button type="button" className="fine-pay-submit">Check Fines &#8594;</button>
        </div>
      </main>
    </section>
  )
}
