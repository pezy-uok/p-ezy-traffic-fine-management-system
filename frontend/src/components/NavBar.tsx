import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import pLogo from '../assets/plogo.png'
import './NavBar.css'

interface PrimaryMenuItem {
  label: string
  path?: string
}

const primaryMenu: PrimaryMenuItem[] = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Fine Pay', path: '/fine-pay' },
  { label: 'Criminal Records', path: '/criminal-records' },
  { label: 'Division' },
  { label: 'Downloads' },
  { label: 'Library' },
  { label: 'Survey' },
]

interface NavBarProps {
  activeLabel?: string
}

export default function NavBar({ activeLabel }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const toggleMenu = () => {
    setMenuOpen(previous => !previous)
  }

  const handleMenuItemClick = (item: PrimaryMenuItem) => {
    setMenuOpen(false)
    if (item.path) {
      navigate(item.path)
    }
  }

  return (
    <header className="home-police__header" aria-label="Main site navigation">
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
              className={`home-police__menu-item${item.label === activeLabel ? ' is-active' : ''}`}
              onClick={() => handleMenuItemClick(item)}
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
    </header>
  )
}
