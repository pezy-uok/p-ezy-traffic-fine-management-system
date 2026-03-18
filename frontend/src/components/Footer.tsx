import { useEffect, useState } from 'react'
import { footerConfig } from '../config/footer'
import './Footer.css'

function SocialIcon({ label }: { label: string }) {
  const platform = label.toLowerCase()

  if (platform === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="site-footer__social-icon">
        <path d="M14.5 8H16V5h-2c-2.3 0-4 1.7-4 4v2H8v3h2v5h3v-5h2.2l.8-3H13V9c0-.7.3-1 1.5-1Z" fill="currentColor" />
      </svg>
    )
  }

  if (platform === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="site-footer__social-icon">
        <path d="M21.2 7.2c-.2-.8-.9-1.5-1.7-1.7C17.9 5 12 5 12 5s-5.9 0-7.5.5c-.8.2-1.5.9-1.7 1.7C2.3 8.8 2.3 12 2.3 12s0 3.2.5 4.8c.2.8.9 1.5 1.7 1.7 1.6.5 7.5.5 7.5.5s5.9 0 7.5-.5c.8-.2 1.5-.9 1.7-1.7.5-1.6.5-4.8.5-4.8s0-3.2-.5-4.8ZM10 15.3V8.7L15.8 12 10 15.3Z" fill="currentColor" />
      </svg>
    )
  }

  if (platform === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="site-footer__social-icon">
        <path d="M12 7.5A4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 0 0 12 7.5Zm0 7.3A2.8 2.8 0 1 1 12 9.2a2.8 2.8 0 0 1 0 5.6Zm5.3-7.5a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2ZM19.5 9c-.1-1.4-.4-2.6-1.4-3.6S15.9 4.1 14.5 4c-1.6-.1-3.4-.1-5 0-1.4.1-2.6.4-3.6 1.4S4.1 7.1 4 8.5c-.1 1.6-.1 3.4 0 5 .1 1.4.4 2.6 1.4 3.6s2.2 1.3 3.6 1.4c1.6.1 3.4.1 5 0 1.4-.1 2.6-.4 3.6-1.4s1.3-2.2 1.4-3.6c.1-1.6.1-3.4 0-5Zm-1.7 4.4c-.1 1-.3 1.6-.9 2.2s-1.2.8-2.2.9c-1.6.1-3.2.1-4.7 0-1-.1-1.6-.3-2.2-.9s-.8-1.2-.9-2.2c-.1-1.5-.1-3.1 0-4.7.1-1 .3-1.6.9-2.2s1.2-.8 2.2-.9c1.5-.1 3.1-.1 4.7 0 1 .1 1.6.3 2.2.9s.8 1.2.9 2.2c.1 1.6.1 3.2 0 4.7Z" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="site-footer__social-icon">
      <path d="M14.1 10.3 20.7 3h-1.6l-5.7 6.4L8.9 3H3.5l6.9 9.9L3.5 21h1.6l6-6.8L15.9 21h5.4l-7.2-10.7Zm-2.2 2.4-.7-1L5.7 4h2.4l4.5 6.3.7 1 5.8 8.1H17l-5.1-6.7Z" fill="currentColor" />
    </svg>
  )
}

function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 260)
    }

    onScroll()
    window.addEventListener('scroll', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <footer className="site-footer">
        <div className="site-footer__accent" />

        <a
          className="site-footer__gov-logo"
          href="https://www.gov.lk/"
          target="_blank"
          rel="noreferrer"
          aria-label="Government of Sri Lanka"
        >
          <img
            src="/sri-lanka-gov-emblem.svg"
            alt="Government of Sri Lanka emblem"
            loading="lazy"
          />
        </a>

        <div className="site-footer__main">
          <div className="site-footer__container site-footer__grid">
            <section>
              <p className="site-footer__eyebrow">SRI LANKA POLICE</p>
              <h2 className="site-footer__heading">
                {footerConfig.organizationName}
              </h2>
              <p className="site-footer__tag">{footerConfig.organizationTag}</p>
              <p className="site-footer__description">
                {footerConfig.description}
              </p>

              <div className="site-footer__social" aria-label="Social media links">
                {footerConfig.socialLinks.map(link => (
                  <a
                    key={link.label}
                    className="site-footer__social-link"
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                  >
                    <SocialIcon label={link.label} />
                    <span className="site-footer__sr-only">{link.label}</span>
                  </a>
                ))}
              </div>
            </section>

            <section>
              <h3 className="site-footer__title">Related Links</h3>
              <ul className="site-footer__list site-footer__list--related">
                {footerConfig.relatedLinks.map(link => (
                  <li key={link.label} className="site-footer__related-item">
                    <a
                      className="site-footer__link"
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="site-footer__title">Contact Us</h3>
              <address className="site-footer__address">
                {footerConfig.addressLines.map(line => (
                  <span key={line} className="site-footer__address-line">
                    {line}
                  </span>
                ))}
              </address>

              <ul className="site-footer__contacts">
                {footerConfig.emergencyNumbers.map(item => (
                  <li key={item.label} className="site-footer__contact-item">
                    <span className="site-footer__contact-label">{item.label}</span>
                    <span className="site-footer__contact-value">{item.value}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="site-footer__container site-footer__bottom">
          <p className="site-footer__copyright">{footerConfig.copyrightText}</p>
          <div className="site-footer__legal">
            {footerConfig.legalLinks.map(link => (
              <a key={link.label} className="site-footer__legal-link" href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>

      </footer>

      <button
        type="button"
        className={`site-footer__back-to-top${showBackToTop ? ' is-visible' : ''}`}
        aria-label="Back to top"
        onClick={handleBackToTop}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="site-footer__back-to-top-icon">
          <path d="m12 6 7 7-1.6 1.6-4.3-4.3V20h-2.2v-9.7L6.6 14.6 5 13l7-7Z" fill="currentColor" />
        </svg>
      </button>
    </>
  )
}

export default Footer
