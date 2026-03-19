import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import sriLankaFlag from '../assets/Flag_of_Sri_Lanka.png'
import pLogo from '../assets/plogo.png'
import slideOne from '../assets/slider/slide-1.png'
import slideTwo from '../assets/slider/slide-2.png'
import slideThree from '../assets/slider/slide-3.png'
import './Home.css'

const primaryMenu = ['Home', 'About Us', 'Fine Pay', 'Criminal Records', 'Division', 'Downloads', 'Library', 'Survey']

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
            {/* <img src={sriLankaFlag} alt="Flag of Sri Lanka" className="home-police__brand-flag" /> */}
          </div>
          {/* <span className="home-police__lang">ENGLISH</span> */}
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
    </section>
  )
}
