import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'
import slideOne from '../assets/slider/slide-1.png'
import slideTwo from '../assets/slider/slide-2.png'
import slideThree from '../assets/slider/slide-3.png'
import serviceBg from '../assets/service-bg.jpg'
import policeLogo from '../assets/plogo.png'
import igpImage from '../assets/igp.png'
import NavBar from '../components/NavBar'
import { newsAPI } from '../api'
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

type HomeNewsArticle = {
  id: string
  title: string
  summary: string
  category: string
  publishedAt: string | null
  author: string
  featured: boolean
  pinned: boolean
}

type PublicNewsResponse = {
  success: boolean
  news: HomeNewsArticle[]
  total: number
  limit: number
  offset: number
}

const formatNewsDate = (value: string | null) => {
  if (!value) return 'Recent update'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recent update'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [newsSlides, setNewsSlides] = useState<HomeNewsArticle[]>([])
  const [activeNewsIndex, setActiveNewsIndex] = useState(0)
  const [isNewsLoading, setIsNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex(previous => (previous + 1) % heroSlides.length)
    }, 5000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchNews = async () => {
      try {
        setIsNewsLoading(true)
        setNewsError('')

        const response = await newsAPI.getPublicNews({ limit: 6 })
        const payload = response.data as PublicNewsResponse

        if (!isMounted) return

        const orderedNews = [...(payload.news || [])].sort((left, right) => {
          const leftPriority = (left.featured ? 2 : 0) + (left.pinned ? 1 : 0)
          const rightPriority = (right.featured ? 2 : 0) + (right.pinned ? 1 : 0)

          if (rightPriority !== leftPriority) {
            return rightPriority - leftPriority
          }

          return new Date(right.publishedAt || '').getTime() - new Date(left.publishedAt || '').getTime()
        })

        setNewsSlides(orderedNews)
        setActiveNewsIndex(0)
      } catch (error) {
        if (!isMounted) return

        console.error('Failed to load news for home page:', error)
        setNewsError('Unable to load the latest news right now.')
        setNewsSlides([])
      } finally {
        if (isMounted) {
          setIsNewsLoading(false)
        }
      }
    }

    void fetchNews()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (newsSlides.length < 2) return undefined

    const timer = window.setInterval(() => {
      setActiveNewsIndex(previous => (previous + 1) % newsSlides.length)
    }, 6000)

    return () => {
      window.clearInterval(timer)
    }
  }, [newsSlides.length])

  const goToPrevious = () => {
    setActiveIndex(previous => (previous - 1 + heroSlides.length) % heroSlides.length)
  }

  const goToNext = () => {
    setActiveIndex(previous => (previous + 1) % heroSlides.length)
  }

  const goToPreviousNews = () => {
    setActiveNewsIndex(previous => (previous - 1 + newsSlides.length) % newsSlides.length)
  }

  const goToNextNews = () => {
    setActiveNewsIndex(previous => (previous + 1) % newsSlides.length)
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

      {/* News Slider Section */}
      <div className="home-police__news-wrapper">
        <div className="home-police__container home-police__news-section">
          <div className="home-police__section-head">
            <div>
              <p className="home-police__section-kicker">Public News</p>
              <h2 className="home-police__section-title">Latest updates from the force</h2>
              <p className="home-police__section-subtitle home-police__section-subtitle--news">
                Highlights, advisories, and community updates presented in a rotating news slider.
              </p>
            </div>
          </div>

          <div className="home-police__news-slider" aria-label="Latest news carousel">
            {!isNewsLoading && newsSlides.length > 0 ? (
              <div className="home-police__news-ledger">
                <div className="home-police__news-live">
                  <span className="home-police__news-live-dot" />
                  Live bulletin
                </div>
                <span className="home-police__news-ledger-count">
                  {String(activeNewsIndex + 1).padStart(2, '0')} / {String(newsSlides.length).padStart(2, '0')}
                </span>
              </div>
            ) : null}

            {isNewsLoading ? (
              <article className="home-police__news-card home-police__news-card--loading" aria-live="polite">
                <span className="home-police__news-pill">Loading</span>
                <h3 className="home-police__news-title">Fetching the latest public updates</h3>
                <p className="home-police__news-summary">Please wait while we load the newest news from the public feed.</p>
              </article>
            ) : newsSlides.length > 0 ? (
              <>
                {newsSlides.length > 1 ? (
                  <button
                    type="button"
                    className="home-police__news-arrow is-left"
                    onClick={goToPreviousNews}
                    aria-label="Previous news item"
                  >
                    &#8249;
                  </button>
                ) : null}

                <div className="home-police__news-viewport">
                  <div
                    className="home-police__news-track"
                    style={{ transform: `translateX(-${activeNewsIndex * 100}%)` }}
                  >
                    {newsSlides.map((article, index) => (
                      <article key={article.id} className="home-police__news-card">
                        <div className="home-police__news-card-shell">
                          <div className="home-police__news-card-copy">
                            <div className="home-police__news-pill-row">
                              <span className="home-police__news-pill">{article.category}</span>
                              {article.featured ? <span className="home-police__news-pill home-police__news-pill--accent">Featured</span> : null}
                              {article.pinned ? <span className="home-police__news-pill home-police__news-pill--muted">Pinned</span> : null}
                            </div>

                            <h3 className="home-police__news-title">{article.title}</h3>

                            <p className="home-police__news-summary">
                              {article.summary || 'Stay tuned for the latest public announcement and guidance.'}
                            </p>
                          </div>

                          <aside className="home-police__news-rail" aria-label="News metadata">
                            <span className="home-police__news-rail-label">Bulletin</span>
                            <strong className="home-police__news-rail-value">{String(index + 1).padStart(2, '0')}</strong>
                            <div className="home-police__news-rail-list">
                              <div>
                                <span>Date</span>
                                <strong>{formatNewsDate(article.publishedAt)}</strong>
                              </div>
                              <div>
                                <span>Source</span>
                                <strong>{article.author}</strong>
                              </div>
                              <div>
                                <span>Status</span>
                                <strong>{article.featured ? 'Featured' : article.pinned ? 'Pinned' : 'Update'}</strong>
                              </div>
                            </div>
                          </aside>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                {newsSlides.length > 1 ? (
                  <button
                    type="button"
                    className="home-police__news-arrow is-right"
                    onClick={goToNextNews}
                    aria-label="Next news item"
                  >
                    &#8250;
                  </button>
                ) : null}
              </>
            ) : (
              <article className="home-police__news-card home-police__news-card--empty" aria-live="polite">
                <span className="home-police__news-pill home-police__news-pill--muted">No updates</span>
                <h3 className="home-police__news-title">News will appear here once published</h3>
                <p className="home-police__news-summary">
                  {newsError || 'The public news feed is currently empty. Check back later for announcements.'}
                </p>
              </article>
            )}
          </div>

          {!isNewsLoading && newsSlides.length > 1 ? (
            <div className="home-police__news-dots" role="tablist" aria-label="News slide selector">
              {newsSlides.map((article, index) => (
                <button
                  key={article.id}
                  type="button"
                  className={`home-police__news-dot${index === activeNewsIndex ? ' is-active' : ''}`}
                  onClick={() => setActiveNewsIndex(index)}
                  aria-label={`Show news item ${index + 1}`}
                  aria-selected={index === activeNewsIndex}
                  role="tab"
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Inspector General Section */}
      <div className="home-police__igp-wrapper">
        <div className="home-police__container">
          <div className="home-police__igp-container">
            <div className="home-police__igp-content">
              <div className="home-police__igp-card">
                <div className="home-police__igp-seal">
                  <img src={policeLogo} alt="Sri Lanka Police Logo" className="home-police__igp-logo-img" />
                </div>
                <h3 className="home-police__igp-title">Inspector General of Police</h3>
                <p className="home-police__igp-role">Attorney-at-Law</p>
                <p className="home-police__igp-name">Mr. Priyantha Weerasooriya</p>
                <button type="button" className="home-police__igp-btn" onClick={() => navigate('/igp-profile')}>
                  <span className="home-police__igp-btn-icon">👤</span>
                  Profile
                </button>
              </div>
            </div>
            <div className="home-police__igp-image-section">
              <div className="home-police__igp-image-placeholder">
                <img src={igpImage} alt="Inspector General of Police" className="home-police__igp-photo" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
