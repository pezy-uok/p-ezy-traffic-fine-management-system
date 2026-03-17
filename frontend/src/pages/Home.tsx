import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import sriLankaFlag from '../assets/Flag_of_Sri_Lanka.png'
import pLogo from '../assets/plogo.png'
import slideOne from '../assets/slider/slide-1.png'
import slideTwo from '../assets/slider/slide-2.png'
import slideThree from '../assets/slider/slide-3.png'
import './Home.css'

const primaryMenu = ['Home', 'About Us', 'Divisions', 'Downloads', 'Library', 'Survey']

const quickServices = [
  {
    title: 'E-Services',
    subtitle: 'Clearance Reports',
    description: 'Report your complaints',
    icon: 'list',
  },
  {
    title: 'Media',
    subtitle: 'Press Releases, News',
    description: 'Updates, Events & More.',
    icon: 'media',
  },
  {
    title: 'Gallery',
    subtitle: 'Image & Video',
    description: 'Collection',
    icon: 'gallery',
  },
  {
    title: 'Contact us',
    subtitle: 'Telephone, Police',
    description: 'Stations & etc.',
    icon: 'contact',
  },
  {
    title: 'Join us',
    subtitle: 'Become a Guardian of',
    description: 'Peace',
    icon: 'join',
  },
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

function ServiceIcon({ icon }: { icon: string }) {
  if (icon === 'list') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 5h4v4H5V5Zm0 5h4v4H5v-4Zm0 5h4v4H5v-4Zm6-9h8v2h-8V6Zm0 5h8v2h-8v-2Zm0 5h8v2h-8v-2Z" fill="currentColor" />
      </svg>
    )
  }

  if (icon === 'media') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 3a5 5 0 0 0-5 5v2H5a2 2 0 0 0-2 2v7h18v-7a2 2 0 0 0-2-2h-2V8a5 5 0 0 0-5-5Zm-3 7V8a3 3 0 1 1 6 0v2H9Zm-4 2h14v5H5v-5Z" fill="currentColor" />
      </svg>
    )
  }

  if (icon === 'gallery') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v10h16V7H4Zm3 8 2.5-3 1.8 2.2L14 11l3 4H7Z" fill="currentColor" />
      </svg>
    )
  }

  if (icon === 'contact') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 3a9 9 0 0 0-9 9v4h4l3 3 3-3h8v-4a9 9 0 0 0-9-9Zm0 2a7 7 0 0 1 7 7v2h-6.8L10 16.2 7.8 14H5v-2a7 7 0 0 1 7-7Z" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4Zm0 2.2 6 3v4.8c0 4-2.6 7.5-6 8.2-3.4-.7-6-4.2-6-8.2V7.2l6-3Zm-1 4.8h2v3h3v2h-3v3h-2v-3H8v-2h3V9Z" fill="currentColor" />
    </svg>
  )
}

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
      <div className="home-police__topbar">
        <div className="home-police__container home-police__brand-row">
          <div className="home-police__brand">
            <img src={pLogo} alt="Sri Lanka Police logo" className="home-police__brand-logo" />
            <h1>SRI LANKA POLICE</h1>
            <img src={sriLankaFlag} alt="Flag of Sri Lanka" className="home-police__brand-flag" />
          </div>
          <span className="home-police__lang">ENGLISH</span>
        </div>
      </div>

      <div className="home-police__container home-police__menu-row">
        <nav className="home-police__menu" aria-label="Primary">
          {primaryMenu.map(item => (
            <button key={item} type="button" className={`home-police__menu-item${item === 'Home' ? ' is-active' : ''}`}>
              {item}
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
        </article>

        <div className="home-police__service-row" aria-label="Quick services">
          {quickServices.map(card => (
            <article key={card.title} className="home-police__service-card">
              <div className="home-police__service-icon">
                <ServiceIcon icon={card.icon} />
              </div>
              <h2>{card.title}</h2>
              <p>{card.subtitle}</p>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
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
    </section>
  )
}
