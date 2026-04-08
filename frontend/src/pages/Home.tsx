import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import slideOne from '../assets/slider/slide-1.png'
import slideTwo from '../assets/slider/slide-2.png'
import slideThree from '../assets/slider/slide-3.png'
import serviceBg from '../assets/service-bg.jpg'
import NavBar from '../components/NavBar'
import './Home.css'

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

  return (
    <section className="home-police">
      <NavBar />

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

      {/* Inspector General Section */}
      <div className="home-police__igp-wrapper">
        <div className="home-police__container">
          <div className="home-police__igp-container">
            <div className="home-police__igp-content">
              <div className="home-police__igp-card">
                <div className="home-police__igp-seal">
                  <svg viewBox="0 0 100 100" className="home-police__igp-seal-icon">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#0284c7" strokeWidth="2"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#0284c7" strokeWidth="1"/>
                    <path d="M50 15 L65 35 L85 35 L70 48 L78 68 L50 55 L22 68 L30 48 L15 35 L35 35 Z" fill="#0284c7"/>
                    <text x="50" y="85" fontSize="6" textAnchor="middle" fill="#0284c7" fontWeight="bold">SRI LANKA</text>
                  </svg>
                </div>
                <h3 className="home-police__igp-title">Inspector General of Police</h3>
                <p className="home-police__igp-role">Attorney-at-Law</p>
                <p className="home-police__igp-name">Mr. Priyantha Weerasooriya</p>
                <button type="button" className="home-police__igp-btn">
                  <span className="home-police__igp-btn-icon">👤</span>
                  Profile
                </button>
              </div>
            </div>
            <div className="home-police__igp-image-section">
              <div className="home-police__igp-image-placeholder">
                <svg viewBox="0 0 300 400" className="home-police__igp-image-icon">
                  <rect width="300" height="400" fill="#e2e8f0" rx="8"/>
                  <circle cx="150" cy="120" r="50" fill="#cbd5e1"/>
                  <ellipse cx="150" cy="250" rx="60" ry="80" fill="#cbd5e1"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
