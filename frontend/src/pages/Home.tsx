import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import pLogo from '../assets/plogo.png'
import slideOne from '../assets/slider/slide-1.png'
import slideTwo from '../assets/slider/slide-2.png'
import slideThree from '../assets/slider/slide-3.png'
import serviceBg from '../assets/service-bg.jpg'
import './Home.css'

const primaryMenu: { label: string; path?: string }[] = [
  { label: 'Home', path: '/' },
  { label: 'About Us' },
  { label: 'Fine Pay' },
  { label: 'Criminal Records', path: '/criminal-records' },
  { label: 'Division' },
  { label: 'Downloads' },
  { label: 'Library' },
  { label: 'Survey' },
]

const heroSlides = [
  {
    title: '191.673 kg of Narcotics and 3,482 Tablets Destroyed',
    image: slideOne,
  },
  {
    title: 'Iftar Ceremony for Islamic Officers',
    image: slideTwo,
  },
  {
    title: 'Suwanari Medical Clinic in Kurunegala Division',
    image: slideThree,
  },
]

const servicesData = [
  {
    id: 'clearance',
    name: 'Police Clearance Certificates',
    description: 'Apply for and track your police clearance certificates required for visas, employment, or other official purposes.',
  },
  {
    id: 'lost-found',
    name: 'Lost & Found Property',
    description: 'Report lost items or search the database for items that have been found and turned in to the police.',
  },
  {
    id: 'traffic',
    name: 'Real-time Traffic Info',
    description: 'Get the latest updates on road conditions, closures, and traffic flow to plan your journey safely.',
  },
  {
    id: 'emergency',
    name: 'Rapid emergency response services',
    description: 'Quick and efficient assistance during critical situations',
  },
]

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex(previous => (previous + 1) % heroSlides.length)
    }, 5000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const goToPrevious = () => {
    setActiveIndex(previous => (previous - 1 + heroSlides.length) % heroSlides.length)
  }

  const goToNext = () => {
    setActiveIndex(previous => (previous + 1) % heroSlides.length)
  }

  const toggleMenu = () => {
    setMenuOpen(previous => !previous)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <section className="home-police">
      <div className="home-police__topbar">
        <div className="home-police__container home-police__brand-row">
          <div className="home-police__brand">
            <img src={pLogo} alt="Sri Lanka Police logo" className="home-police__brand-logo" />
            <h1>SRI LANKA POLICE</h1>
            {/* <img src={sriLankaFlag} alt="Flag of Sri Lanka" className="home-police__brand-flag" /> */}
          </div>
          {/* <span className="home-police__lang">ENGLISH</span> */}
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
              className={`home-police__menu-item${item.label === 'Home' ? ' is-active' : ''}`}
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

      <div className="home-police__container home-police__news-row">
        <span className="home-police__news-tag">News &#187;</span>
        <p>{heroSlides[activeIndex].title}</p>
      </div>

      <div className="home-police__container home-police__slider-wrap">
        <article
          className="home-police__slide"
          key={heroSlides[activeIndex].title}
          style={{ '--slide-image': `url(${heroSlides[activeIndex].image})` } as CSSProperties}
          aria-live="polite"
        >
          <button type="button" className="home-police__slide-arrow is-left" onClick={goToPrevious} aria-label="Previous slide">
            &#8249;
          </button>
          <button type="button" className="home-police__slide-arrow is-right" onClick={goToNext} aria-label="Next slide">
            &#8250;
          </button>
          <span className="home-police__slide-count">
            {String(activeIndex + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
          </span>

          <div className="home-police__hero-overlay">
            <div className="home-police__hero-content">
              <h1 className="home-police__hero-title">Committed to Protect<br />& Serve the Nation</h1>
              <div className="home-police__hero-buttons">
                <button type="button" className="home-police__hero-btn">Emergency Contacts</button>
                <button type="button" className="home-police__hero-btn">Online Services</button>
              </div>
            </div>
          </div>
        </article>

      </div>

      <div className="home-police__container home-police__dots" role="tablist" aria-label="Hero slide selector">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            className={`home-police__dot${index === activeIndex ? ' is-active' : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show slide ${index + 1}`}
            aria-selected={index === activeIndex}
            role="tab"
          />
        ))}
      </div>

      {/* Services Section */}
      <div
        className="home-police__services-wrapper"
        style={{ '--services-bg': `url(${serviceBg})` } as CSSProperties}
      >
        <div className="home-police__container">
          <h2 className="home-police__services-title">Services</h2>
          <p className="home-police__services-subtitle">Comprehensive support for community safety and law enforcement</p>

          <div className="home-police__services-grid">
            {servicesData.map(service => (
              <div key={service.id} className="home-police__service-card">
                <h3 className="home-police__service-name">{service.name}</h3>
                <p className="home-police__service-desc">{service.description}</p>
                <button type="button" className="home-police__service-btn">Learn &gt;</button>
              </div>
            ))}
          </div>
        </div>
      </div>      
    </section>
  )
}
