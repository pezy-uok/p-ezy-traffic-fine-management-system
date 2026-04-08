import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import pLogo from '../assets/plogo.png'
import './NavBar.css'

interface SubMenuItem {
  label: string
  path: string
}

interface PrimaryMenuItem {
  label: string
  path?: string
  children?: SubMenuItem[]
}

interface NavBarProps {
  activeLabel?: string
}

const divisionMenu: SubMenuItem[] = [
  {
    label: 'Bureau for Investigation of Abuse of Children & Women',
    path: '/divisions/abuse-children-women',
  },
  {
    label: 'Field Force Headquarters',
    path: '/divisions/field-force-headquarters',
  },
  {
    label: 'Mounted Division',
    path: '/divisions/mounted-division',
  },
  {
    label: 'Police Cadet Division',
    path: '/divisions/police-cadet-division',
  },
  {
    label: 'Traffic Management and Road Safety Division',
    path: '/divisions/traffic-road-safety',
  },
]

const libraryMenu: SubMenuItem[] = [
  {
    label: 'Ranks',
    path: '/library/ranks',
  },
  {
    label: 'Medals',
    path: '/library/medals',
  },
]

const surveyMenu: SubMenuItem[] = [
  {
    label: 'Inspector General of Police',
    path: '/igp-profile',
  },
]

const primaryMenu: PrimaryMenuItem[] = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Fine Pay', path: '/fine-pay' },
  { label: 'Criminal Records', path: '/criminal-records' },
  { label: 'Division', children: divisionMenu },
  { label: 'Downloads' },
  { label: 'Library', children: libraryMenu },
  { label: 'Survey', children: surveyMenu },
]

export default function NavBar({ activeLabel }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdownLabel, setOpenDropdownLabel] = useState<string | null>(null)
  const navigate = useNavigate()

  const toggleMenu = () => {
    setMenuOpen(previous => !previous)
    setOpenDropdownLabel(null)
  }

  const handleMenuItemClick = (item: PrimaryMenuItem) => {
    if (item.children?.length) {
      setOpenDropdownLabel(previous => (previous === item.label ? null : item.label))
      return
    }
    setOpenDropdownLabel(null)
    setMenuOpen(false)
    if (!item.path) return
    navigate(item.path)
  }

  const handleSubMenuItemClick = (item: SubMenuItem) => {
    setOpenDropdownLabel(null)
    setMenuOpen(false)
    navigate(item.path)
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
          className={`home-police__menu-toggle${menuOpen ? ' is-open' : ''}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          <span className="home-police__menu-toggle-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="home-police__menu-toggle-text">MENU</span>
        </button>

        <nav className={`home-police__menu${menuOpen ? ' is-open' : ''}`} aria-label="Primary">
          {primaryMenu.map(item => {
            if (item.children?.length) {
              const isOpen = openDropdownLabel === item.label
              const triggerClass = `home-police__menu-item${item.label === activeLabel ? ' is-active' : ''}`
              return (
                <div
                  key={item.label}
                  className={`home-police__menu-group${isOpen ? ' is-open' : ''}`}
                  onMouseLeave={() => setOpenDropdownLabel(previous => (previous === item.label ? null : previous))}
                >
                  <button
                    type="button"
                    className={triggerClass}
                    onClick={() => handleMenuItemClick(item)}
                    onMouseEnter={() => setOpenDropdownLabel(item.label)}
                    aria-expanded={isOpen}
                  >
                    {item.label}
                    <span className="home-police__menu-caret" aria-hidden="true">
                      &#9662;
                    </span>
                  </button>

                  <div className={`home-police__dropdown${isOpen ? ' is-open' : ''}`} role="menu" aria-label={`${item.label} submenu`}>
                    {item.children.map(child => (
                      <button
                        key={child.path}
                        type="button"
                        className="home-police__dropdown-item"
                        onClick={() => handleSubMenuItemClick(child)}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <button
                key={item.label}
                type="button"
                className={`home-police__menu-item${item.label === activeLabel ? ' is-active' : ''}`}
                onClick={() => handleMenuItemClick(item)}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="home-police__search">
          <span aria-hidden="true">&#128269;</span>
          <input type="text" value="" readOnly placeholder="Search" aria-label="Search" />
        </div>
      </div>
    </header>
  )
}
